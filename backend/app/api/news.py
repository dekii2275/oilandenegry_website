import os
import time
import json
import hashlib
import atexit
import newspaper
import google.generativeai as genai
import concurrent.futures
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
# 👇 THÊM or_ VÀO ĐÂY ĐỂ TÌM KIẾM THÔNG MINH
from sqlalchemy import desc, or_
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
# 👇 THÊM CronTrigger ĐỂ CHỈNH GIỜ CHẠY
from apscheduler.triggers.cron import CronTrigger
from newspaper import Config
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.database import get_db, SessionLocal
from app.models.news import News

router = APIRouter()

# --- 1. CẤU HÌNH GEMINI ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None
    print("⚠️ CẢNH BÁO: Chưa cấu hình GEMINI_API_KEY. AI sẽ không hoạt động.")

ALLOWED_CATEGORIES = [
    "Thị trường năng lượng", "Điện & Hạ tầng", "Dầu khí", 
    "Năng lượng tái tạo", "Công nghệ xanh", "Chính sách", "Tin tức chung"
]

SOURCES = [
    "https://petrotimes.vn/nang-luong-viet-nam.html",
    "https://nangluongvietnam.vn/",
    "https://vnexpress.net/tag/nang-luong-19597",
    "https://congthuong.vn/nang-luong-tai-nguyen-c31",
    "https://cafef.vn/hang-hoa-nguyen-lieu.chn"
]

# --- 2. HÀM XỬ LÝ AI ---
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
def analyze_article_with_gemini(text, original_title):
    if not model: return None
    
    prompt = f"""
    Bạn là chuyên gia năng lượng. Hãy phân tích và viết lại bài báo sau dưới dạng Markdown chuyên nghiệp.
    Yêu cầu BẮT BUỘC:
    1. "summary": Tóm tắt ngắn gọn 3 câu chủ chốt.
    2. "category": Chọn chính xác 1 trong các mục: {ALLOWED_CATEGORIES}.
    3. "tags": Chuỗi 3-4 từ khóa.
    4. "formatted_content": Viết lại nội dung chính bài báo. QUAN TRỌNG: Phải chia thành nhiều đoạn văn ngắn (khoảng 3-4 câu/đoạn). Giữa các đoạn văn PHẢI có 2 dấu xuống dòng (\n\n) để tạo khoảng cách. Sử dụng in đậm (**) cho các số liệu quan trọng.

    Tiêu đề gốc: {original_title}
    Nội dung gốc: {text[:5000]}
    """
    try:
        response = model.generate_content(prompt)
        json_str = response.text.strip()
        if json_str.startswith("```"):
            json_str = json_str.strip("`").replace("json\n", "").replace("json", "")
            
        data = json.loads(json_str)
        if data.get("category") not in ALLOWED_CATEGORIES: 
            data["category"] = "Tin tức chung"
        return data
    except Exception as e:
        print(f"   ⚠️ Lỗi Gemini AI: {e}")
        return None

# --- 3. HÀM WORKER ---
def process_single_article(article_url, source_name, config):
    db = SessionLocal()
    keywords = ['dầu', 'xăng', 'điện', 'năng lượng', 'khí', 'gas', 'evn', 'pvn', 'pin', 'giá', 'thầu', 'solar', 'gió']
    
    try:
        # Check trùng URL
        exists = db.query(News).filter(News.original_url == article_url).first()
        if exists: return 0

        # Tải bài báo
        article = newspaper.Article(article_url, config=config)
        try:
            article.download()
            article.parse()
        except Exception: return 0

        if not article.text or len(article.text) < 100: return 0

        # Lọc từ khóa
        if not any(k in article.title.lower() for k in keywords): return 0

        print(f"   ⚡ AI Processing: {article.title[:30]}...")

        # Gọi AI
        ai_data = None
        try:
            ai_data = analyze_article_with_gemini(article.text, article.title)
        except Exception: pass

        # Chuẩn bị dữ liệu
        if ai_data:
            summary = ai_data.get("summary", article.text[:200])
            content = ai_data.get("formatted_content", article.text)
            category = ai_data.get("category", "Tin tức chung")
            tags = ai_data.get("tags", "")
            if isinstance(tags, list): tags = ", ".join(tags)
        else:
            summary = article.text[:300] + "..."
            content = article.text
            category = "Tin tức chung"
            tags = "Năng lượng"

        # Lưu DB
        url_hash = hashlib.md5(article_url.encode()).hexdigest()[:8]
        slug = f"tin-{int(time.time())}-{url_hash}"

        new_news = News(
            title=article.title, slug=slug, original_url=article.url,
            image_url=article.top_image, source=source_name,
            published_at=article.publish_date or datetime.now(),
            summary=summary, content=content, category=category,
            tags=tags, author="Z-Energy Bot", views=0, is_published=True
        )

        try:
            db.add(new_news)
            db.commit()
            print(f"   ✅ SAVED: {article.title[:20]}...")
            return 1
        except IntegrityError:
            db.rollback()
            return 0
    except Exception: return 0
    finally: db.close()

# --- 4. HÀM MAIN ---
def run_crawler_process():
    print(f"\n🚀 [CRAWLER] Bắt đầu lúc {datetime.now()}")
    
    config = Config()
    config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    config.request_timeout = 20
    config.fetch_images = False
    config.memoize_articles = False
    config.headers = {
        'User-Agent': config.browser_user_agent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': '[https://www.google.com/](https://www.google.com/)'
    }

    total_new = 0

    for url in SOURCES:
        try:
            domain = url.split('/')[2]
            try:
                paper = newspaper.build(url, config=config, memoize_articles=False)
            except: continue
            
            # 👇 TĂNG GIỚI HẠN LÊN 8 BÀI ĐỂ LẤY NHIỀU TIN HƠN
            valid_urls = []
            for article in paper.articles:
                if len(valid_urls) >= 8: break
                if len(article.url) > 25 and domain in article.url:
                    valid_urls.append(article.url)
            
            if not valid_urls: continue

            print(f"   📡 {domain}: Tìm thấy {len(valid_urls)} link tiềm năng.")

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = {executor.submit(process_single_article, u, domain, config): u for u in valid_urls}
                for future in concurrent.futures.as_completed(futures):
                    total_new += future.result()
            
        except Exception as e:
            print(f"❌ Lỗi nguồn {url}: {e}")

    print(f"🏁 [CRAWLER] Hoàn tất. Tổng bài mới: {total_new}\n")

# --- 5. SCHEDULER (ĐÃ SỬA GIỜ) ---
scheduler = BackgroundScheduler()

def start_scheduler():
    # 👇 CHẠY ĐÚNG 09:00 VÀ 21:00 HÀNG NGÀY
    trigger = CronTrigger(hour='9,21', minute='0', timezone='Asia/Ho_Chi_Minh')
    
    scheduler.add_job(run_crawler_process, trigger=trigger, id='crawl_news_job', replace_existing=True)
    scheduler.start()
    print("⏰ Scheduler: Đã đặt lịch chạy 09:00 & 21:00.")
    atexit.register(lambda: scheduler.shutdown())

@router.post("/crawl-now")
def trigger_crawl(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_crawler_process)
    return {"message": "Đang chạy Crawler..."}

# --- 6. API LẤY TIN (ĐÃ SỬA SMART SEARCH) ---
@router.get("/")
def get_news_list(
    skip: int = 0, 
    limit: int = 20, 
    category: str = None, 
    db: Session = Depends(get_db)
):
    query = db.query(News).filter(News.is_published == True)
    
    if category and category not in ["ALL", "All", "Tất cả"]:
        # Logic tìm kiếm thông minh: Tìm trong Category HOẶC Tags HOẶC Title
        search_term = category
        if "năng lượng" in category.lower():
            search_term = "năng lượng"
        elif "dầu" in category.lower():
            search_term = "dầu"
        elif "điện" in category.lower():
            search_term = "điện"
            
        query = query.filter(
            or_(
                News.category == category,
                News.category.ilike(f"%{category}%"),
                News.tags.ilike(f"%{search_term}%"),
                News.title.ilike(f"%{search_term}%")
            )
        )
        
    return query.order_by(desc(News.published_at)).offset(skip).limit(limit).all()

@router.get("/{slug}")
def get_news_detail(slug: str, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.slug == slug).first()
    if not news: raise HTTPException(404, "Not found")
    news.views = (news.views or 0) + 1
    db.commit()
    db.refresh(news)
    return news