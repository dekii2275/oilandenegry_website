from typing import Generator, Tuple, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.users import User
from app.models.store import Store

# =================================================================
# 1. CẤU HÌNH OAUTH2
# =================================================================
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False 
)

# =================================================================
# 2. HÀM LẤY TOKEN (THÔNG MINH - CONTEXT AWARE)
# =================================================================
def get_token_from_request(
    request: Request,
    token_header: Optional[str] = Depends(reusable_oauth2)
) -> str:
    path = request.url.path
    
    # 👇 [DEBUG] IN RA LOG ĐỂ KIỂM TRA
    print(f"🔍 [DEBUG] Path đang gọi: {path}")
    print(f"🍪 [DEBUG] Cookies hiện có: {request.cookies.keys()}")

    # Logic chọn token
    token = None
    
    # 1. Nếu là đường dẫn Admin
    if path.startswith("/api/admin"):
        print("👉 Logic: Ưu tiên Admin Token")
        token = (
            request.cookies.get("adminToken") or 
            request.cookies.get("accessToken") or 
            request.cookies.get("access_token")
        )
    # 2. Nếu là đường dẫn khác (Seller/User)
    else:
        print("👉 Logic: Ưu tiên Access Token (Seller/User)")
        token = (
            request.cookies.get("accessToken") or 
            request.cookies.get("access_token") or 
            request.cookies.get("token") or
            request.cookies.get("adminToken") # Fallback cuối cùng
        )
    
    # 👇 [DEBUG] TOKEN NÀO ĐƯỢC CHỌN?
    if token:
        print(f"🔑 [DEBUG] Token được chọn (10 ký tự đầu): {token[:10]}...")
    else:
        print("❌ [DEBUG] Không tìm thấy Token nào!")

    # Xử lý chuỗi token
    if token:
        if token.startswith("Bearer "):
            return token.split(" ")[1]
        return token
    
    if token_header:
        return token_header
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không tìm thấy token đăng nhập.",
    )
# =================================================================
# 3. LẤY USER HIỆN TẠI
# =================================================================
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_request) 
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub") 
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == username).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
         raise HTTPException(status_code=400, detail="Tài khoản này đã bị khóa.")
         
    return user

# =================================================================
# 4. PHÂN QUYỀN (Role Check)
# =================================================================

def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền Admin"
        )
    return current_user

def get_current_customer(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chức năng chỉ dành cho Khách hàng"
        )
    return current_user

def get_current_seller(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check Role: Chỉ Seller hoặc Admin (để debug) mới được vào
    if current_user.role != "SELLER" and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chức năng chỉ dành cho Người bán"
        )
    
    # 2. Check Store
    store = db.query(Store).filter(Store.user_id == current_user.id).first()
    
    if not store:
        # Nếu là Admin vào xem mà user này chưa có store -> Báo lỗi nhẹ hoặc xử lý riêng
        if current_user.role == "ADMIN":
             raise HTTPException(status_code=404, detail="User này chưa tạo Store")
             
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bạn chưa có Cửa hàng. Vui lòng đăng ký trước."
        )
    
    # 3. Check Active
    if not store.is_active and current_user.role != "ADMIN":
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cửa hàng đang chờ duyệt hoặc bị khóa."
        )
    
    return current_user, store