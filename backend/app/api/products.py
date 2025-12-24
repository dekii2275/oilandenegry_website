from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.product import Product, Variant
from app.models.store import Store
from app.models.users import User
from app.schemas.product import ProductPublicResponse, VariantPublicResponse
from app.models.review import Review
from sqlalchemy import func

router = APIRouter()

# GET /api/products - Xem danh sách tất cả products (public)
@router.get("/", response_model=List[ProductPublicResponse])
def get_products(
    db: Session = Depends(get_db),
    store_id: Optional[int] = Query(None, description="Filter theo store_id"),
    category: Optional[str] = Query(None, description="Filter theo category"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên sản phẩm"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Customer xem danh sách tất cả products từ các stores đã được duyệt.
    Chỉ hiển thị products active từ stores active và approved.
    """
    query = db.query(Product).join(Store).join(User).filter(
        Product.is_active == True,
        Store.is_active == True,
        User.is_approved == True,
        User.role == "SELLER"
    )
    
    # Filter theo store_id
    if store_id:
        query = query.filter(Product.store_id == store_id)
    
    # Filter theo category
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    
    # Search theo tên
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        # Lấy variants active và có stock > 0
        variants = db.query(Variant).filter(
            Variant.product_id == product.id,
            Variant.is_active == True,
            Variant.stock > 0
        ).all()
        
        # Chỉ hiển thị product nếu có ít nhất 1 variant available
        if variants:
            variant_responses = [
                VariantPublicResponse(
                    id=v.id,
                    product_id=v.product_id,
                    name=v.name,
                    price=v.price,
                    stock=v.stock,
                    is_active=v.is_active
                ) for v in variants
            ]
            
            result.append(ProductPublicResponse(
                id=product.id,
                store_id=product.store_id,
                store_name=product.store.store_name,
                name=product.name,
                description=product.description,
                category=product.category,
                created_at=product.created_at,
                variants=variant_responses
            ))
    
    return result

# GET /api/stores/{store_id}/products - Xem products của một store cụ thể
@router.get("/stores/{store_id}/products", response_model=List[ProductPublicResponse])
def get_store_products(
    store_id: int,
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Customer xem danh sách products của một store cụ thể
    """
    # Kiểm tra store tồn tại và active
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
    
    query = db.query(Product).filter(
        Product.store_id == store_id,
        Product.is_active == True
    )
    
    # Filter theo category
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    
    # Search theo tên
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        # Lấy variants active và có stock
        variants = db.query(Variant).filter(
            Variant.product_id == product.id,
            Variant.is_active == True,
            Variant.stock > 0
        ).all()
        
        if variants:
            variant_responses = [
                VariantPublicResponse(
                    id=v.id,
                    product_id=v.product_id,
                    name=v.name,
                    price=v.price,
                    stock=v.stock,
                    is_active=v.is_active
                ) for v in variants
            ]
            
            result.append(ProductPublicResponse(
                id=product.id,
                store_id=product.store_id,
                store_name=store.store_name,
                name=product.name,
                description=product.description,
                category=product.category,
                created_at=product.created_at,
                variants=variant_responses
            ))
    
    return result

# GET /api/products/{product_id} - Xem chi tiết một product
@router.get("/{product_id}", response_model=ProductPublicResponse)
def get_product_detail(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Customer xem chi tiết một product (kèm tất cả variants)
    """
    product = db.query(Product).join(Store).join(User).filter(
        Product.id == product_id,
        Product.is_active == True,
        Store.is_active == True,
        User.is_approved == True,
        User.role == "SELLER"
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này"
        )
    
    # Lấy tất cả variants active (kể cả stock = 0 để hiển thị "hết hàng")
    variants = db.query(Variant).filter(
        Variant.product_id == product_id,
        Variant.is_active == True
    ).all()
    
    
    stats = db.query(
        func.avg(Review.rating).label("average_rating"),
        func.count(Review.id).label("review_count")
    ).filter(Review.product_id == product_id).first()

    variant_responses = [
        VariantPublicResponse(
            id=v.id,
            product_id=v.product_id,
            name=v.name,
            price=v.price,
            stock=v.stock,
            is_active=v.is_active
        ) for v in variants
    ]
    
    return ProductPublicResponse(
        id=product.id,
        store_id=product.store_id,
        store_name=product.store.store_name,
        name=product.name,
        description=product.description,
        category=product.category,
        created_at=product.created_at,
        variants=variant_responses,
        average_rating=stats.average_rating or 0,
        review_count=stats.review_count or 0
    )