from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware

# --- 1. IMPORT MODELS (Để tạo bảng Database) ---
from app.models import users as user_model 
from app.models import address as address_model
from app.models import store as store_model
from app.models import product as product_model
from app.models import cart as cart_model
from app.models import order as order_model
from app.models import news as news_model  # <-- (MỚI) Import model tin tức
from app.core.database import engine

# --- 2. IMPORT ROUTERS (Logic API) ---
from app.api import auth, upload
from app.api import users as user_router
from app.api import address as address_router
from app.api import getdatafromyahoo as market_data_router
from app.api import admin as admin_router
from app.api import cart as cart_router
from app.api import orders as orders_router
from app.api import seller as seller_router
from app.api import newsletter as newsletter_router
from app.api import stores as store_router
from app.api import products as product_router

# (QUAN TRỌNG) Import router và hàm khởi động Scheduler từ file news
from app.api.news import router as news_router, start_scheduler 

# --- 3. KHỞI TẠO BẢNG DATABASE ---
# Lệnh này sẽ tự động tạo bảng nếu chưa có
user_model.Base.metadata.create_all(bind=engine) 
address_model.Base.metadata.create_all(bind=engine)
store_model.Base.metadata.create_all(bind=engine)
product_model.Base.metadata.create_all(bind=engine)
cart_model.Base.metadata.create_all(bind=engine)
order_model.Base.metadata.create_all(bind=engine)
news_model.Base.metadata.create_all(bind=engine) # <-- (MỚI) Tạo bảng news

# --- 4. KHỞI TẠO APP ---
app = FastAPI(title="Energy Platform API")

# Cấu hình CORS (Chấp nhận mọi kết nối từ Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình thư mục chứa ảnh tĩnh (Avatar, Product Image...)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- 5. SỰ KIỆN KHỞI ĐỘNG (STARTUP EVENT) ---
# Đoạn này sẽ chạy 1 lần duy nhất khi Server bật lên
@app.on_event("startup")
def startup_event():
    # Kích hoạt bộ đếm giờ tự động cào tin tức (Scheduler)
    start_scheduler()

# --- 6. GẮN CÁC ROUTER VÀO HỆ THỐNG ---
# Auth & User
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) 
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"]) 
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) 

# E-commerce Logic
app.include_router(store_router.router, prefix="/api/stores", tags=["Stores"])
app.include_router(product_router.router, prefix="/api/products", tags=["Products"])
app.include_router(cart_router.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders_router.router, prefix="/api/orders", tags=["Orders"])
app.include_router(seller_router.router, prefix="/api/seller", tags=["Seller"])

# Data & News
app.include_router(market_data_router.router, prefix="/api/market-data", tags=["Market Data"])
app.include_router(newsletter_router.router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(news_router, prefix="/api/news", tags=["News"]) # <-- (MỚI) API Tin tức

# Admin
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])


# --- 7. ROOT ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "Hệ thống Energy Platform đã sẵn sàng!"}