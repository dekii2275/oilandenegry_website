from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.users import User
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user # Import hàm bảo vệ

router = APIRouter()

# 1. API: Xem thông tin bản thân (Tôi là ai?)
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    API này yêu cầu phải có Token.
    Nó trả về thông tin của chính người đang đăng nhập.
    """
    return current_user

# 2. API: Cập nhật thông tin bản thân
@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Cập nhật từng trường nếu có gửi lên
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    
    # (Bạn có thể thêm phone, address vào Model User nếu cần)
    
    db.commit()
    db.refresh(current_user)
    return current_user