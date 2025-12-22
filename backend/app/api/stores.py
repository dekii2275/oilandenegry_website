from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.store import Store
from app.models.product import Product
from app.models.users import User
from app.schemas.store import StorePublicResponse

router = APIRouter()

# GET /api/stores - Xem danh sách tất cả stores (public)
@router.get("/", response_model=List[StorePublicResponse])
def get_stores(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    city: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Customer xem danh sách tất cả stores đã được duyệt và active.
    Chỉ hiển thị stores có is_active=True và owner.is_approved=True
    """
    query = db.query(Store).join(User).filter(
        Store.is_active == True,
        User.is_approved == True,
        User.role == "SELLER"
    )
    
    # Filter theo city nếu có
    if city:
        query = query.filter(Store.city.ilike(f"%{city}%"))
    
    # Search theo tên store
    if search:
        query = query.filter(Store.store_name.ilike(f"%{search}%"))
    
    stores = query.offset(skip).limit(limit).all()
    
    # Đếm số products của mỗi store
    result = []
    for store in stores:
        product_count = db.query(func.count(Product.id)).filter(
            Product.store_id == store.id,
            Product.is_active == True
        ).scalar() or 0
        
        result.append(StorePublicResponse(
            id=store.id,
            store_name=store.store_name,
            store_description=store.store_description,
            phone_number=store.phone_number,
            address=store.address,
            city=store.city,
            district=store.district,
            ward=store.ward,
            created_at=store.created_at,
            product_count=product_count
        ))
    
    return result

# GET /api/stores/{store_id} - Xem chi tiết một store
@router.get("/{store_id}", response_model=StorePublicResponse)
def get_store_detail(
    store_id: int,
    db: Session = Depends(get_db)
):
    """
    Customer xem chi tiết một store
    """
    store = db.query(Store).join(User).filter(
        Store.id == store_id,
        Store.is_active == True,
        User.is_approved == True,
        User.role == "SELLER"
    ).first()
    
    if not store:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy store này hoặc store chưa được kích hoạt"
        )
    
    # Đếm số products
    product_count = db.query(func.count(Product.id)).filter(
        Product.store_id == store.id,
        Product.is_active == True
    ).scalar() or 0
    
    return StorePublicResponse(
        id=store.id,
        store_name=store.store_name,
        store_description=store.store_description,
        phone_number=store.phone_number,
        address=store.address,
        city=store.city,
        district=store.district,
        ward=store.ward,
        created_at=store.created_at,
        product_count=product_count
    )