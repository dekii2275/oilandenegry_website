from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.users import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressResponse
from app.api.deps import get_current_user # Hàm bảo vệ (Phải đăng nhập mới dùng được)

router = APIRouter()

# 1. API: Thêm địa chỉ mới
@router.post("/", response_model=AddressResponse)
def create_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logic: Nếu user chọn địa chỉ này là Mặc Định
    # -> Thì phải tìm các địa chỉ cũ và tắt chế độ mặc định đi (để chỉ có 1 cái duy nhất là True)
    if address_in.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    
    new_address = Address(
        **address_in.dict(),
        user_id=current_user.id # Gán địa chỉ này cho chính người đang đăng nhập
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

# 2. API: Lấy danh sách địa chỉ của TÔI
@router.get("/", response_model=List[AddressResponse])
def read_my_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Chỉ lấy địa chỉ có user_id trùng với người đang đăng nhập
    return db.query(Address).filter(Address.user_id == current_user.id).all()

# 3. API: Xóa địa chỉ
@router.delete("/{id}")
def delete_address(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tìm địa chỉ theo ID và phải đúng là của User đó (tránh xóa nhầm của người khác)
    address = db.query(Address).filter(Address.id == id, Address.user_id == current_user.id).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ này")
    
    db.delete(address)
    db.commit()
    return {"message": "Đã xóa địa chỉ thành công"}