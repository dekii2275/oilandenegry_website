from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Tuple, Optional

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
# 👇 Thêm ProductImage vào import
from app.models.product import Product, Variant, ProductImage
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    VariantCreate, VariantUpdate, VariantResponse
)
from app.api.deps import get_current_seller
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import SellerOrderSummary, SellerOrderItemResponse

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
    Seller tạo product mới (kèm ảnh Gallery và thông tin chi tiết)
    """
    current_user, store = current_user_store
    
    # 1. Tạo Product với đầy đủ các trường mới
    new_product = Product(
        store_id=store.id,
        name=product_in.name,
        description=product_in.description,
        category=product_in.category,
        brand=product_in.brand,
        origin=product_in.origin,
        warranty=product_in.warranty,
        unit=product_in.unit,
        image_url=product_in.image_url,  # Ảnh đại diện (Thumbnail)
        tags=product_in.tags,            # Tự động map List -> JSON
        specifications=product_in.specifications, # Tự động map Dict -> JSON
        is_active=product_in.is_active
    )
    
    db.add(new_product)
    db.flush() # Flush để lấy ID của new_product trước khi commit
    
    # 2. Lưu danh sách ảnh Gallery (nếu có)
    if product_in.images:
        for index, url in enumerate(product_in.images):
            # Tạo record trong bảng product_images
            new_img = ProductImage(
                product_id=new_product.id,
                image_url=url,
                display_order=index
            )
            db.add(new_img)
    
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
    Seller cập nhật thông tin product (bao gồm cả ảnh gallery)
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
    
    # 1. Lấy dữ liệu update (loại bỏ các trường None)
    update_data = product_in.dict(exclude_unset=True)
    
    # 2. Tách phần ảnh gallery ra xử lý riêng
    gallery_images = update_data.pop("images", None)
    
    # 3. Cập nhật các trường thông tin cơ bản
    for field, value in update_data.items():
        setattr(product, field, value)
    
    # 4. Cập nhật bộ sưu tập ảnh (Nếu có gửi lên)
    if gallery_images is not None:
        # Xóa toàn bộ ảnh cũ
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        
        # Thêm ảnh mới
        for index, url in enumerate(gallery_images):
            db.add(ProductImage(
                product_id=product_id,
                image_url=url,
                display_order=index
            ))
    
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
    Seller xóa product (sẽ xóa luôn tất cả variants và images nhờ cascade)
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
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy product này hoặc không thuộc store của bạn"
        )
    
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
        market_price=variant_in.market_price, # 👇 Thêm giá thị trường
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
    Seller cập nhật variant
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
    
    # Cập nhật thông minh các trường có gửi lên
    update_data = variant_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(variant, field, value)
    
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
    
    db.delete(variant)
    db.commit()
    
    return {"message": "Đã xóa variant thành công"}

# GET /api/seller/products/{product_id}/variants
@router.get("/products/{product_id}/variants", response_model=List[VariantResponse])
def get_product_variants(
    product_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
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
    
    variants = db.query(Variant).filter(Variant.product_id == product_id).all()
    
    return variants

# ========== ORDERS FOR SELLER ==========
# (Phần Order API bên dưới bạn giữ nguyên, không cần thay đổi gì thêm)

@router.get("/orders", response_model=List[SellerOrderSummary])
def get_seller_orders(
    status: Optional[str] = Query(None),
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store

    query = (
        db.query(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(Variant, Variant.id == OrderItem.variant_id)
        .join(Product, Product.id == Variant.product_id)
        .filter(Product.store_id == store.id)
        .distinct()
    )

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()

    summaries: List[SellerOrderSummary] = []

    for order in orders:
        order_items = (
            db.query(OrderItem)
            .join(Variant, Variant.id == OrderItem.variant_id)
            .join(Product, Product.id == Variant.product_id)
            .filter(
                OrderItem.order_id == order.id,
                Product.store_id == store.id,
            )
            .all()
        )

        item_responses = [
            SellerOrderItemResponse(
                order_item_id=item.id,
                product_name=item.product_name,
                variant_name=item.variant_name,
                price=item.price,
                quantity=item.quantity,
                line_total=item.line_total,
            )
            for item in order_items
        ]

        summaries.append(
            SellerOrderSummary(
                order_id=order.id,
                status=order.status,
                total=order.total,
                created_at=order.created_at,
                customer_email=order.user.email if order.user else "",
                customer_name=order.user.full_name if order.user else None,
                items=item_responses,
            )
        )

    return summaries
    
@router.put("/orders/{order_id}/status", response_model=SellerOrderSummary)
def update_order_status(
    order_id: int,
    new_status: str = Query(..., description="Các trạng thái: CONFIRMED, SHIPPING, DELIVERED, CANCELLED"),
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store

    order = db.query(Order).join(OrderItem, OrderItem.order_id == Order.id)\
        .join(Variant, Variant.id == OrderItem.variant_id)\
        .join(Product, Product.id == Variant.product_id)\
        .filter(Order.id == order_id, Product.store_id == store.id)\
        .first()

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng này trong cửa hàng của bạn")

    order.status = new_status
    db.commit()
    db.refresh(order)

    order_items = db.query(OrderItem).join(Variant).join(Product)\
        .filter(OrderItem.order_id == order.id, Product.store_id == store.id).all()

    item_responses = [
        SellerOrderItemResponse(
            order_item_id=item.id,
            product_name=item.product_name,
            variant_name=item.variant_name,
            price=item.price,
            quantity=item.quantity,
            line_total=item.line_total,
        ) for item in order_items
    ]

    return SellerOrderSummary(
        order_id=order.id,
        status=order.status,
        total=order.total,
        created_at=order.created_at,
        customer_email=order.user.email,
        customer_name=order.user.full_name,
        items=item_responses,
    )

@router.get("/me")
def get_seller_info(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
):
    """
    Trả về thông tin người bán và tên cửa hàng để hiển thị lên Header
    """
    current_user, store = current_user_store
    
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "store_name": store.store_name,       # ✅ Tên Shop
        "store_avatar": None,                 # (Nếu sau này store có logo)
        "user_avatar": None                   # (Nếu user có avatar)
    }