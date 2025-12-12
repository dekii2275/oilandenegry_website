from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles # Import cái này
from app.api import auth, users, upload 
from app.core.database import engine
from app.models import users as user_model

# Tự động tạo bảng database
users.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Energy Platform API")

app.mount("/static", StaticFiles(directory="static"), name="static")


# Nạp router Auth vào
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])  # <-- Mới
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"]) # <-- Mới

@app.get("/")
def read_root():
    return {"message": "Hệ thống đã sẵn sàng!"}
