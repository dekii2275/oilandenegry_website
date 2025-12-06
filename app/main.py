from fastapi import FastAPI
from app.core.database import engine
from app.models import users
from app.api import auth

# Tự động tạo bảng database
users.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Energy Platform API")

# Nạp router Auth vào
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": "Hệ thống đã sẵn sàng!"}
