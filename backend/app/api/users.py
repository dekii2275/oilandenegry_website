from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store  # 👈 Import thêm Store
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user

router = APIRouter()

# --- SCHEMA ĐĂNG KÝ SELLER (Định nghĩa tạm ở đây cho gọn) ---
class SellerRegistrationRequest(BaseModel):
    store_name: str
    store_description: str
    phone_number: str
    address: str
    city: str
    district: str
    ward: str
    business_license: str
    tax_code: str

# =================================================================
# 👇 1. API ĐĂNG KÝ SELLER (ĐẶT LÊN TRÊN CÙNG ĐỂ TRÁNH LỖI 405)
# =================================================================
@router.post("/register-seller", response_model=UserResponse)
async def register_seller(
    store_info: SellerRegistrationRequest,
    current_user: User = Depends(get_current_user), # Yêu cầu login
    db: Session = Depends(get_db)
):
    # 1. Check Role: Chỉ Customer mới được đăng ký
    if current_user.role != "CUSTOMER":
        raise HTTPException(status_code=400, detail="Chỉ tài khoản Customer mới được đăng ký làm Seller")
    
    # 2. Check đã có shop chưa
    existing_store = db.query(Store).filter(Store.user_id == current_user.id).first()
    if existing_store:
        raise HTTPException(status_code=400, detail="Bạn đã đăng ký Seller rồi (đang chờ duyệt hoặc đã duyệt)")

    # 3. Tạo Store mới
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
        is_active=False # Chờ admin duyệt
    )
    db.add(new_store)
    
    # 4. Update trạng thái User (Pending Approval)
    # Lưu ý: Vẫn giữ role là CUSTOMER cho đến khi Admin duyệt
    current_user.is_approved = False
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

# =================================================================
# 👇 2. CÁC API USER CƠ BẢN (ME)
# =================================================================

# Endpoint: GET /api/users/me
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    API trả về thông tin của chính người đang đăng nhập.
    """
    return current_user

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

# =================================================================
# 👇 3. CÁC API ADMIN (QUẢN LÝ USER)
# =================================================================

# Logic phụ trợ: Kiểm tra quyền Admin
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập tài nguyên này (Yêu cầu quyền ADMIN)"
        )
    return current_user

# Endpoint: GET /api/users/
@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[str] = None,       
    is_active: Optional[bool] = None, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
        
    users = query.offset(skip).limit(limit).all()
    return users

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
        db.rollback() 
        raise HTTPException(
            status_code=400, 
            detail="Không thể xóa User này vì họ đang có dữ liệu liên kết. Vui lòng chọn KHÓA (BAN) tài khoản."
        )