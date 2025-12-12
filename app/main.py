from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from fastapi.middleware.cors import CORSMiddleware # Nhớ thêm cái này để tránh lỗi CORS sau này

# 1. Import Model (đã đặt tên mới là user_model)
from app.models import users as user_model 

# 2. Import API Router (đã đặt tên mới là user_router)
from app.api import users as user_router
from app.api import auth, upload

from app.core.database import engine

# --- SỬA DÒNG NÀY ---
# Dùng "user_model" thay vì "users"
user_model.Base.metadata.create_all(bind=engine) 
# --------------------

app = FastAPI(title="Energy Platform API")

# Cấu hình CORS (Cho phép mọi nơi truy cập - Quan trọng)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- SỬA DÒNG NÀY ---
# Nạp router Auth vào
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Dùng "user_router" thay vì "users"
app.include_router(user_router.router, prefix="/api/users", tags=["Users"]) 
# --------------------

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) 

@app.get("/")
def read_root():
    return {"message": "Hệ thống đã sẵn sàng!"}
