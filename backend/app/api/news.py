import os
import time
import json
import newspaper
import google.generativeai as genai
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler # <--- Thư viện lên lịch
from apscheduler.triggers.interval import IntervalTrigger     # <--- Bộ đếm thời gian
from newspaper import Config
from app.core.database import get_db, SessionLocal
from app.models.news import News

router = APIRouter()

# --- 1. CẤU HÌNH GEMINI ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# --- 2. HÀM XỬ LÝ AI ---
def analyze_article_with_gemini(text, original_title):
    # (Giữ nguyên code xử lý AI của bạn ở đây...)
    if not model:
        return None

    prompt = f"""
    Bạn là biên tập viên của trang tin "Z-energy". Hãy phân tích bài báo sau và trả về kết quả dưới dạng JSON.
    KHÔNG trả về markdown (```json), chỉ trả về text thuần của JSON.
    
    Yêu cầu output JSON phải có các trường sau:
    1. "summary": Tóm tắt ngắn gọn (khoảng 3 câu), tập trung vào số liệu.
    2. "category": Chọn 1 trong các mục sau: ["Thị trường năng lượng", "Điện & Hạ tầng", "Dầu khí", "Năng lượng tái tạo", "Công nghệ xanh", "Chính sách"].
    3. "tags": Chuỗi gồm 3-4 từ khóa, cách nhau bằng dấu phẩy (Ví dụ: "giá dầu, OPEC, xăng").
    4. "formatted_content": Viết lại nội dung bài báo dưới dạng Markdown. 
       - Giữ các ý chính và số liệu quan trọng.
       - Chia đoạn rõ ràng, có tiêu đề phụ (##).
       - In đậm (**text**) các con số hoặc tên riêng quan trọng.
       - Độ dài khoảng 400-600 từ.
    
    Tiêu đề gốc: {original_title}
    Nội dung bài báo:
    {text[:8000]}
    """
    
    try:
        response = model.generate_content(prompt)
        json_str = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(json_str)
        return data
    except Exception as e:
        print(f"❌ Lỗi AI hoặc Lỗi JSON: {e}")
        return None

def run_crawler_process():
    """Hàm chạy ngầm: Cào báo -> Hỏi AI -> Lưu DB"""
    print(f"🚀 [AUTO-CRAWL] Bắt đầu tiến trình lúc {datetime.now()}...")
    db = SessionLocal()
    
    url = "https://cafef.vn/hang-hoa-nguyen-lieu.chn"
    
    # --- 1. CẤU HÌNH GIẢ LẬP TRÌNH DUYỆT (Fix lỗi bị chặn) ---
    config = Config()
    config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    config.request_timeout = 10
    
    try:
        # Tải trang web với cấu hình giả lập
        paper = newspaper.build(url, config=config, memoize_articles=False)
        
        # --- DEBUG: In ra số lượng bài tìm thấy ---
        print(f"🔍 DEBUG: Tìm thấy tổng cộng {len(paper.articles)} link bài báo trên trang này.")
        
        if len(paper.articles) == 0:
            print("⚠️ Cảnh báo: Không tìm thấy bài nào. Có thể trang web đã đổi cấu trúc hoặc chặn IP.")
            return

    except Exception as e:
        print(f"❌ Lỗi kết nối đến báo: {e}")
        return

    count_new = 0
    # Thử nới lỏng từ khóa để test xem có bài nào lọt vào không
    keywords = ['dầu', 'xăng', 'điện', 'năng lượng', 'khí', 'gas', 'evn', 'pin', 'xanh', 'giá']
    
    # Tăng giới hạn duyệt lên 10 bài đầu tiên
    for article in paper.articles[:10]:
        try:
            article.download()
            article.parse()
            
            # Debug tiêu đề bài báo đang duyệt
            print(f"👀 Đang xem xét: {article.title}")

            # 1. Lọc từ khóa (Check title lower)
            if not any(k in article.title.lower() for k in keywords):
                print(f"   -> Bỏ qua (Không chứa từ khóa năng lượng)")
                continue

            # 2. Check trùng link gốc
            if db.query(News).filter(News.original_url == article.url).first():
                print(f"   -> Bỏ qua (Đã tồn tại trong DB)")
                continue

            print(f"🤖 Đang xử lý AI bài: {article.title[:20]}...")
            
            ai_data = analyze_article_with_gemini(article.text, article.title)
            
            # Fallback dữ liệu nếu AI lỗi
            summary = ai_data.get("summary", article.text[:200]) if ai_data else article.text[:200]
            content = ai_data.get("formatted_content", article.text) if ai_data else article.text
            category = ai_data.get("category", "Tin tức chung") if ai_data else "Tin tức chung"
            tags = ai_data.get("tags", "") if ai_data else ""
            
            # Lấy ngày (ưu tiên ngày báo, nếu không có lấy ngày giờ hiện tại)
            pub_date = article.publish_date if article.publish_date else datetime.now()

            new_news = News(
                title=article.title,
                slug=f"tin-{int(time.time())}-{count_new}",
                original_url=article.url,
                image_url=article.top_image,
                source="CafeF",
                published_at=pub_date,
                summary=summary,
                content=content,
                category=category,
                tags=tags,
                author="Ban biên tập",
                views=0
            )
            
            db.add(new_news)
            db.commit()
            count_new += 1
            print(f"✅ Đã lưu: {article.title}")
            
            time.sleep(3) # Nghỉ chút
            
        except Exception as e:
            print(f"⚠️ Lỗi bài báo: {e}")
            continue
    
    db.close()
    print(f"🏁 [AUTO-CRAWL] Hoàn tất! Đã thêm {count_new} bài mới.")

# --- 3. CẤU HÌNH SCHEDULER (TỰ ĐỘNG CHẠY) ---
scheduler = BackgroundScheduler()

def start_scheduler():
    """Hàm này sẽ được gọi ở main.py để kích hoạt bộ đếm giờ"""
    # Thêm công việc: Chạy hàm run_crawler_process mỗi 12 tiếng
    scheduler.add_job(
        run_crawler_process, 
        trigger=IntervalTrigger(hours=12), 
        id='crawl_news_job', 
        replace_existing=True
    )
    scheduler.start()
    print("⏰ Đã kích hoạt Scheduler: Tự động cào tin mỗi 12 tiếng.")

# --- 4. API ENDPOINTS ---
@router.post("/crawl-now")
def trigger_crawl(background_tasks: BackgroundTasks):
    """Nút bấm kích hoạt thủ công (nếu không muốn đợi 12 tiếng)"""
    background_tasks.add_task(run_crawler_process)
    return {"message": "Đã bắt đầu thu thập tin tức. Vui lòng đợi 1-2 phút!"}

@router.get("/")
def get_news_list(skip: int = 0, limit: int = 10, category: str = None, db: Session = Depends(get_db)):
    query = db.query(News).filter(News.is_published == True)
    if category:
        query = query.filter(News.category == category)
    news_list = query.order_by(desc(News.published_at)).offset(skip).limit(limit).all()
    return news_list

@router.get("/{slug}")
def get_news_detail(slug: str, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    news.views += 1
    db.commit()
    return news