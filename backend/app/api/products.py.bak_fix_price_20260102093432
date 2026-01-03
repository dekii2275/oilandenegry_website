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
    # Subquery: thống kê review thật theo product_id
    review_stats_sq = (
        db.query(
            Review.product_id.label("product_id"),
            func.count(Review.id).label("review_count"),
            func.avg(Review.rating).label("rating_average"),
        )
        .group_by(Review.product_id)
        .subquery()
    )

    # Query chính: lấy Product + review stats
    query = (
        db.query(
            Product,
            review_stats_sq.c.review_count,
            review_stats_sq.c.rating_average
        )
        .join(Store)
        .outerjoin(review_stats_sq, review_stats_sq.c.product_id == Product.id)
        .filter(Product.is_active == True, Store.is_active == True)
        .options(joinedload(Product.variants), joinedload(Product.store))
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
        query = query.join(Variant).order_by(asc(Variant.price))
    elif sort == "price-desc":
        query = query.join(Variant).order_by(desc(Variant.price))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at))
    else:
        query = query.order_by(desc(Product.id))

    # Lấy dữ liệu phân trang
    rows = query.offset(skip).limit(limit).all()

    # --- Map dữ liệu trả về ---
    results: List[ProductListResponse] = []

    # 👇 ĐÃ SỬA: Thụt đầu dòng vào trong hàm def get_products
    for p, real_review_count, real_rating_average in rows:
        first_variant = p.variants[0] if p.variants else None
        price = float(first_variant.price) if first_variant and first_variant.price is not None else 0.0
        market_price = float(first_variant.market_price) if first_variant and first_variant.market_price is not None else 0.0

        safe_slug = p.slug or f"product-{p.id}"

        results.append(ProductListResponse(
            id=p.id,
            name=p.name,
            slug=safe_slug,
            category=p.category,
            description=p.description,
            price=price,
            market_price=market_price,
            image_url=p.image_url,
            rating_average=float(real_rating_average or 0.0),
            review_count=int(real_review_count or 0),
            store_name=p.store.store_name if p.store else "Unknown",
            is_active=p.is_active
        ))

    # 👇 ĐÃ SỬA: return nằm ngang hàng với for (ngoài vòng lặp, trong hàm)
    return results


@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.variants), joinedload(Product.store))
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    first_variant = product.variants[0] if product.variants else None
    price = float(first_variant.price) if first_variant and first_variant.price is not None else 0.0
    market_price = float(first_variant.market_price) if first_variant and first_variant.market_price is not None else 0.0

    # ✅ review thật từ bảng reviews
    cnt, avg = (
        db.query(func.count(Review.id), func.avg(Review.rating))
        .filter(Review.product_id == product_id)
        .first()
    )

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "category": product.category,
        "description": product.description,
        "price": price,
        "market_price": market_price,
        "image_url": product.image_url,
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