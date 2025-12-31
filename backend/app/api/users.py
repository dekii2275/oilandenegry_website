from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.users import User
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user
from datetime import datetime
from sqlalchemy.exc import IntegrityError

router = APIRouter()

# --- LOGIC PHỤ TRỢ: KIỂM TRA QUYỀN ADMIN ---
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập tài nguyên này (Yêu cầu quyền ADMIN)"
        )
    return current_user

# --- 1. API ADMIN: Lấy danh sách Users (Có lọc) ---
# Endpoint: GET /api/users/
@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[str] = None,       # Lọc theo Role (Optional)
    is_active: Optional[bool] = None, # Lọc theo trạng thái (Optional)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Lấy danh sách người dùng. Chỉ Admin mới gọi được.
    Hỗ trợ lọc theo role và is_active.
    """
    query = db.query(User)
    
    # Logic lọc động
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
        
    users = query.offset(skip).limit(limit).all()
    return users

# --- 2. API USER: Xem thông tin bản thân ---
# Endpoint: GET /api/users/me
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    API trả về thông tin của chính người đang đăng nhập.
    """
    return current_user

# --- 3. API USER: Cập nhật thông tin bản thân ---
# Endpoint: PUT /api/users/me
@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

# --- 4. API ADMIN: Khóa / Mở khóa tài khoản ---
# Endpoint: PUT /api/users/{user_id}/status
@router.put("/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Không thể tự khóa tài khoản Admin của chính mình!")

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

# --- 5. API ADMIN: Xóa vĩnh viễn user ---
# Endpoint: DELETE /api/users/{user_id}
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Không thể tự xóa tài khoản Admin đang đăng nhập!")

    try:
        db.delete(user)
        db.commit()
        return {"message": "Đã xóa người dùng thành công"}
        
    except IntegrityError:
        db.rollback() # Hoàn tác lệnh xóa vừa rồi
        raise HTTPException(
            status_code=400, 
            detail="Không thể xóa User này vì họ đang có dữ liệu liên kết (Đơn hàng, Cửa hàng, Token...). Vui lòng chọn KHÓA (BAN) tài khoản thay vì xóa."
        )