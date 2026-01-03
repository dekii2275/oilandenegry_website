from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler 
from app.api import messages as messages_router

# --- IMPORT DATABASE & MODELS ---
from app.core.database import engine, Base # Import Base từ database.py

# 👇 SỬA LẠI KHỐI NÀY: Import trực tiếp từng file (Không qua app.models)
# Mục đích: Để Base nhận diện được các bảng (metadata) trước khi create_all
import app.models.users
import app.models.address
import app.models.store
import app.models.product
import app.models.cart
import app.models.order
import app.models.market
import app.models.review
import app.models.news
import app.models.withdraw # ✅ Đừng quên file mới này

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
    getdatafromyahoo as market_data,
    news
)

from app.api.market_job import analyze_market_task, get_cached_analysis

# --- KHỞI TẠO BẢNG DỮ LIỆU ---
# Vì đã import các file models ở trên, Base.metadata giờ đã chứa đủ thông tin
Base.metadata.create_all(bind=engine) 

# --- CẤU HÌNH LIFESPAN ---
scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 System Starting...")
    if not scheduler.running:
        scheduler.start()
        print("✅ Scheduler Started")

    try:
        # Bỏ qua bước chạy ngay lập tức nếu sợ làm chậm start
        scheduler.add_job(analyze_market_task, 'interval', minutes=120, id="ai_market_analysis", replace_existing=True)
    except Exception as e:
        print(f"⚠️ AI Job Error: {e}")

    try:
        market_data.start_market_scheduler()
        news.start_scheduler()
    except Exception as e:
        print(f"⚠️ Legacy Scheduler Error: {e}")

    yield 

    print("🛑 System Shutting Down...")
    scheduler.shutdown()
    print("✅ Scheduler User Shutdown")


app = FastAPI(title="Energy Platform API", lifespan=lifespan)

# --- CORS ---
origins = [
    "https://zenergy.cloud",
    "http://zenergy.cloud",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001", # Thêm localhost dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- ROUTERS ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix="/api/users", tags=["Users"])
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])
app.include_router(store_router.router, prefix="/api/stores", tags=["Stores"])
app.include_router(seller_router.router, prefix="/api/seller", tags=["Seller"])
app.include_router(product_router.router, prefix="/api/products", tags=["Products"])
app.include_router(cart_router.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders_router.router, prefix="/api/orders", tags=["Orders"])
app.include_router(review_router.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(market_data.router, prefix="/api/market-data", tags=["Market Data"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(messages_router.router, prefix="/api")

# --- AI API ---
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