from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.users import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.core.config import settings
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cấu hình gửi mail
mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# Hàm mã hóa mật khẩu
def get_password_hash(password):
    return pwd_context.hash(password)

# --- 1. API ĐĂNG KÝ ---
@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # Kiểm tra email trùng
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email này đã tồn tại!")

    # Lưu user mới (is_verified = False)
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="CUSTOMER",
        is_verified=False 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Tạo Token xác thực
    token_data = {"sub": new_user.email, "type": "verification"}
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # Nội dung email
    verify_link = f"http://192.168.1.200:8001/api/auth/verify?token={token}"
    logo_url = "data/img/img_logo.png" 
    banner_url = "https://via.placeholder.com/600x200?text=Welcome+Banner"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Xác thực tài khoản</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <div style="background-color: #1a202c; padding: 20px; text-align: center;">
                <img src="{logo_url}" alt="Energy Platform Logo" style="max-height: 50px;">
            </div>

            <div style="width: 100%;">
                <img src="{banner_url}" alt="Welcome" style="width: 100%; height: auto; display: block;">
            </div>
            
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h2 style="color: #2b6cb0; margin-top: 0;">Xin chào {new_user.full_name},</h2>
                
                <p>Cảm ơn bạn đã đăng ký tham gia <strong>Hệ sinh thái Giao dịch Năng lượng</strong>. Chúng tôi rất vui mừng được chào đón bạn!</p>
                
                <p>Để đảm bảo an toàn và bắt đầu sử dụng các dịch vụ, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_link}" style="background-color: #3182ce; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                        KÍCH HOẠT TÀI KHOẢN NGAY
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    * Link này sẽ hết hạn sau 30 phút.<br>
                    * Nếu nút trên không hoạt động, hãy copy đường dẫn sau vào trình duyệt:
                </p>
                <p style="font-size: 13px; color: #3182ce; word-break: break-all;">
                    {verify_link}
                </p>
            </div>

            <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
                <p>Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email.</p>
                <p>
                    <strong>Energy Trading Platform</strong><br>
                    123 Đường Năng Lượng, Khu Công Nghệ Cao, Việt Nam<br>
                    Hỗ trợ: support@energy-platform.com
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Gửi mail (Chạy ngầm)
    message = MessageSchema(
        subject="Kích hoạt tài khoản Energy Platform",
        recipients=[new_user.email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message)

    return new_user

# --- 2. API XÁC THỰC (Bấm link trong mail) ---
@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if payload.get("type") != "verification":
            raise HTTPException(status_code=400, detail="Token không hợp lệ")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token lỗi hoặc hết hạn")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    if user.is_verified:
        return {"message": "Tài khoản này đã xác thực rồi!"}

    user.is_verified = True
    db.commit()
    return {"message": "Xác thực THÀNH CÔNG! Giờ bạn có thể đăng nhập."}
