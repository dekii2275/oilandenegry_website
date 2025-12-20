from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.api.deps import get_current_admin
from app.schemas.store import SellerWithStoreResponse, StoreResponse
from app.schemas.user import UserResponse

router = APIRouter()

# --- API LẤY DANH SÁCH SELLER CHỜ DUYỆT ---
@router.get("/sellers/pending", response_model=List[SellerWithStoreResponse])
def get_pending_sellers(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API để Admin xem danh sách các Seller đang chờ duyệt.
    Trả về danh sách các user có role="SELLER" và is_approved=False
    """
    pending_sellers = db.query(User).filter(
        User.role == "SELLER",
        User.is_approved == False
    ).all()
    
    result = []
    for seller in pending_sellers:
        store = db.query(Store).filter(Store.user_id == seller.id).first()
        seller_data = {
            "id": seller.id,
            "email": seller.email,
            "full_name": seller.full_name,
            "role": seller.role,
            "is_verified": seller.is_verified,
            "is_approved": seller.is_approved,
            "created_at": seller.created_at,
            "store": StoreResponse.from_orm(store) if store else None
        }
        result.append(SellerWithStoreResponse(**seller_data))
    
    return result

# --- API XEM CHI TIẾT SELLER ---
@router.get("/sellers/{seller_id}", response_model=SellerWithStoreResponse)
def get_seller_detail(
    seller_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API để Admin xem chi tiết thông tin của một Seller
    """
    seller = db.query(User).filter(
        User.id == seller_id,
        User.role == "SELLER"
    ).first()
    
    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Seller này"
        )
    
    store = db.query(Store).filter(Store.user_id == seller.id).first()
    
    seller_data = {
        "id": seller.id,
        "email": seller.email,
        "full_name": seller.full_name,
        "role": seller.role,
        "is_verified": seller.is_verified,
        "is_approved": seller.is_approved,
        "created_at": seller.created_at,
        "store": StoreResponse.from_orm(store) if store else None
    }
    
    return SellerWithStoreResponse(**seller_data)

# --- API DUYỆT SELLER ---
@router.put("/sellers/{seller_id}/approve", response_model=UserResponse)
def approve_seller(
    seller_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API để Admin duyệt một Seller.
    Khi duyệt:
    - is_approved = True
    - store.is_active = True
    """
    seller = db.query(User).filter(
        User.id == seller_id,
        User.role == "SELLER"
    ).first()
    
    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Seller này"
        )
    
    if seller.is_approved:
        raise HTTPException(
            status_code=400,
            detail="Seller này đã được duyệt rồi"
        )
    
    # Duyệt seller
    seller.is_approved = True
    
    # Kích hoạt store
    store = db.query(Store).filter(Store.user_id == seller.id).first()
    if store:
        store.is_active = True
    
    db.commit()
    db.refresh(seller)
    
    # TODO: Gửi email thông báo cho seller đã được duyệt
    
    return seller

# --- API TỪ CHỐI SELLER ---
@router.put("/sellers/{seller_id}/reject", response_model=dict)
def reject_seller(
    seller_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API để Admin từ chối một Seller.
    Khi từ chối:
    - Chuyển role về CUSTOMER
    - Xóa store (hoặc giữ lại nhưng không active)
    - is_approved = False
    """
    seller = db.query(User).filter(
        User.id == seller_id,
        User.role == "SELLER"
    ).first()
    
    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Seller này"
        )
    
    # Chuyển về CUSTOMER
    seller.role = "CUSTOMER"
    seller.is_approved = False
    
    # Xóa hoặc vô hiệu hóa store
    store = db.query(Store).filter(Store.user_id == seller.id).first()
    if store:
        store.is_active = False
        # Hoặc xóa store: db.delete(store)
    
    db.commit()
    
    # TODO: Gửi email thông báo cho seller bị từ chối
    
    return {
        "message": f"Đã từ chối đăng ký Seller của {seller.email}. Tài khoản đã được chuyển về CUSTOMER."
    }
