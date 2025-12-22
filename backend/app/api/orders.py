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
    # Validate role
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=403,
            detail="Chỉ Customer mới có thể đặt hàng"
        )
    
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
    
    # Validate và tính toán
    subtotal = Decimal(0)
    order_items_data = []
    errors = []
    
    for cart_item in cart.items:
        variant = db.query(Variant).filter(Variant.id == cart_item.variant_id).first()
        if not variant or not variant.is_active:
            errors.append(f"Sản phẩm variant_id={cart_item.variant_id} không còn bán")
            continue
        
        if variant.stock < cart_item.quantity:
            errors.append(f"Sản phẩm {variant.name} không đủ tồn kho (cần {cart_item.quantity}, có {variant.stock})")
            continue
        
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product:
            errors.append(f"Không tìm thấy product cho variant_id={cart_item.variant_id}")
            continue
        
        # Tính lại giá tại thời điểm checkout
        price = variant.price
        line_total = price * cart_item.quantity
        subtotal += line_total
        
        order_items_data.append({
            "variant": variant,
            "product": product,
            "quantity": cart_item.quantity,
            "price": price,
            "line_total": line_total
        })
    
    if errors:
        raise HTTPException(
            status_code=400,
            detail={"errors": errors}
        )
    
    # Tính discount và shipping
    discount = calculate_discount(order_in.voucher_code, subtotal)
    shipping_fee = calculate_shipping_fee(order_in.shipping_method, subtotal)
    total = subtotal - discount + shipping_fee
    
    # Xác định status ban đầu
    if order_in.payment_method == PaymentMethod.COD.value:
        order_status = OrderStatus.PLACED.value
    else:
        order_status = OrderStatus.PENDING_PAYMENT.value
    
    # Tạo Order
    new_order = Order(
        user_id=current_user.id,
        address_id=order_in.address_id,
        status=order_status,
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
    db.flush()  # Để lấy order.id
    
    # Tạo OrderItems
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            variant_id=item_data["variant"].id,
            product_name=item_data["product"].name,
            variant_name=item_data["variant"].name,
            price=item_data["price"],
            quantity=item_data["quantity"],
            line_total=item_data["line_total"]
        )
        db.add(order_item)
        
        # Trừ stock
        item_data["variant"].stock -= item_data["quantity"]
    
    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    # Load items để trả về
    items = db.query(OrderItem).filter(OrderItem.order_id == new_order.id).all()
    
    return OrderResponse(
        order_id=new_order.id,
        status=new_order.status,
        total=new_order.total,
        created_at=new_order.created_at,
        items=[OrderItemResponse.from_orm(item) for item in items]
    )

# GET /api/orders/me - Lấy danh sách đơn hàng của tôi
@router.get("/me", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách đơn hàng của user hiện tại"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append(OrderResponse(
            order_id=order.id,
            status=order.status,
            total=order.total,
            created_at=order.created_at,
            items=[OrderItemResponse.from_orm(item) for item in items]
        ))
    
    return result

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