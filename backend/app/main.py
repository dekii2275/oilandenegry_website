from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler 

# --- IMPORT DATABASE & MODELS ---
from app.core.database import engine
# Import tất cả models để SQLAlchemy tạo bảng
from app.models import (
    users as user_model,
    address as address_model,
    store as store_model,
    product as product_model,
    cart as cart_model,
    order as order_model,
    market as market_model,
    review as review_model,
    news as news_model
)

# --- IMPORT ROUTERS ---
from app.api import (
    auth, 
    upload,
    users as user_router,
    address as address_router,
    admin as admin_router,
    cart as cart_router,
    orders as orders_router,
    seller as seller_router,
    stores as store_router,
    products as product_router,
    reviews as review_router,
    getdatafromyahoo as market_data, # Router cũ
    news # Router cũ
)

# --- IMPORT AI SERVICE ---
from app.api.market_job import analyze_market_task, get_cached_analysis

# --- KHỞI TẠO BẢNG DỮ LIỆU ---
# (Lệnh này sẽ tạo bảng nếu chưa có, dựa trên metadata của user_model và các model đã import)
user_model.Base.metadata.create_all(bind=engine) 

# --- CẤU HÌNH LIFESPAN (QUẢN LÝ KHỞI ĐỘNG & TẮT) ---
# Khởi tạo Scheduler toàn cục
scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🟢 1. STARTUP: Chạy khi Server bắt đầu
    print("🚀 System Starting...")
    
    # --- A. Khởi động Scheduler ---
    if not scheduler.running:
        scheduler.start()
        print("✅ Scheduler Started")

    # --- B. Lên lịch các Job ---
    
    # Job 1: AI Analysis (Chạy ngay lập tức 1 lần + Lặp mỗi 2 tiếng)
    try:
        print("🤖 Running initial AI Analysis...")
        await analyze_market_task() # Chạy thử 1 lần
        
        # Thêm vào lịch trình
        scheduler.add_job(
            analyze_market_task, 
            'interval', 
            minutes=120, 
            id="ai_market_analysis", 
            replace_existing=True
        )
        print("✅ AI Job Scheduled (Every 120 mins)")
    except Exception as e:
        print(f"⚠️ AI Job Error: {e}")

    # Job 2: Market Data & News (Task cũ)
    # Lưu ý: Nếu trong các file này tự tạo scheduler riêng, hãy cân nhắc refactor sau này.
    try:
        market_data.start_market_scheduler() # Giả sử hàm này không block main thread
        news.start_scheduler()
    except Exception as e:
        print(f"⚠️ Legacy Scheduler Error: {e}")

    yield # 👇 Tại đây ứng dụng sẽ chạy và nhận request

    # 🔴 2. SHUTDOWN: Chạy khi Server tắt (Ctrl+C)
    print("🛑 System Shutting Down...")
    scheduler.shutdown()
    print("✅ Scheduler User Shutdown")


# --- KHỞI TẠO APP ---
app = FastAPI(
    title="Energy Platform API",
    lifespan=lifespan # 👈 Gắn lifespan vào đây
)

# --- CẤU HÌNH CORS ---
origins = [
    "https://zenergy.cloud",
    "http://zenergy.cloud",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # 👈 Quan trọng cho Login/Register
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STATIC FILES ---
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- GẮN ROUTER ---
# Authentication & User
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) # Chứa logic Register Seller
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"])

# Admin & Management
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"]) # Đã fix lỗi router
app.include_router(store_router.router, prefix="/api/stores", tags=["Stores"])
app.include_router(seller_router.router, prefix="/api/seller", tags=["Seller"]) # API cũ (nếu còn dùng)

# E-commerce Logic
app.include_router(product_router.router, prefix="/api/products", tags=["Products"])
app.include_router(cart_router.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders_router.router, prefix="/api/orders", tags=["Orders"])
app.include_router(review_router.router, prefix="/api/reviews", tags=["Reviews"])

# Utilities & Data
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(market_data.router, prefix="/api/market-data", tags=["Market Data"])
app.include_router(news.router, prefix="/api/news", tags=["News"])

# --- API AI ANALYSIS RIÊNG ---
@app.get("/api/market/analysis", tags=["AI Analysis"])
def get_ai_market_analysis():
    return get_cached_analysis()

@app.post("/api/market/analysis/trigger", tags=["AI Analysis"])
async def trigger_ai_analysis():
    await analyze_market_task() 
    return {"message": "Đã kích hoạt phân tích AI thủ công thành công!"}

@app.get("/")
def read_root():
    return {"message": "Hệ thống Energy Platform đã sẵn sàng!"}