import logging
import yfinance as yf
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

# Import DB & Models
from app.core.database import get_db, SessionLocal
from app.models.market import MarketPrice

router = APIRouter()
logger = logging.getLogger(__name__)

# --- 1. HÀM CHẠY NGẦM (WORKER) ---
def update_market_data():
    """
    Hàm này chạy ngầm mỗi 15 phút.
    Nhiệm vụ: Gọi Yahoo Finance -> Lưu vào DB.
    """
    logger.info(f"START: Cập nhật giá thị trường lúc {datetime.now()}")
    
    # Tự tạo session riêng cho luồng chạy ngầm
    db = SessionLocal()
    
    tickers = {
        "brent": "BZ=F",  
        "wti": "CL=F",    
        "gas": "NG=F",    
        "solar": "TAN"    
    }
    
    try:
        count = 0
        for key_name, symbol in tickers.items():
            try:
                # Gọi Yahoo Finance
                ticker = yf.Ticker(symbol)
                history = ticker.history(period="5d") # Lấy 5 ngày để chắc chắn có dữ liệu
                
                if len(history) < 2:
                    continue
                
                current_price = history['Close'].iloc[-1]
                prev_close = history['Close'].iloc[-2]
                change_amount = current_price - prev_close
                change_percent = (change_amount / prev_close) * 100
                status = "up" if change_amount >= 0 else "down"
                
                # Lưu vào DB (Insert dòng mới để giữ lịch sử)
                new_record = MarketPrice(
                    name=key_name.upper(),
                    symbol=symbol,
                    price=round(current_price, 2),
                    change=round(change_amount, 2),
                    percent=round(change_percent, 2),
                    status=status,
                    updated_at=datetime.now()
                )
                db.add(new_record)
                count += 1
                
            except Exception as e:
                logger.error(f"Lỗi khi lấy mã {key_name}: {e}")
                continue
        
        db.commit()
        logger.info(f"DONE: Đã cập nhật thành công {count} mã.")
        
    except Exception as e:
        logger.error(f"CRITICAL ERROR trong update_market_data: {e}")
        db.rollback()
    finally:
        db.close() # Rất quan trọng: Phải đóng session

# --- 2. CẤU HÌNH SCHEDULER ---
scheduler = BackgroundScheduler()

def start_market_scheduler():
    # Thêm job chạy mỗi 15 phút
    scheduler.add_job(
        update_market_data,
        trigger=IntervalTrigger(minutes=15),
        id='market_price_job',
        replace_existing=True
    )
    # Nếu scheduler chưa chạy thì mới start (tránh start 2 lần)
    if not scheduler.running:
        scheduler.start()
        logger.info("⏰ Market Scheduler đã được kích hoạt (15 phút/lần).")

    # Đăng ký tắt scheduler khi ứng dụng dừng
    atexit.register(lambda: scheduler.shutdown())

# --- 3. API ENDPOINT (CHỈ ĐỌC DB) ---
@router.get("/")
async def get_market_data(db: Session = Depends(get_db)):
    """
    API này giờ siêu nhanh vì chỉ đọc từ Database.
    Nó lấy ra bản ghi MỚI NHẤT của từng loại hàng hóa.
    """
    try:
        # Logic SQL: Lấy các dòng có ID lớn nhất ứng với từng Name
        # (Đây là kỹ thuật lấy 'Latest Record per Group')
        
        # Bước 1: Tìm ID lớn nhất cho mỗi loại hàng hóa
        subquery = (
            db.query(func.max(MarketPrice.id))
            .group_by(MarketPrice.name)
            .subquery()
        )
        
        # Bước 2: Query lấy dữ liệu chi tiết dựa trên các ID đó
        latest_prices = (
            db.query(MarketPrice)
            .filter(MarketPrice.id.in_(subquery))
            .all()
        )
        
        return {"data": latest_prices}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --- 4. API KÍCH HOẠT THỦ CÔNG (Cho Admin) ---
@router.post("/refresh-now")
async def force_refresh():
    """API để bạn ép hệ thống cập nhật ngay lập tức (không cần đợi 15p)"""
    update_market_data()
    return {"message": "Đã chạy cập nhật dữ liệu thành công!"}