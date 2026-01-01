from typing import Generator, Tuple, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.users import User
from app.models.store import Store

# 👇 SỬA Ở ĐÂY: Gán cứng đường dẫn thay vì dùng settings.API_V1_STR để tránh lỗi
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login/access-token", # Đã sửa thành đường dẫn cụ thể
    auto_error=False 
)

# 👇 HÀM QUAN TRỌNG NHẤT: Lấy token từ Cookie hoặc Header
def get_token_from_request(
    request: Request,
    token_header: str = Depends(reusable_oauth2)
) -> str:
    # 1. Ưu tiên lấy từ Cookie (Frontend Next.js gửi cái này)
    token_cookie = (
        request.cookies.get("accessToken") or 
        request.cookies.get("access_token") or 
        request.cookies.get("token") or
        request.cookies.get("adminToken") # 👈 THÊM DÒNG NÀY (Quan trọng nhất)
    )
    if token_cookie:
        # Nếu cookie có dạng "Bearer <token>", ta cần cắt chữ Bearer đi
        if token_cookie.startswith("Bearer "):
            return token_cookie.split(" ")[1]
        return token_cookie
    
    # 2. Nếu không có Cookie, thử lấy từ Header (Swagger UI gửi cái này)
    if token_header:
        return token_header
        
    # 3. Nếu không có cả hai -> Báo lỗi
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không tìm thấy thông tin đăng nhập (Token missing)",
    )

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_request) 
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Lấy thông tin user từ token (thường là email hoặc id)
        username: str = payload.get("sub") 
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Tìm user trong DB
    # (Nếu logic login của bạn lưu ID vào 'sub' thì đổi thành filter(User.id == ...))
    user = db.query(User).filter(User.email == username).first()
    
    if user is None:
        raise credentials_exception
        
    return user

# Dependency để kiểm tra user có phải Admin không
def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Admin mới có quyền truy cập"
        )
    return current_user

def get_current_customer(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Customer mới có quyền truy cập"
        )
    return current_user

def get_current_seller(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check Role
    if current_user.role != "SELLER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Seller mới có quyền truy cập"
        )
    
    # 2. Check Store
    store = db.query(Store).filter(
        Store.user_id == current_user.id,
    ).first()
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bạn chưa có Store. Vui lòng tạo cửa hàng trước."
        )
    
    return current_user, store