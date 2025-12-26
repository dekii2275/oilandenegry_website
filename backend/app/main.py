from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware

# --- 1. IMPORT MODELS (Để tạo bảng Database) ---
# Import để SQLAlchemy nhận diện được các bảng
from app.models import users as user_model 
from app.models import address as address_model
from app.models import store as store_model
from app.models import product as product_model
from app.models import cart as cart_model
from app.models import order as order_model
from app.models import market as market_model
from app.models import review as review_model
from app.models import news as news_model # <-- Thêm model tin tức

from app.core.database import engine

# --- 2. IMPORT ROUTERS (Logic API) ---
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

# Import các file có chạy ngầm (Scheduler)
from app.api import getdatafromyahoo # <-- File mới sửa (Thay cho getdatafromyahoo)
from app.api import news # <-- File cào báo

# --- 3. KHỞI TẠO BẢNG DATABASE ---
# Chỉ cần import models bên trên, lệnh này sẽ tạo tất cả các bảng chưa tồn tại
user_model.Base.metadata.create_all(bind=engine) 

# --- 4. KHỞI TẠO APP ---
app = FastAPI(title="Energy Platform API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình thư mục static
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- 5. GẮN CÁC ROUTER VÀO HỆ THỐNG ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) 
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) 
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"]) 
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])

# Market Data & News
app.include_router(getdatafromyahoo.router, prefix="/api/market-data", tags=["Market Data"])
app.include_router(news.router, prefix="/api/news", tags=["News"]) # <-- Thêm router tin tức

# E-commerce
app.include_router(cart_router.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders_router.router, prefix="/api/orders", tags=["Orders"])
app.include_router(seller_router.router, prefix="/api/seller", tags=["Seller"])
app.include_router(store_router.router, prefix="/api/stores", tags=["Stores"])
app.include_router(product_router.router, prefix="/api/products", tags=["Products"])
app.include_router(review_router.router, prefix="/api/reviews", tags=["Reviews"])

# --- 6. SỰ KIỆN KHỞI ĐỘNG (QUAN TRỌNG NHẤT) ---
@app.on_event("startup")
def startup_event():
    """
    Hàm này chạy 1 lần duy nhất khi Server khởi động.
    Dùng để kích hoạt các tác vụ chạy ngầm.
    """
    print("⏳ Đang khởi động các tác vụ nền...")
    
    # 1. Kích hoạt cập nhật giá thị trường (15 phút/lần)
    try:
        market_data.start_market_scheduler()
        print("✅ Market Scheduler: ON")
    except Exception as e:
        print(f"❌ Market Scheduler lỗi: {e}")

    # 2. Kích hoạt cào báo (12 tiếng/lần)
    try:
        news.start_scheduler()
        print("✅ News Scheduler: ON")
    except Exception as e:
        print(f"❌ News Scheduler lỗi: {e}")

# --- 7. ROOT ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "Hệ thống Energy Platform đã sẵn sàng!"}