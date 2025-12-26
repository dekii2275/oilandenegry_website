from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.store import Store
from app.models.product import Product
from app.models.review import Review  # <--- Import thêm bảng Review
from app.models.users import User

router = APIRouter()

# --- SCHEMA ---
class StorePublicResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    rating: float = 0.0               # Rating này sẽ là rating TÍNH TOÁN
    
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    
    created_at: Optional[datetime] = None
    product_count: int = 0

    class Config:
        from_attributes = True

# GET /api/stores
@router.get("/", response_model=List[StorePublicResponse])
def get_stores(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None
):
    # 1. Lấy danh sách Store active
    query = db.query(Store).filter(Store.is_active == True)
    
    if search:
        query = query.filter(Store.store_name.ilike(f"%{search}%"))
    
    # Lấy danh sách store trước
    stores = query.offset(skip).limit(limit).all()
    
    result = []
    for store in stores:
        # 2. LOGIC TÍNH RATING "HỢP LÝ"
        # Rating Store = Trung bình cộng rating của tất cả Review thuộc các Product của Store đó
        avg_rating = db.query(func.avg(Review.rating))\
                       .join(Product, Review.product_id == Product.id)\
                       .filter(Product.store_id == store.id)\
                       .scalar()
        
        # Nếu chưa có review nào thì mặc định 0 hoặc 5 (tùy bạn chọn, ở đây để 0 cho thật)
        final_rating = round(avg_rating, 1) if avg_rating else 0.0

        # 3. Đếm số lượng sản phẩm
        product_count = db.query(func.count(Product.id)).filter(
            Product.store_id == store.id,
            Product.is_active == True
        ).scalar() or 0
        
        result.append(StorePublicResponse(
            id=store.id,
            name=store.store_name,
            description=store.store_description,
            rating=final_rating,  # <--- Dùng giá trị vừa tính toán
            phone_number=store.phone_number,
            address=store.address,
            city=store.city,
            district=store.district,
            ward=store.ward,
            created_at=store.created_at,
            product_count=product_count
        ))
    
    # Sắp xếp kết quả: Store nào rating cao xếp trước (Python sort)
    result.sort(key=lambda x: x.rating, reverse=True)
    
    return result

# GET /api/stores/{store_id}
@router.get("/{store_id}", response_model=StorePublicResponse)
def get_store_detail(
    store_id: int,
    db: Session = Depends(get_db)
):
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.is_active == True
    ).first()
    
    if not store:
        raise HTTPException(status_code=404, detail="Không tìm thấy store này")
    
    # Tính Rating thật
    avg_rating = db.query(func.avg(Review.rating))\
                   .join(Product, Review.product_id == Product.id)\
                   .filter(Product.store_id == store.id)\
                   .scalar()
    
    final_rating = round(avg_rating, 1) if avg_rating else 0.0

    product_count = db.query(func.count(Product.id)).filter(
        Product.store_id == store.id,
        Product.is_active == True
    ).scalar() or 0
    
    return StorePublicResponse(
        id=store.id,
        name=store.store_name,
        description=store.store_description,
        rating=final_rating, # <--- Rating thật
        phone_number=store.phone_number,
        address=store.address,
        city=store.city,
        district=store.district,
        ward=store.ward,
        created_at=store.created_at,
        product_count=product_count
    )