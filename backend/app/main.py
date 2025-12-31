from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler # <--- 1. Import Scheduler

# --- IMPORT MODELS ---
from app.models import users as user_model 
from app.models import address as address_model
from app.models import store as store_model
from app.models import product as product_model
from app.models import cart as cart_model
from app.models import order as order_model
from app.models import market as market_model
from app.models import review as review_model
from app.models import news as news_model

from app.core.database import engine

# --- IMPORT ROUTERS ---
from app.api import auth, upload
from app.api import users as user_router
from app.api import address as address_router
from app.api import admin as admin_router
from app.api import cart as cart_router
from app.api import orders as orders_router
from app.api import seller as seller_router
from app.api import stores as store_router
from app.api import products as product_router
from app.api import reviews as review_router

# Import các file chạy ngầm cũ
from app.api import getdatafromyahoo as market_data
from app.api import news

# --- 2. IMPORT SERVICE AI MỚI ---
# Đảm bảo bạn đã tạo file app/services/market_job.py như bước trước
from app.api.market_job import analyze_market_task, get_cached_analysis

# --- KHỞI TẠO BẢNG ---
user_model.Base.metadata.create_all(bind=engine) 

# --- KHỞI TẠO APP ---
app = FastAPI(title="Energy Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- GẮN CÁC ROUTER ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) 
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) 
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"]) 
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])
app.include_router(market_data.router, prefix="/api/market-data", tags=["Market Data"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(cart_router.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders_router.router, prefix="/api/orders", tags=["Orders"])
app.include_router(seller_router.router, prefix="/api/seller", tags=["Seller"])
app.include_router(store_router.router, prefix="/api/stores", tags=["Stores"])
app.include_router(product_router.router, prefix="/api/products", tags=["Products"])
app.include_router(review_router.router, prefix="/api/reviews", tags=["Reviews"])

# --- 3. API MỚI CHO AI ANALYSIS ---

# API 1: Lấy kết quả phân tích (Frontend gọi cái này)
@app.get("/api/market/analysis", tags=["AI Analysis"])
def get_ai_market_analysis():
    return get_cached_analysis()

# API 2: Ép chạy phân tích ngay lập tức (Dùng để TEST)
@app.post("/api/market/analysis/trigger", tags=["AI Analysis"])
async def trigger_ai_analysis():
    await analyze_market_task() # Chạy ngay lập tức
    return {"message": "Đã kích hoạt phân tích AI thủ công thành công!"}


# --- 4. SỰ KIỆN KHỞI ĐỘNG ---
# Khởi tạo scheduler riêng cho app (nếu các module kia chưa có scheduler chung)
scheduler = BackgroundScheduler()

@app.on_event("startup")
async def startup_event():
    print("⏳ Đang khởi động các tác vụ nền...")
    
    # --- Task cũ ---
    try:
        market_data.start_market_scheduler()
    except Exception as e:
        print(f"❌ Market Scheduler lỗi: {e}")

    try:
        news.start_scheduler()
    except Exception as e:
        print(f"❌ News Scheduler lỗi: {e}")

    # --- Task AI Mới (Quan trọng) ---
    try:
        print("🤖 Đang khởi động AI Analyst...")
        
        # 1. Chạy ngay 1 lần khi bật Server để có dữ liệu luôn (không phải chờ 2 tiếng)
        await analyze_market_task()
        
        # 2. Lên lịch chạy mỗi 2 tiếng (120 phút)
        scheduler.add_job(analyze_market_task, 'interval', minutes=120)
        scheduler.start()
        
        print("✅ AI Analyst Scheduler: ON (Chạy mỗi 120 phút)")
    except Exception as e:
        print(f"❌ AI Scheduler lỗi: {e}")

@app.get("/")
def read_root():
    return {"message": "Hệ thống Energy Platform đã sẵn sàng!"}