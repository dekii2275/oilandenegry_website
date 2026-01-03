from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from decimal import Decimal, ROUND_HALF_UP
import os
from urllib.parse import quote

from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.store import Store
from app.schemas.order import OrderCreate, OrderOut, OrderItemOut

try:
    from app.api.deps import get_current_user
except Exception:
    from app.dependencies import get_current_user  # type: ignore


router = APIRouter(tags=["Orders"])

SHIPPING_FEE = Decimal("50000")  # 50k
TAX_RATE = Decimal("0.10")       # VAT 10%


def _q2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _user_display_name(user) -> str:
    name = (getattr(user, "full_name", None) or "").strip()
    return name or "Khách vãng lai"


@router.get("/", response_model=list[OrderOut])
def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    List đơn hàng của user đang đăng nhập.
    GET /api/orders/?skip=0&limit=20
    """
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    if not orders:
        return []

    order_ids = [o.id for o in orders]
    items = db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).all()

    # group items by order_id
    items_by_order: dict[int, list[OrderItem]] = {}
    product_ids = set()
    store_ids = set()

    for it in items:
        items_by_order.setdefault(int(it.order_id), []).append(it)
        if it.product_id is not None:
            product_ids.add(int(it.product_id))
        if getattr(it, "store_id", None) is not None:
            store_ids.add(int(it.store_id))

    products = db.query(Product).filter(Product.id.in_(list(product_ids))).all() if product_ids else []
    product_map = {int(p.id): p for p in products}

    # add store_id from products too
    for p in products:
        sid = getattr(p, "store_id", None)
        if sid is not None:
            store_ids.add(int(sid))

    stores = db.query(Store).filter(Store.id.in_(list(store_ids))).all() if store_ids else []
    store_map = {int(s.id): (s.store_name or "") for s in stores}

    out: list[OrderOut] = []
    for o in orders:
        o_items = items_by_order.get(int(o.id), [])

        subtotal = Decimal("0")
        out_items: list[OrderItemOut] = []

        for it in o_items:
            p = product_map.get(int(it.product_id)) if it.product_id is not None else None
            pname = (p.name if p else None) or f"Sản phẩm #{it.product_id}"

            sid = getattr(it, "store_id", None)
            if sid is None and p is not None:
                sid = getattr(p, "store_id", None)
            sid_int = int(sid) if sid is not None else None
            sname = store_map.get(sid_int) if sid_int is not None else None

            unit = Decimal(str(it.price or "0"))
            qty = int(it.quantity or 0)
            line = unit * qty
            subtotal += line

            out_items.append(
                OrderItemOut(
                    product_id=int(it.product_id) if it.product_id is not None else 0,
                    product_name=pname,
                    store_id=sid_int,
                    store_name=sname,
                    quantity=qty,
                    price=_q2(unit),
                    line_total=_q2(line),
                )
            )

        subtotal = _q2(subtotal)
        shipping_fee = SHIPPING_FEE if subtotal > 0 else Decimal("0")
        tax = _q2(subtotal * TAX_RATE)
        total_amount = _q2(subtotal + shipping_fee + tax)

        out.append(
            OrderOut(
                order_id=int(o.id),
                user_id=int(o.user_id),
                customer_name=_user_display_name(current_user),
                customer_phone=getattr(current_user, "phone_number", None),
                status=o.status,
                payment_method=o.payment_method or "",
                shipping_address=o.shipping_address or "",
                created_at=o.created_at,
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                tax=tax,
                total_amount=total_amount,
                items=out_items,
            )
        )

    return out


@router.post("/", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    shipping_address = (order_in.shipping_address or "").strip()
    if len(shipping_address) < 5:
        raise HTTPException(status_code=400, detail="Địa chỉ giao hàng không hợp lệ")

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")

    subtotal = Decimal("0")
    prepared: list[tuple[Product, int, Decimal]] = []  # (product, qty, unit_price)
    store_ids = set()

    for it in cart_items:
        qty = int(it.quantity or 0)
        if qty <= 0:
            raise HTTPException(status_code=400, detail="Số lượng không hợp lệ")

        product = (
            db.query(Product)
            .filter(Product.id == it.product_id)
            .with_for_update()
            .first()
        )
        if not product:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy sản phẩm id={it.product_id}")

        stock = int(getattr(product, "stock", 0) or 0)
        if stock < qty:
            raise HTTPException(status_code=400, detail=f"Sản phẩm '{product.name}' không đủ tồn kho (còn {stock})")

        # lấy giá tại thời điểm add-to-cart (nếu có), fallback về product.price
        price_at_add = getattr(it, "price_at_add", None)
        if price_at_add is None:
            price_at_add = getattr(product, "price", 0) or 0
        unit_price = Decimal(str(price_at_add))

        subtotal += unit_price * qty
        prepared.append((product, qty, unit_price))

        sid = getattr(product, "store_id", None)
        if sid is not None:
            store_ids.add(int(sid))

    subtotal = _q2(subtotal)
    shipping_fee = SHIPPING_FEE if subtotal > 0 else Decimal("0")
    tax = _q2(subtotal * TAX_RATE)
    total_amount = _q2(subtotal + shipping_fee + tax)

    store_map = {}
    if store_ids:
        stores = db.query(Store).filter(Store.id.in_(list(store_ids))).all()
        store_map = {int(s.id): (s.store_name or "") for s in stores}

    # QR -> PENDING, COD -> CONFIRMED
    initial_status = (
        OrderStatus.PENDING.value
        if (order_in.payment_method or "").upper() == "QR"
        else OrderStatus.CONFIRMED.value
    )

    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status=initial_status,
        payment_method=order_in.payment_method,
        shipping_address=shipping_address,
    )
    db.add(new_order)
    db.flush()

    out_items: list[OrderItemOut] = []
    for product, qty, unit_price in prepared:
        product.stock = int(getattr(product, "stock", 0) or 0) - qty

        sid = int(getattr(product, "store_id", 0) or 0) if getattr(product, "store_id", None) is not None else None
        sname = store_map.get(sid) if sid is not None else None

        oi = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            store_id=sid,
            quantity=qty,
            price=unit_price,
        )
        db.add(oi)

        out_items.append(
            OrderItemOut(
                product_id=int(product.id),
                product_name=product.name or f"Sản phẩm #{product.id}",
                store_id=sid,
                store_name=sname,
                quantity=qty,
                price=_q2(unit_price),
                line_total=_q2(unit_price * qty),
            )
        )

    # clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(new_order)

    return OrderOut(
        order_id=int(new_order.id),
        user_id=int(new_order.user_id),
        customer_name=_user_display_name(current_user),
        customer_phone=getattr(current_user, "phone_number", None),
        status=new_order.status,
        payment_method=new_order.payment_method or "",
        shipping_address=new_order.shipping_address or "",
        created_at=new_order.created_at,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        tax=tax,
        total_amount=total_amount,
        items=out_items,
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

    product_ids = list({int(it.product_id) for it in items if it.product_id is not None})
    products = db.query(Product).filter(Product.id.in_(product_ids)).all() if product_ids else []
    product_map = {int(p.id): p for p in products}

    store_ids = set()
    for it in items:
        sid = getattr(it, "store_id", None)
        if sid is not None:
            store_ids.add(int(sid))
        p = product_map.get(int(it.product_id)) if it.product_id is not None else None
        if p is not None and getattr(p, "store_id", None) is not None:
            store_ids.add(int(p.store_id))

    stores = db.query(Store).filter(Store.id.in_(list(store_ids))).all() if store_ids else []
    store_map = {int(s.id): (s.store_name or "") for s in stores}

    subtotal = Decimal("0")
    out_items: list[OrderItemOut] = []

    for it in items:
        p = product_map.get(int(it.product_id)) if it.product_id is not None else None
        pname = (p.name if p else None) or f"Sản phẩm #{it.product_id}"

        sid = getattr(it, "store_id", None)
        if sid is None and p is not None:
            sid = getattr(p, "store_id", None)
        sid_int = int(sid) if sid is not None else None
        sname = store_map.get(sid_int) if sid_int is not None else None

        unit = Decimal(str(it.price or "0"))
        qty = int(it.quantity or 0)
        line = unit * qty
        subtotal += line

        out_items.append(
            OrderItemOut(
                product_id=int(it.product_id) if it.product_id is not None else 0,
                product_name=pname,
                store_id=sid_int,
                store_name=sname,
                quantity=qty,
                price=_q2(unit),
                line_total=_q2(line),
            )
        )

    subtotal = _q2(subtotal)
    shipping_fee = SHIPPING_FEE if subtotal > 0 else Decimal("0")
    tax = _q2(subtotal * TAX_RATE)
    total_amount = _q2(subtotal + shipping_fee + tax)

    return OrderOut(
        order_id=int(order.id),
        user_id=int(order.user_id),
        customer_name=_user_display_name(current_user),
        customer_phone=getattr(current_user, "phone_number", None),
        status=order.status,
        payment_method=order.payment_method or "",
        shipping_address=order.shipping_address or "",
        created_at=order.created_at,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        tax=tax,
        total_amount=total_amount,
        items=out_items,
    )


@router.get("/{order_id}/qr")
def get_order_qr(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Trả về URL ảnh QR (VietQR) cho đơn hàng.
    - QR chuyển thẳng về ADMIN (bank/bin + account của admin)
    - amount = total_amount của order
    """
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    if (order.payment_method or "").upper() != "QR":
        raise HTTPException(status_code=400, detail="Đơn hàng này không chọn thanh toán QR")

    bank_bin = (os.getenv("VQR_BANK_BIN") or "").strip()
    account_no = (os.getenv("VQR_ACCOUNT_NO") or "").strip()
    account_name = (os.getenv("VQR_ACCOUNT_NAME") or "").strip()

    if not bank_bin or not account_no or not account_name:
        raise HTTPException(
            status_code=500,
            detail="Thiếu cấu hình VietQR (VQR_BANK_BIN/VQR_ACCOUNT_NO/VQR_ACCOUNT_NAME)",
        )

    total = Decimal(str(order.total_amount or "0"))
    amount_int = int(total.to_integral_value(rounding=ROUND_HALF_UP))
    if amount_int <= 0:
        raise HTTPException(status_code=400, detail="Số tiền đơn hàng không hợp lệ")

    add_info = f"ZENERGY ORDER #{order.id}"
    base = f"https://img.vietqr.io/image/{bank_bin}-{account_no}-compact2.png"
    qr_url = (
        f"{base}"
        f"?amount={amount_int}"
        f"&addInfo={quote(add_info)}"
        f"&accountName={quote(account_name)}"
    )

    return {
        "order_id": int(order.id),
        "amount": amount_int,
        "account_name": account_name,
        "account_no": account_no,
        "bank_bin": bank_bin,
        "add_info": add_info,
        "qr_image_url": qr_url,
    }
