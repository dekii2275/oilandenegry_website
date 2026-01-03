from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, case # ✅ Thêm func
from typing import List, Tuple, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.models.product import Product, ProductImage
from app.models.order import Order, OrderItem
from app.models.withdraw import WithdrawRequest
from app.schemas.withdraw import WithdrawResponse, WithdrawCreate

from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse
)
from app.schemas.order import OrderOut 

from app.api.deps import get_current_seller

router = APIRouter()

# =================================================================
# 1. PRODUCT APIs (Giữ nguyên)
# =================================================================

@router.post("/products", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store
    
    new_product = Product(
        store_id=store.id,
        name=product_in.name,
        description=product_in.description,
        category=product_in.category,
        brand=product_in.brand,
        origin=product_in.origin,
        warranty=product_in.warranty,
        unit=product_in.unit,
        image_url=product_in.image_url,
        tags=product_in.tags,
        specifications=product_in.specifications,
        is_active=product_in.is_active,
        price=product_in.price,
        market_price=product_in.market_price,
        stock=product_in.stock,
        sku=product_in.sku
    )
    
    db.add(new_product)
    db.flush() 
    
    if product_in.images:
        for index, url in enumerate(product_in.images):
            new_img = ProductImage(
                product_id=new_product.id,
                image_url=url,
                display_order=index
            )
            db.add(new_img)
    
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/products", response_model=List[ProductResponse])
def get_my_products(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    current_user, store = current_user_store
    return db.query(Product).filter(Product.store_id == store.id).offset(skip).limit(limit).all()

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store.id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    update_data = product_in.dict(exclude_unset=True)
    gallery_images = update_data.pop("images", None)
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    if gallery_images is not None:
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        for index, url in enumerate(gallery_images):
            db.add(ProductImage(product_id=product_id, image_url=url, display_order=index))
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    db.delete(product)
    db.commit()
    return {"message": "Đã xóa sản phẩm thành công"}

# =================================================================
# 2. SELLER INFO
# =================================================================

@router.get("/me")
def get_seller_info(current_user_store: Tuple[User, Store] = Depends(get_current_seller)):
    current_user, store = current_user_store
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "store_name": store.store_name,
    }

# =================================================================
# 3. ORDER APIs
# =================================================================

@router.get("/orders", response_model=List[OrderOut])
def get_seller_orders(
    status: Optional[str] = Query(None, description="Lọc trạng thái"),
    keyword: Optional[str] = Query(None, description="Tìm kiếm"),
    skip: int = 0,
    limit: int = 20,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store

    # 1. Query cơ bản: Join bảng để lọc đơn hàng có sản phẩm của Shop
    query = (
        db.query(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.store_id == store.id)
    )

    # 2. Lọc theo trạng thái
    if status and status != "ALL":
        query = query.filter(Order.status == status)

    # 3. Tìm kiếm (Logic thông minh)
    if keyword:
        search_term = keyword.strip()
        
        # 🟢 TRƯỜNG HỢP 1: Tìm đích danh Mã đơn (Bắt đầu bằng #)
        if search_term.startswith("#"):
            clean_id = search_term.replace("#", "")
            if clean_id.isdigit():
                query = query.filter(Order.id == int(clean_id))
        
        # 🟡 TRƯỜNG HỢP 2: Tìm rộng (Tên, SĐT, Địa chỉ, Mã đơn trần)
        else:
            query = query.join(User, Order.user_id == User.id).filter(
                or_(
                    Order.id.cast(str) == search_term,         # Mã đơn (không có #)
                    User.full_name.ilike(f"%{search_term}%"),  # Tên khách
                    User.phone_number.ilike(f"%{search_term}%"), # SĐT khách
                    Order.shipping_address.ilike(f"%{search_term}%") # Địa chỉ
                )
            )

    # 4. Phân trang và sắp xếp
    # Dùng distinct() vì 1 đơn có thể có nhiều item của shop -> tránh trùng lặp dòng Order
    orders = query.distinct().order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    
    for order in orders:
        shop_items = []
        
        # 5. Xử lý Items: Tạo dict thủ công để khớp với Schema
        for item in order.items:
            # Chỉ lấy sản phẩm của shop này
            if item.product.store_id == store.id:
                item_data = {
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "store_id": store.id,
                    "store_name": store.store_name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "line_total": item.price * item.quantity 
                }
                shop_items.append(item_data)
        
        # Chỉ trả về đơn hàng nếu có item của shop
        if shop_items:
            customer_name = order.user.full_name if order.user else f"User #{order.user_id}"
            customer_phone = order.user.phone_number if order.user else None

            results.append({
                "order_id": order.id,
                "user_id": order.user_id,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "status": order.status,
                "payment_method": order.payment_method,
                "shipping_address": order.shipping_address,
                "created_at": order.created_at,
                "subtotal": order.total_amount, 
                "shipping_fee": 0,
                "tax": 0,
                "total_amount": order.total_amount,
                "items": shop_items 
            })

    return results


@router.get("/orders/stats")
def get_order_stats(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Đếm số lượng đơn hàng theo từng trạng thái.
    """
    current_user, store = current_user_store
    
    # Query lấy Order Object để dùng distinct() theo ID đơn hàng
    query = (
        db.query(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.store_id == store.id)
    )
    
    # DISTINCT để loại bỏ các dòng trùng lặp
    orders = query.distinct().all()
    
    stats = {
        "new": 0,
        "processing": 0,
        "shipping": 0,
        "completed": 0,
        "cancelled": 0
    }
    
    # Đếm thủ công
    for order in orders:
        st = order.status
        if st in ["NEW", "CONFIRMED", "PENDING"]:
            stats["new"] += 1
        elif st == "SHIPPING":
            stats["shipping"] += 1
        elif st == "COMPLETED":
            stats["completed"] += 1
        elif st == "CANCELLED":
            stats["cancelled"] += 1
            
    return stats

# =================================================================
# 4. ORDER ACTION APIs (Cập nhật trạng thái)
# =================================================================

class OrderStatusUpdate(BaseModel):
    status: str

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store
    
    # 1. Tìm đơn hàng
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # 2. Kiểm tra quyền sở hữu (Shop có sản phẩm trong đơn này không?)
    has_item_in_store = (
        db.query(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(OrderItem.order_id == order_id, Product.store_id == store.id)
        .first()
    )
    
    if not has_item_in_store:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thao tác trên đơn hàng này")

    # 3. Validate và Cập nhật trạng thái
    new_status = status_update.status
    if new_status not in ["SHIPPING", "CANCELLED", "COMPLETED"]:
         raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")

    order.status = new_status
    db.commit()
    
    return {"message": "Cập nhật trạng thái thành công", "status": new_status}

## =================================================================
# 5. WALLET APIs (ĐÃ SỬA VÀ BỔ SUNG)
# =================================================================

# ✅ API 1: LẤY THÔNG TIN VÍ (TÍNH TOÁN REAL-TIME)
@router.get("/wallet/overview")
def get_wallet_overview(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    current_user, store = current_user_store
    
    # ==================================================================
    # 1. TÍNH DOANH THU (CÁCH MỚI: LẤY TOTAL_AMOUNT CỦA ĐƠN HÀNG)
    # ==================================================================
    
    # Bước A: Tìm danh sách các Order ID mà Store này có tham gia bán
    # (Dùng distinct để tránh trùng lặp nếu 1 đơn có nhiều món của cùng 1 shop)
    store_order_ids_query = (
        db.query(OrderItem.order_id)
        .filter(OrderItem.store_id == store.id)
        .distinct()
    )
    
    # Bước B: Cộng tổng tiền (total_amount) của các Order đó
    # Chỉ tính các đơn đã chốt (CONFIRMED, SHIPPING, COMPLETED)
    revenue_query = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.id.in_(store_order_ids_query)) # Chỉ lấy đơn của shop mình
        .filter(Order.status.in_(["CONFIRMED", "SHIPPING", "COMPLETED"]))
    )
    
    total_revenue = revenue_query.scalar() or 0 # Nếu null thì trả về 0

    # ==================================================================
    # 2. TÍNH TIỀN ĐÃ RÚT (GIỮ NGUYÊN)
    # ==================================================================
    withdraw_query = (
        db.query(func.sum(WithdrawRequest.amount))
        .filter(WithdrawRequest.store_id == store.id)
        .filter(WithdrawRequest.status != "REJECTED") # Trừ tiền các đơn PENDING và COMPLETED
    )
    total_withdrawn = withdraw_query.scalar() or 0

    # ==================================================================
    # 3. TÍNH SỐ DƯ
    # ==================================================================
    # Doanh thu thực nhận = Tổng đơn hàng
    balance = float(total_revenue) - float(total_withdrawn)

    return {
        "balance": balance,
        "totalRevenue": float(total_revenue),
        "platformFee": 0, # Tạm thời chưa tính phí sàn
        "pendingPayout": 0
    }

# ✅ API 2: LẤY THÔNG TIN NGÂN HÀNG (QUAN TRỌNG ĐỂ FRONTEND KHÔNG BỊ LỖI)
@router.get("/wallet/bank-account")
def get_bank_account(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller)
):
    _, store = current_user_store
    # Nếu store chưa cập nhật bank -> trả về null để Frontend hiện nút "Thêm"
    if not store.bank_account:
        return None
        
    return {
        "bankName": store.bank_name,
        "accountNumber": store.bank_account,
        "accountHolder": store.bank_holder
    }

# ✅ API 3: LỊCH SỬ RÚT TIỀN
@router.get("/wallet/withdraw-requests") 
def get_withdraw_requests(
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    _, store = current_user_store
    requests = (
        db.query(WithdrawRequest)
        .filter(WithdrawRequest.store_id == store.id)
        .order_by(WithdrawRequest.created_at.desc())
        .all()
    )
    
    results = []
    for req in requests:
        results.append({
            "id": str(req.id),
            "code": f"WD-{req.id:04d}",
            "requestDate": req.created_at,
            "amount": req.amount,
            "bankName": req.bank_name or store.bank_name,
            "bankAccount": req.bank_account or store.bank_account,
            "status": req.status
        })
    return results

# ✅ API 4: TẠO YÊU CẦU RÚT TIỀN (ĐÃ FIX LOGIC CHECK SỐ DƯ)
@router.post("/wallet/withdraw")
def request_withdraw(
    data: WithdrawCreate,
    current_user_store: Tuple[User, Store] = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    _, store = current_user_store
    
    # 1. Validate đầu vào
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Số tiền rút không hợp lệ")

    # 2. Validate Bank info
    if not store.bank_account:
        raise HTTPException(status_code=400, detail="Vui lòng cập nhật tài khoản ngân hàng trước")

    # 3. TÍNH LẠI SỐ DƯ ĐỂ KIỂM TRA (An toàn tuyệt đối)
    # --- Tổng thu ---
    revenue_query = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, OrderItem.order_id == Order.id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.store_id == store.id)
        .filter(Order.status.in_(["CONFIRMED", "SHIPPING", "COMPLETED"]))
    )
    total_revenue = revenue_query.scalar() or 0
    
    # --- Tổng đã rút ---
    withdraw_query = (
        db.query(func.sum(WithdrawRequest.amount))
        .filter(WithdrawRequest.store_id == store.id)
        .filter(WithdrawRequest.status != "REJECTED") 
    )
    total_withdrawn = withdraw_query.scalar() or 0
    
    current_balance = float(total_revenue) - float(total_withdrawn)

    # 4. SO SÁNH
    if float(data.amount) > current_balance:
        raise HTTPException(
            status_code=400, 
            detail=f"Số dư không đủ. Khả dụng: {current_balance:,.0f}đ"
        )

    # 5. Lưu vào DB
    new_req = WithdrawRequest(
        store_id=store.id,
        amount=data.amount,
        status="PENDING",
        bank_name=store.bank_name,
        bank_account=store.bank_account,
        bank_holder=store.bank_holder
    )
    db.add(new_req)
    db.commit()
    
    return {"message": "Gửi yêu cầu rút tiền thành công"}