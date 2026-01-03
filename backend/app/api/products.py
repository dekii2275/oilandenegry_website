from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.product import Product
from app.models.store import Store
from app.models.review import Review

router = APIRouter()

# --- 1. SCHEMA ---
class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
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
    sort: Optional[str] = None  # price-asc, price-desc, newest
):
    review_stats_sq = (
        db.query(
            Review.product_id.label("product_id"),
            func.count(Review.id).label("review_count"),
            func.avg(Review.rating).label("rating_average"),
        )
        .group_by(Review.product_id)
        .subquery()
    )

    query = (
        db.query(
            Product,
            review_stats_sq.c.review_count,
            review_stats_sq.c.rating_average
        )
        .join(Store)
        .outerjoin(review_stats_sq, review_stats_sq.c.product_id == Product.id)
        .filter(Product.is_active == True, Store.is_active == True)
        # ✅ Load thêm Product.images để lấy ảnh từ bảng phụ nếu image_url chính bị trống
        .options(joinedload(Product.store), joinedload(Product.images)) 
    )

    if search:
        search_term = f"%{search}%"
        query = query.filter(Product.name.ilike(search_term))

    if category and category != "Tất cả":
        query = query.filter(Product.category == category)

    if sort == "price-asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price-desc":
        query = query.order_by(desc(Product.price))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at))
    else:
        query = query.order_by(desc(Product.id))

    rows = query.offset(skip).limit(limit).all()

    results: List[ProductListResponse] = []
    for prod, real_review_count, real_rating_average in rows:
        safe_slug = prod.slug or f"product-{prod.id}"
        
        # ✅ FIX LỖI ẢNH: Ưu tiên bảng chính, nếu không có thì lấy ảnh đầu tiên trong bảng phụ
        display_image = prod.image_url
        if not display_image and prod.images:
            display_image = prod.images[0].image_url

        results.append(ProductListResponse(
            id=prod.id,
            name=prod.name,
            slug=safe_slug,
            category=prod.category,
            description=prod.description,
            price=float(prod.price or 0),
            market_price=float(prod.market_price or 0),
            image_url=display_image, # Sử dụng ảnh đã được kiểm tra logic
            rating_average=float(real_rating_average or 0.0),
            review_count=int(real_review_count or 0),
            store_name=prod.store.store_name if prod.store else "Unknown",
            is_active=prod.is_active
        ))

    return results


@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        # ✅ Load thêm Product.images để lấy toàn bộ ảnh gallery
        .options(joinedload(Product.store), joinedload(Product.images))
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cnt, avg = (
        db.query(func.count(Review.id), func.avg(Review.rating))
        .filter(Review.product_id == product_id)
        .first()
    )

    # ✅ FIX LỖI ẢNH: Xử lý tương tự cho trang chi tiết
    display_image = product.image_url
    if not display_image and product.images:
        display_image = product.images[0].image_url

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "category": product.category,
        "description": product.description,
        "price": float(product.price or 0),
        "market_price": float(product.market_price or 0),
        "image_url": display_image,
        # Trả thêm list gallery ảnh cho frontend hiển thị slider ảnh sản phẩm
        "images": [img.image_url for img in product.images], 
        "rating_average": float(avg or 0.0),
        "review_count": int(cnt or 0),
        "store_id": product.store_id,
        "store_name": product.store.store_name if product.store else None,
        "unit": product.unit,
        "brand": product.brand,
        "origin": product.origin,
        "warranty": product.warranty,
        "is_active": product.is_active,
        "specifications": product.specifications or {},
        "tags": product.tags or [],
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }