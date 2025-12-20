from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware

# --- 1. IMPORT MODELS (Để tạo bảng Database) ---
from app.models import users as user_model 
from app.models import address as address_model # <-- Mới
from app.models import store as store_model  # Thêm import
from app.core.database import engine

# --- 2. IMPORT ROUTERS (Logic API) ---
from app.api import auth, upload
from app.api import users as user_router
from app.api import address as address_router # <-- Mới
from app.api import getdatafromyahoo as market_data_router
from app.api import admin as admin_router  # Thêm import

# --- 3. KHỞI TẠO BẢNG DATABASE ---
# Lệnh này sẽ tự động tạo bảng nếu chưa có (users, addresses...)
user_model.Base.metadata.create_all(bind=engine) 
address_model.Base.metadata.create_all(bind=engine)
store_model.Base.metadata.create_all(bind=engine)  # Thêm dòng này

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

# --- 5. GẮN CÁC ROUTER VÀO HỆ THỐNG ---
# Auth: Đăng ký, Đăng nhập, Quên mật khẩu
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# User: Xem profile, Cập nhật thông tin
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) 

# Upload: Upload ảnh
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) 

# Address: Thêm, Sửa, Xóa địa chỉ (QUAN TRỌNG: Bạn đang thiếu dòng này)
app.include_router(address_router.router, prefix="/api/users/addresses", tags=["Addresses"]) 
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])  # Thêm router admin

# Market Data: Lấy dữ liệu thị trường
app.include_router(market_data_router.router, prefix="/api/market-data", tags=["Market Data"])

# --- 6. ROOT ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "Hệ thống Energy Platform đã sẵn sàng!"}