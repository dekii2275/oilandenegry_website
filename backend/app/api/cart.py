from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.core.database import get_db
from app.models.users import User
from app.models.cart import Cart, CartItem
from app.models.product import Variant, Product
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse
from app.api.deps import get_current_user

router = APIRouter()

def get_or_create_cart(db: Session, user_id: int) -> Cart:
    """Lấy cart của user, nếu chưa có thì tạo mới"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

# GET /api/cart - Lấy giỏ hàng hiện tại
@router.get("/", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy giỏ hàng của user hiện tại"""
    cart = get_or_create_cart(db, current_user.id)
    
    items = []
    subtotal = Decimal(0)
    
    for item in cart.items:
        variant = db.query(Variant).filter(Variant.id == item.variant_id).first()
        if not variant:
            continue
            
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product:
            continue
        
        line_total = item.price_at_add * item.quantity
        subtotal += line_total
        
        items.append(CartItemResponse(
            cart_item_id=item.id,
            product_id=product.id,
            variant_id=variant.id,
            name=product.name,
            variant_name=variant.name,
            price=item.price_at_add,
            quantity=item.quantity,
            line_total=line_total,
            in_stock=variant.stock >= item.quantity
        ))
    
    return CartResponse(
        cart_id=cart.id,
        items=items,
        subtotal=subtotal
    )

# POST /api/cart/items - Thêm sản phẩm vào cart
@router.post("/items")
def add_to_cart(
    item_in: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Thêm sản phẩm/variant vào cart"""
    # Validate variant
    variant = db.query(Variant).filter(
        Variant.id == item_in.variant_id,
        Variant.is_active == True
    ).first()
    
    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Sản phẩm không tồn tại hoặc đã ngừng bán"
        )
    
    # Check stock
    if variant.stock < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Không đủ tồn kho. Hiện có: {variant.stock}"
        )
    
    # Get or create cart
    cart = get_or_create_cart(db, current_user.id)
    
    # Check if item already exists in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.variant_id == item_in.variant_id
    ).first()
    
    if existing_item:
        # Tăng quantity
        existing_item.quantity += item_in.quantity
        # Update price to latest
        existing_item.price_at_add = variant.price
        db.commit()
        db.refresh(existing_item)
        return {"message": "Updated", "cart_item_id": existing_item.id}
    else:
        # Tạo mới
        new_item = CartItem(
            cart_id=cart.id,
            variant_id=item_in.variant_id,
            quantity=item_in.quantity,
            price_at_add=variant.price
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"message": "Added", "cart_item_id": new_item.id}

# PUT /api/cart/items/{cart_item_id} - Cập nhật số lượng
@router.put("/items/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật số lượng item trong cart"""
    if item_in.quantity < 1:
        raise HTTPException(status_code=400, detail="Số lượng phải >= 1")
    
    cart = get_or_create_cart(db, current_user.id)
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy item trong cart")
    
    # Check stock
    variant = db.query(Variant).filter(Variant.id == cart_item.variant_id).first()
    if variant.stock < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Không đủ tồn kho. Hiện có: {variant.stock}"
        )
    
    cart_item.quantity = item_in.quantity
    cart_item.price_at_add = variant.price  # Update price
    db.commit()
    
    return {"message": "Updated"}

# DELETE /api/cart/items/{cart_item_id} - Xóa item khỏi cart
@router.delete("/items/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa item khỏi cart"""
    cart = get_or_create_cart(db, current_user.id)
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy item trong cart")
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Deleted"}