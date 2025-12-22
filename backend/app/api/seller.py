from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Tuple
from decimal import Decimal

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.models.product import Product, Variant
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    VariantCreate, VariantUpdate, VariantResponse
)
from app.api.deps import get_current_seller

router = APIRouter()

# ========== PRODUCT APIs ==========

# POST /api/seller/products - Tạo product mới
@router.post("/products", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller tạo product mới cho store của mình
    """
    current_user, store = current_user_store
    
    new_product = Product(
        store_id=store.id,
        name=product_in.name,
        description=product_in.description,
        category=product_in.category,
        is_active=product_in.is_active
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product

# GET /api/seller/products - Xem danh sách products của mình
@router.get("/products", response_model=List[ProductResponse])
def get_my_products(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Seller xem danh sách tất cả products của store mình
    """
    current_user, store = current_user_store
    
    products = db.query(Product).filter(
        Product.store_id == store.id
    ).offset(skip).limit(limit).all()
    
    return products

# GET /api/seller/products/{product_id} - Xem chi tiết product
@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_detail(
    product_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller xem chi tiết một product của mình
    """
    current_user, store = current_user_store
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
    return product

# PUT /api/seller/products/{product_id} - Cập nhật product
@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller cập nhật thông tin product
    """
    current_user, store = current_user_store
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
    # Cập nhật từng trường nếu có
    if product_in.name is not None:
        product.name = product_in.name
    if product_in.description is not None:
        product.description = product_in.description
    if product_in.category is not None:
        product.category = product_in.category
    if product_in.is_active is not None:
        product.is_active = product_in.is_active
    
    db.commit()
    db.refresh(product)
    
    return product

# DELETE /api/seller/products/{product_id} - Xóa product
@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller xóa product (sẽ xóa luôn tất cả variants)
    """
    current_user, store = current_user_store
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
    # Kiểm tra xem có variant nào đang trong cart hoặc order không
    # (Có thể thêm logic kiểm tra phức tạp hơn nếu cần)
    
    db.delete(product)
    db.commit()
    
    return {"message": "Đã xóa product thành công"}

# ========== VARIANT APIs ==========

# POST /api/seller/products/{product_id}/variants - Tạo variant mới
@router.post("/products/{product_id}/variants", response_model=VariantResponse)
def create_variant(
    product_id: int,
    variant_in: VariantCreate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller tạo variant mới cho một product
    """
    current_user, store = current_user_store
    
    # Kiểm tra product thuộc về store của seller
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
    # Kiểm tra SKU trùng (nếu có)
    if variant_in.sku:
        existing_variant = db.query(Variant).filter(Variant.sku == variant_in.sku).first()
        if existing_variant:
            raise HTTPException(
                status_code=400,
                detail=f"SKU '{variant_in.sku}' đã tồn tại"
            )
    
    new_variant = Variant(
        product_id=product_id,
        name=variant_in.name,
        sku=variant_in.sku,
        price=variant_in.price,
        stock=variant_in.stock,
        is_active=variant_in.is_active
    )
    
    db.add(new_variant)
    db.commit()
    db.refresh(new_variant)
    
    return new_variant

# GET /api/seller/variants/{variant_id} - Xem chi tiết variant
@router.get("/variants/{variant_id}", response_model=VariantResponse)
def get_variant_detail(
    variant_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller xem chi tiết một variant
    """
    current_user, store = current_user_store
    
    variant = db.query(Variant).join(Product).filter(
        Variant.id == variant_id,
        Product.store_id == store.id
    ).first()
    
    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy variant này hoặc không thuộc store của bạn"
        )
    
    return variant

# PUT /api/seller/variants/{variant_id} - Cập nhật variant
@router.put("/variants/{variant_id}", response_model=VariantResponse)
def update_variant(
    variant_id: int,
    variant_in: VariantUpdate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller cập nhật variant (giá, stock, SKU, ...)
    """
    current_user, store = current_user_store
    
    variant = db.query(Variant).join(Product).filter(
        Variant.id == variant_id,
        Product.store_id == store.id
    ).first()
    
    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy variant này hoặc không thuộc store của bạn"
        )
    
    # Kiểm tra SKU trùng (nếu có thay đổi)
    if variant_in.sku and variant_in.sku != variant.sku:
        existing_variant = db.query(Variant).filter(
            Variant.sku == variant_in.sku,
            Variant.id != variant_id
        ).first()
        if existing_variant:
            raise HTTPException(
                status_code=400,
                detail=f"SKU '{variant_in.sku}' đã tồn tại"
            )
    
    # Cập nhật từng trường
    if variant_in.name is not None:
        variant.name = variant_in.name
    if variant_in.sku is not None:
        variant.sku = variant_in.sku
    if variant_in.price is not None:
        variant.price = variant_in.price
    if variant_in.stock is not None:
        variant.stock = variant_in.stock
    if variant_in.is_active is not None:
        variant.is_active = variant_in.is_active
    
    db.commit()
    db.refresh(variant)
    
    return variant

# DELETE /api/seller/variants/{variant_id} - Xóa variant
@router.delete("/variants/{variant_id}")
def delete_variant(
    variant_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller xóa variant
    Lưu ý: Nếu variant đang có trong cart hoặc order, có thể cần xử lý đặc biệt
    """
    current_user, store = current_user_store
    
    variant = db.query(Variant).join(Product).filter(
        Variant.id == variant_id,
        Product.store_id == store.id
    ).first()
    
    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy variant này hoặc không thuộc store của bạn"
        )
    
    # TODO: Có thể thêm kiểm tra variant có đang trong cart/order không
    
    db.delete(variant)
    db.commit()
    
    return {"message": "Đã xóa variant thành công"}

# GET /api/seller/products/{product_id}/variants - Xem tất cả variants của một product
@router.get("/products/{product_id}/variants", response_model=List[VariantResponse])
def get_product_variants(
    product_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Seller xem tất cả variants của một product
    """
    current_user, store = current_user_store
    
    # Kiểm tra product thuộc về store
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
    variants = db.query(Variant).filter(Variant.product_id == product_id).all()
    
    return variants