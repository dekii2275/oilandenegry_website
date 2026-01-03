from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.core.database import get_db
from app.models.users import User
from app.models.cart import Cart, CartItem
from app.models.product import Product  # ✅ chỉ dùng Product
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse
from app.api.deps import get_current_user

router = APIRouter()

def get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def _product_price(product: Product) -> Decimal:
    # tránh lỗi nếu model Product chưa khai báo cột price
    val = getattr(product, "price", None)
    if val is None:
        return Decimal("0")
    return Decimal(str(val))

def _product_stock(product: Product):
    # None => coi như không giới hạn tồn
    return getattr(product, "stock", None)

@router.get("/", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user.id)

    items = []
    subtotal = Decimal("0")

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue

        line_total = Decimal(str(item.price_at_add)) * item.quantity
        subtotal += line_total

        stock = _product_stock(product)
        in_stock = True if stock is None else (stock >= item.quantity)

        items.append(CartItemResponse(
            cart_item_id=item.id,
            product_id=product.id,
            name=product.name,
            price=Decimal(str(item.price_at_add)),
            quantity=item.quantity,
            line_total=line_total,
            in_stock=in_stock,
            variant_id=None,
            variant_name=None,
        ))

    return CartResponse(cart_id=cart.id, items=items, subtotal=subtotal)

@router.post("/items")
def add_to_cart(
    item_in: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ✅ Chỉ cần product_id
    product_id = item_in.product_id

    # ✅ Legacy: nếu client cũ còn gửi variant_id thì map -> product_id (tạm thời)
    legacy_variant_price = None
    legacy_variant_stock = None
    if product_id is None and item_in.variant_id is not None:
        from app.models.product import Variant  # import cục bộ để dễ bỏ sau
        v = db.query(Variant).filter(Variant.id == item_in.variant_id, Variant.is_active == True).first()
        if not v:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại hoặc đã ngừng bán")
        product_id = v.product_id
        legacy_variant_price = getattr(v, "price", None)
        legacy_variant_stock = getattr(v, "stock", None)

    if product_id is None:
        raise HTTPException(status_code=422, detail="Thiếu product_id")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or (getattr(product, "is_active", True) is False):
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại hoặc đã ngừng bán")

    # Stock check: ưu tiên legacy variant stock nếu đi theo variant_id
    stock = legacy_variant_stock if legacy_variant_stock is not None else _product_stock(product)
    if stock is not None and stock < item_in.quantity:
        raise HTTPException(status_code=400, detail=f"Không đủ tồn kho. Hiện có: {stock}")

    cart = get_or_create_cart(db, current_user.id)

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product_id
    ).first()

    # Price snapshot: ưu tiên product.price, fallback legacy variant.price, cuối cùng 0
    price_now = _product_price(product)
    if price_now == 0 and legacy_variant_price is not None:
        price_now = Decimal(str(legacy_variant_price))

    if existing_item:
        existing_item.quantity += item_in.quantity
        existing_item.price_at_add = price_now
        db.commit()
        db.refresh(existing_item)
        return {"message": "Updated", "cart_item_id": existing_item.id}

    new_item = CartItem(
        cart_id=cart.id,
        product_id=product_id,
        variant_id=None,  # không dùng nữa
        quantity=item_in.quantity,
        price_at_add=price_now
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Added", "cart_item_id": new_item.id}

@router.put("/items/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user.id)
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.cart_id == cart.id
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy item trong cart")

    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")

    stock = _product_stock(product)
    if stock is not None and stock < item_in.quantity:
        raise HTTPException(status_code=400, detail=f"Không đủ tồn kho. Hiện có: {stock}")

    cart_item.quantity = item_in.quantity
    cart_item.price_at_add = _product_price(product)
    db.commit()
    return {"message": "Updated"}

@router.delete("/items/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
