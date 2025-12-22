import os
import time
import json
import hashlib
import atexit
import newspaper
import google.generativeai as genai
import concurrent.futures  # Thư viện xử lý đa luồng
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from newspaper import Config
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.database import get_db, SessionLocal
from app.models.news import News

router = APIRouter()

# --- 1. CẤU HÌNH GEMINI ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

# --- DANH SÁCH CATEGORY ---
ALLOWED_CATEGORIES = [
    "Thị trường năng lượng", "Điện & Hạ tầng", "Dầu khí", 
    "Năng lượng tái tạo", "Công nghệ xanh", "Chính sách", "Tin tức chung"
]

# --- DANH SÁCH NGUỒN BÁO (Tránh bị phụ thuộc 1 nguồn) ---
SOURCES = [
    "https://petrotimes.vn/nang-luong-viet-nam.html",      # Chuyên ngành Dầu khí
    "https://nangluongvietnam.vn/",                         # Tạp chí Năng lượng
    "https://vnexpress.net/tag/nang-luong-19597",           # VnExpress
    "https://congthuong.vn/nang-luong-tai-nguyen-c31",      # Báo Công Thương
    "https://cafef.vn/hang-hoa-nguyen-lieu.chn"             # CafeF (Giữ lại làm backup)
]

# --- 2. HÀM XỬ LÝ AI ---
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
def analyze_article_with_gemini(text, original_title):
    if not model: return None
    
    prompt = f"""
    Phân tích bài báo năng lượng sau và trả về JSON (không markdown).
    Yêu cầu:
    1. "summary": Tóm tắt 3 câu có số liệu.
    2. "category": Chọn 1: {ALLOWED_CATEGORIES}.
    3. "tags": 3-4 từ khóa.
    4. "formatted_content": Viết lại dạng Markdown, in đậm số liệu, có tiêu đề phụ ##.
    
    Tiêu đề: {original_title}
    Nội dung: {text[:6000]}
    """
    try:
        response = model.generate_content(prompt)
        json_str = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(json_str)
        if data.get("category") not in ALLOWED_CATEGORIES: data["category"] = "Tin tức chung"
        return data
    except Exception:
        raise

# --- 3. HÀM WORKER (Xử lý 1 bài báo trong luồng riêng) ---
def process_single_article(article, source_name):
    """Hàm này chạy song song, tự quản lý DB Session riêng"""
    db = SessionLocal()
    keywords = ['dầu', 'xăng', 'điện', 'năng lượng', 'khí', 'gas', 'evn', 'pvn', 'pin', 'giá', 'thầu']
    
    try:
        # 1. Check trùng URL trong DB TRƯỚC khi download (Tiết kiệm thời gian cực lớn)
        # Lưu ý: Cần check chính xác url hoặc check tương đối
        if db.query(News).filter(News.original_url == article.url).first():
            return 0 # Bỏ qua

        # 2. Download & Parse
        try:
            article.download()
            article.parse()
        except Exception:
            return 0 

        # 3. Lọc từ khóa
        if not any(k in article.title.lower() for k in keywords):
            return 0

        print(f"⚡ [Thread] Đang xử lý AI: {article.title[:30]}...")

        # 4. Gọi AI
        try:
            ai_data = analyze_article_with_gemini(article.text, article.title)
        except Exception as e:
            print(f"   ⚠️ AI lỗi: {e}")
            ai_data = None

        # 5. Chuẩn bị dữ liệu
        summary = ai_data.get("summary", article.text[:200]) if ai_data else article.text[:200]
        content = ai_data.get("formatted_content", article.text) if ai_data else article.text
        category = ai_data.get("category", "Tin tức chung") if ai_data else "Tin tức chung"
        tags = ai_data.get("tags", "") if ai_data else ""
        pub_date = article.publish_date if article.publish_date else datetime.now()
        
        # Tạo slug unique
        url_hash = hashlib.md5(article.url.encode()).hexdigest()[:8]
        slug = f"tin-{int(time.time())}-{url_hash}"

        # 6. Lưu DB
        new_news = News(
            title=article.title, slug=slug, original_url=article.url,
            image_url=article.top_image, source=source_name, published_at=pub_date,
            summary=summary, content=content, category=category,
            tags=tags, author="Z-Energy Bot", views=0
        )

        try:
            db.add(new_news)
            db.commit()
            print(f"   ✅ Đã thêm: {article.title[:30]}")
            return 1
        except IntegrityError:
            db.rollback()
            return 0
            
    except Exception as e:
        print(f"❌ Lỗi worker: {e}")
        return 0
    finally:
        db.close() # Quan trọng: Phải đóng session của luồng này

# --- 4. HÀM MAIN (Orchestrator) ---
def run_crawler_process():
    print(f"🚀 [AUTO-CRAWL] Bắt đầu lúc {datetime.now()}...")
    
    config = Config()
    config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    config.request_timeout = 15
    
    total_new = 0

    # Duyệt qua từng nguồn báo
    for url in SOURCES:
        try:
            domain = url.split('/')[2] # Lấy tên miền làm source (vd: vnexpress.net)
            print(f"📡 Đang quét nguồn: {domain}...")
            
            paper = newspaper.build(url, config=config, memoize_articles=False)
            
            # Lọc bớt link rác (ngắn quá hoặc không có http)
            valid_articles = [a for a in paper.articles if a.url and len(a.url) > 20][:6] # Lấy tối đa 6 bài mỗi nguồn
            
            if not valid_articles:
                print(f"   ⚠️ Không tìm thấy bài ở {domain}")
                continue

            # --- CHẠY ĐA LUỒNG CHO NGUỒN NÀY ---
            # Max workers = 3 để tránh bị chặn IP của từng báo
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = {executor.submit(process_single_article, article, domain): article for article in valid_articles}
                
                for future in concurrent.futures.as_completed(futures):
                    total_new += future.result()
            
        except Exception as e:
            print(f"❌ Lỗi nguồn {url}: {e}")

    print(f"🏁 [AUTO-CRAWL] Hoàn tất! Tổng cộng đã thêm {total_new} bài mới.")

# --- 5. SCHEDULER & API ---
scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(run_crawler_process, trigger=IntervalTrigger(hours=12), id='crawl_news_job', replace_existing=True)
    scheduler.start()
    print("⏰ Scheduler activated.")
    atexit.register(lambda: scheduler.shutdown())

@router.post("/crawl-now")
def trigger_crawl(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_crawler_process)
    return {"message": "Đang chạy đa luồng đa nguồn..."}

@router.get("/")
def get_news_list(skip: int = 0, limit: int = 10, category: str = None, db: Session = Depends(get_db)):
    query = db.query(News).filter(News.is_published == True)
    if category and category in ALLOWED_CATEGORIES:
        query = query.filter(News.category == category)
    return query.order_by(desc(News.published_at)).offset(skip).limit(limit).all()

@router.get("/{slug}")
def get_news_detail(slug: str, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.slug == slug).first()
    if not news: raise HTTPException(404, "Not found")
    try:
        news.views += 1
        db.commit()
    except: db.rollback()
    return news