from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.core.database import get_db
from app.models.users import User
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod, ShippingMethod
from app.models.product import Variant, Product
from app.models.address import Address
from app.schemas.order import (
    OrderCreate, OrderPreviewRequest, OrderPreviewResponse,
    OrderResponse, OrderDetailResponse, OrderItemResponse
)
from app.api.deps import get_current_user
from app.api.cart import get_or_create_cart

router = APIRouter()

def calculate_shipping_fee(shipping_method: str, subtotal: Decimal) -> Decimal:
    """Tính phí ship (có thể customize theo logic của bạn)"""
    if shipping_method == "express":
        return Decimal(50000)
    elif shipping_method == "same_day":
        return Decimal(100000)
    else:  # standard
        return Decimal(30000)

def calculate_discount(voucher_code: str, subtotal: Decimal) -> Decimal:
    """Tính discount (có thể customize theo logic của bạn)"""
    if not voucher_code:
        return Decimal(0)
    
    # Ví dụ: SALE10 = giảm 10%
    if voucher_code.upper() == "SALE10":
        return subtotal * Decimal("0.1")
    
    return Decimal(0)

# POST /api/orders/preview - Preview checkout
@router.post("/preview", response_model=OrderPreviewResponse)
def preview_order(
    preview_in: OrderPreviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Preview checkout trước khi đặt hàng"""
    # Validate address
    address = db.query(Address).filter(
        Address.id == preview_in.address_id,
        Address.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ")
    
    # Get cart
    cart = get_or_create_cart(db, current_user.id)
    
    if not cart.items:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")
    
    subtotal = Decimal(0)
    warnings = []
    
    # Validate từng item
    for item in cart.items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        if not variant or not variant.is_active:
            warnings.append(f"Sản phẩm {item.variant_id} không còn bán")
            continue
        
        if variant.stock < item.quantity:
            warnings.append(f"Sản phẩm {variant.name} không đủ tồn kho (cần {item.quantity}, có {variant.stock})")
            continue
        
        # Tính lại giá (không tin giá từ cart)
        line_total = variant.price * item.quantity
        subtotal += line_total
    
    if warnings:
        # Vẫn trả về preview nhưng có warnings
        pass
    
    # Tính discount
    discount = calculate_discount(preview_in.voucher_code, subtotal)
    
    # Tính shipping
    shipping_fee = calculate_shipping_fee(preview_in.shipping_method, subtotal)
    
    # Total
    total = subtotal - discount + shipping_fee
    
    return OrderPreviewResponse(
        subtotal=subtotal,
        discount=discount,
        shipping_fee=shipping_fee,
        total=total,
        warnings=warnings
    )

# POST /api/orders - Tạo order từ cart
@router.post("/", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo order từ cart"""
    # Validate address
    address = db.query(Address).filter(
        Address.id == order_in.address_id,
        Address.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ")
    
    # Get cart
    cart = get_or_create_cart(db, current_user.id)
    
    if not cart.items:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")
    
    # Validate stock trước khi tạo order
    for item in cart.items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        if not variant or variant.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Sản phẩm không đủ tồn kho"
            )
    
    # Tính toán
    subtotal = Decimal(0)
    for item in cart.items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        subtotal += variant.price * item.quantity
    
    discount = calculate_discount(order_in.voucher_code, subtotal)
    shipping_fee = calculate_shipping_fee(order_in.shipping_method, subtotal)
    total = subtotal - discount + shipping_fee
    
    # Xác định initial status
    if order_in.payment_method == PaymentMethod.COD.value:
        initial_status = OrderStatus.PLACED.value
    else:
        initial_status = OrderStatus.PLACED.value
    
    # Tạo Order
    new_order = Order(
        user_id=current_user.id,
        address_id=order_in.address_id,
        status=initial_status,
        payment_method=order_in.payment_method,
        shipping_method=order_in.shipping_method,
        subtotal=subtotal,
        discount=discount,
        shipping_fee=shipping_fee,
        total=total,
        note=order_in.note,
        voucher_code=order_in.voucher_code
    )
    db.add(new_order)
    db.flush()
    
    # Tạo OrderItems và trừ stock
    order_items = []
    for item in cart.items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        
        order_item = OrderItem(
            order_id=new_order.id,
            variant_id=item.variant_id,
            product_name=product.name,
            variant_name=variant.name,
            price=variant.price,
            quantity=item.quantity,
            line_total=variant.price * item.quantity
        )
        
        # Trừ stock
        variant.stock -= item.quantity
        
        db.add(order_item)
        order_items.append(order_item)
    
    # Xóa cart items
    for item in cart.items:
        db.delete(item)
    
    db.commit()
    db.refresh(new_order)
    
    for item in order_items:
        db.refresh(item)
    
    # Build response
    return OrderResponse(
        order_id=new_order.id,
        user_id=new_order.user_id,
        address_id=new_order.address_id,
        status=new_order.status,
        payment_method=new_order.payment_method,
        shipping_method=new_order.shipping_method,
        subtotal=new_order.subtotal,
        discount=new_order.discount,
        shipping_fee=new_order.shipping_fee,
        total=new_order.total,
        note=new_order.note,
        voucher_code=new_order.voucher_code,
        payment_url=new_order.payment_url,
        created_at=new_order.created_at,
        updated_at=new_order.updated_at,
        items=[
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                variant_id=item.variant_id,
                product_name=item.product_name,
                variant_name=item.variant_name,
                price=item.price,
                quantity=item.quantity,
                line_total=item.line_total
            )
            for item in order_items
        ]
    )
                

# GET /api/orders/{order_id} - Xem chi tiết đơn hàng
@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order_detail(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xem chi tiết đơn hàng"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return OrderDetailResponse(
        order_id=order.id,
        status=order.status,
        total=order.total,
        created_at=order.created_at,
        items=[OrderItemResponse.from_orm(item) for item in items],
        address_id=order.address_id,
        payment_method=order.payment_method,
        shipping_method=order.shipping_method,
        subtotal=order.subtotal,
        discount=order.discount,
        shipping_fee=order.shipping_fee,
        note=order.note,
        voucher_code=order.voucher_code,
        payment_url=order.payment_url
    )


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer hủy đơn hàng khi còn ở trạng thái chờ xử lý (PLACED/PENDING_CONFIRM).
    Hoàn lại tồn kho cho các variant trong đơn.
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Cho phép hủy khi trạng thái là PLACED hoặc PENDING_CONFIRM (nếu enum có)
    allowed_pending = {OrderStatus.PLACED}
    if hasattr(OrderStatus, "PENDING_CONFIRM"):
        allowed_pending.add(OrderStatus.PENDING_CONFIRM)

    if order.status not in allowed_pending:
        raise HTTPException(status_code=400, detail="Chỉ có thể hủy đơn hàng đang chờ xử lý")

    # Hoàn lại stock cho các item
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        if variant:
            variant.stock = (variant.stock or 0) + item.quantity

    order.status = OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)

    # Trả về order sau khi hủy (kèm items)
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return OrderResponse(
        order_id=order.id,
        user_id=order.user_id,
        address_id=order.address_id,
        status=order.status,
        payment_method=order.payment_method,
        shipping_method=order.shipping_method,
        subtotal=order.subtotal,
        discount=order.discount,
        shipping_fee=order.shipping_fee,
        total=order.total,
        note=getattr(order, "note", None),
        voucher_code=getattr(order, "voucher_code", None),
        payment_url=getattr(order, "payment_url", None),
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            OrderItemResponse(
                id=i.id,
                order_id=i.order_id,
                variant_id=i.variant_id,
                product_name=i.product_name,
                variant_name=i.variant_name,
                price=i.price,
                quantity=i.quantity,
                line_total=i.line_total
            )
            for i in items
        ]
    )
