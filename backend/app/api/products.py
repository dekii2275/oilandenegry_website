from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc
from typing import List, Optional, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.models.product import Product, Variant, ProductImage
from app.models.store import Store
from app.models.review import Review

router = APIRouter()

# --- 1. SCHEMA ---
# Định nghĩa nhanh schema để output dữ liệu gọn gàng
class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: float = 0
    market_price: float = 0
    image_url: Optional[str] = None
    rating_average: float = 0.0
    review_count: int = 0
    store_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- 2. API ENDPOINT ---
@router.get("/", response_model=List[ProductListResponse])
def get_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort: Optional[str] = None # price-asc, price-desc, newest
):
    # Bắt đầu truy vấn từ bảng Product
    # join(Store) để đảm bảo Store còn hoạt động
    # options(joinedload(...)) để nạp trước dữ liệu quan hệ (tối ưu SQL)
    query = db.query(Product).join(Store).filter(
        Product.is_active == True,
        Store.is_active == True
    ).options(
        joinedload(Product.variants),
        joinedload(Product.store)
    )

    # --- Lọc theo Search ---
    if search:
        search_term = f"%{search}%"
        query = query.filter(Product.name.ilike(search_term))

    # --- Lọc theo Category ---
    if category and category != "Tất cả":
        query = query.filter(Product.category == category)

    # --- Sắp xếp ---
    if sort == "price-asc":
        # Sắp xếp theo giá của biến thể đầu tiên (hơi phức tạp trong SQL thuần, nhưng logic tạm ở đây)
        # Để đơn giản cho demo, ta sort theo ID hoặc rating trước
        query = query.join(Variant).order_by(asc(Variant.price))
    elif sort == "price-desc":
        query = query.join(Variant).order_by(desc(Variant.price))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at))
    else:
        # Mặc định sắp xếp cái nào mới nhất lên đầu
        query = query.order_by(desc(Product.id))

    # Lấy dữ liệu phân trang
    products = query.offset(skip).limit(limit).all()

    # --- Map dữ liệu trả về ---
    results = []
    for p in products:
        # Lấy giá từ biến thể đầu tiên (nếu có)
        first_variant = p.variants[0] if p.variants else None
        price = first_variant.price if first_variant else 0
        market_price = first_variant.market_price if first_variant else 0

        results.append(ProductListResponse(
            id=p.id,
            name=p.name,
            slug=p.slug,
            category=p.category,
            description=p.description,
            price=float(price),
            market_price=float(market_price),
            image_url=p.image_url,
            rating_average=p.rating_average or 0.0,
            review_count=p.review_count or 0,
            store_name=p.store.store_name if p.store else "Unknown",
            is_active=p.is_active
        ))

    return results

@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Nạp dữ liệu liên quan
    # SQLAlchemy tự động lazy load variants, store, images nên ko cần join thủ công ở đây nếu ko cần filter
    return product