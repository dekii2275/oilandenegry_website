from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.users import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, PasswordResetConfirm, EmailSchema, SellerRegistrationRequest
from app.core.config import settings
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.models.users import User, Token  # Thêm Token vào import
from app.models.store import Store  # Thêm import
from app.api.deps import get_current_user  # Thêm import


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

# Hàm kiểm tra mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Hàm tạo access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)  # Token hết hạn sau 24 giờ
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

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
    domain = "http://13.212.128.129:8001"
    # domain = "http://localhost:8000" 
    verify_link = f"{domain}/api/auth/verify?token={token}"
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


# API dang nhap
@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """
    API này nhận Email + Password.
    Nếu đúng -> Trả về Token.
    Nếu sai -> Báo lỗi 400.
    """
    
    # B1: Tìm xem email có trong kho không?
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
    
    # B2: Kiểm tra mật khẩu
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
    
    # B3: Kiểm tra xem đã xác thực email chưa?
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Tài khoản chưa kích hoạt. Vui lòng kiểm tra email!")
    
    # B4: Nếu là SELLER, kiểm tra đã được admin duyệt chưa?
    if user.role == "SELLER" and not user.is_approved:
        raise HTTPException(
            status_code=403, 
            detail="Tài khoản Nhà bán hàng của bạn đang chờ Admin duyệt. Vui lòng đợi thông báo qua email!"
        )

    # B5: Cấp Token
    access_token = create_access_token(
        data={
            "sub": user.email, 
            "id": user.id,
            "role": user.role
        }
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

#api quen mat khau
@router.post("/forgot-password")
async def forgot_password(
    data: EmailSchema, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Tìm xem email có tồn tại không
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Để bảo mật thì không nên báo lỗi, nhưng test thì cứ báo lỗi 404 cho dễ biết
        raise HTTPException(status_code=404, detail="Email này chưa đăng ký hệ thống!")

    # 2. Tạo Token đặc biệt (chỉ sống 15 phút)
    token_data = {
        "sub": user.email, 
        "type": "reset_password" 
    }
    expire = datetime.utcnow() + timedelta(minutes=15)
    token = jwt.encode({**token_data, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # 3. Tạo link Reset
    # Thay IP này bằng IP Server AWS của bạn
    domain = "http://13.212.128.129:8001"
    # domain = "http://localhost:8000" 
    reset_link = f"{domain}/reset-password.html?token={token}"

    # In ra terminal để debug nếu email không gửi được
    print(f"DEBUG - RESET LINK: {reset_link}")

    # 4. Nội dung Email
    html = f"""
    <h3>Yêu cầu đặt lại mật khẩu</h3>
    <p>Xin chào {user.full_name},</p>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu. Hãy bấm vào link dưới đây:</p>
    <a href="{reset_link}" style="padding: 10px 20px; background: #3182ce; color: white; text-decoration: none; border-radius: 5px;">ĐẶT LẠI MẬT KHẨU</a>
    <p>Link hết hạn sau 15 phút.</p>
    <p>Link dự phòng: {reset_link}</p>
    """

    # 5. Gửi Mail (Chạy ngầm)
    message = MessageSchema(
        subject="[Energy Platform] Đặt lại mật khẩu",
        recipients=[user.email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "Email hướng dẫn đã được gửi. Vui lòng kiểm tra hộp thư!"}

# --- 5. API ĐẶT LẠI MẬT KHẨU (Đã update kiểm tra trùng khớp) ---
@router.post("/reset-password")
def reset_password(
    data: PasswordResetConfirm, 
    db: Session = Depends(get_db)
):
    # --- THÊM ĐOẠN KIỂM TRA NÀY ---
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400, 
            detail="Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại."
        )
    # ------------------------------

    # 1. Giải mã Token
    try:
        payload = jwt.decode(data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "reset_password":
            raise HTTPException(status_code=400, detail="Token không hợp lệ")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Token lỗi hoặc đã hết hạn")

    # 2. Tìm user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    # 3. Hash mật khẩu mới và Lưu
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Mật khẩu đã được đổi thành công! Hãy đăng nhập lại."}

# --- API ĐĂNG KÝ SELLER (Customer đăng ký làm Seller) ---
@router.post("/register-seller", response_model=UserResponse)
async def register_seller(
    store_info: SellerRegistrationRequest,
    current_user: User = Depends(get_current_user),  # Yêu cầu đăng nhập
    db: Session = Depends(get_db)
):
    """
    API để Customer đăng ký làm Seller.
    Yêu cầu:
    - Phải đăng nhập (có token)
    - Phải là CUSTOMER
    - Chưa có store nào
    - Cập nhật thông tin cửa hàng
    - Chuyển role thành SELLER và chờ admin duyệt
    """
    # Kiểm tra user phải là CUSTOMER
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=400, 
            detail="Chỉ tài khoản Customer mới có thể đăng ký làm Seller!"
        )
    
    # Kiểm tra user đã có store chưa
    existing_store = db.query(Store).filter(Store.user_id == current_user.id).first()
    if existing_store:
        raise HTTPException(
            status_code=400,
            detail="Bạn đã đăng ký làm Seller rồi!"
        )
    
    # Tạo Store mới
    new_store = Store(
        user_id=current_user.id,
        store_name=store_info.store_name,
        store_description=store_info.store_description,
        phone_number=store_info.phone_number,
        address=store_info.address,
        city=store_info.city,
        district=store_info.district,
        ward=store_info.ward,
        business_license=store_info.business_license,
        tax_code=store_info.tax_code,
        is_active=False  # Chưa active cho đến khi admin duyệt
    )
    db.add(new_store)
    
    # Cập nhật role của user thành SELLER và is_approved = False
    # current_user.role = "SELLER"
    current_user.is_approved = False  # Chờ admin duyệt
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
