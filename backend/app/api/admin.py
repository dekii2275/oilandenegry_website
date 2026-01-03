from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, and_
from typing import List, Optional

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.models.order import Order # ✅ Cần import Order để check khi xóa user
from app.api.deps import get_current_admin
from app.schemas.store import SellerWithStoreResponse, StoreResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from app.models.order import Order, OrderItem # Import Order Model
from sqlalchemy.orm import joinedload

# Cấu hình Email
mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

router = APIRouter()

# =================================================================
# 1. API QUẢN LÝ USER (✅ MỚI BỔ SUNG)
# =================================================================

# 1.1 Lấy danh sách tất cả User
@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API cho Admin lấy danh sách User.
    Frontend gọi: GET /api/admin/users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    
    results = []
    for user in users:
        results.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at
        })
    return results

# 1.2 Khóa / Mở khóa tài khoản
@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool, # Nhận từ query param ?is_active=true
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Không thể khóa tài khoản Admin")

    user.is_active = is_active
    db.commit()
    
    action = "Mở khóa" if is_active else "Khóa"
    return {"message": f"Đã {action} tài khoản thành công"}

# 1.3 Xóa tài khoản vĩnh viễn
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    if user.role == "ADMIN":
         raise HTTPException(status_code=400, detail="Không thể xóa tài khoản Admin")

    # Kiểm tra ràng buộc dữ liệu: Không xóa nếu User đã có Store hoặc Đơn hàng
    has_store = db.query(Store).filter(Store.user_id == user.id).first()
    has_orders = db.query(Order).filter(Order.user_id == user.id).first()

    if has_store or has_orders:
        raise HTTPException(
            status_code=400, 
            detail="User này đã có dữ liệu giao dịch (Cửa hàng/Đơn hàng). Vui lòng chọn KHÓA tài khoản thay vì Xóa."
        )

    db.delete(user)
    db.commit()
    return {"message": "Đã xóa người dùng vĩnh viễn"}


# =================================================================
# 2. API QUẢN LÝ SELLER (Giữ nguyên logic cũ)
# =================================================================
@router.get("/sellers", response_model=List[SellerWithStoreResponse])
def get_all_sellers(
    status: Optional[str] = Query(None, description="pending | active | blocked"),
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Store, User).join(User, Store.user_id == User.id)

    if status == "pending":
        query = query.filter(User.is_approved == False)
    elif status == "active":
        query = query.filter(User.is_approved == True, Store.is_active == True)
    elif status == "blocked":
        query = query.filter(User.is_approved == True, Store.is_active == False)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Store.store_name.ilike(term),
                User.email.ilike(term),
                User.full_name.ilike(term)
            )
        )

    raw_results = query.order_by(desc(Store.created_at)).all()
    final_results = []
    
    for store_obj, user_obj in raw_results:
        try:
             store_data = StoreResponse.from_orm(store_obj)
             seller_data = {
                "id": user_obj.id,
                "email": user_obj.email,
                "full_name": user_obj.full_name,
                "role": user_obj.role,
                "is_verified": user_obj.is_verified,
                "is_approved": user_obj.is_approved,
                "is_active": user_obj.is_active,
                "created_at": user_obj.created_at,
                "store": store_data
            }
             final_results.append(SellerWithStoreResponse(**seller_data))
        except Exception as e:
            print(f"⚠️ Data Error User {user_obj.id}: {str(e)}")
            continue
            
    return final_results


# =================================================================
# 3. API DUYỆT / TỪ CHỐI SELLER (Giữ nguyên logic cũ)
# =================================================================
@router.put("/sellers/{user_id}/approve")
def approve_seller(
    user_id: int,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    store = db.query(Store).filter(Store.user_id == user_id).first()

    if not user or not store:
        raise HTTPException(404, "Không tìm thấy dữ liệu Seller/Store")

    user.role = "SELLER"
    user.is_approved = True
    user.is_active = True
    store.is_active = True 
    db.commit()

    send_email_notification(
        background_tasks, user.email, 
        "Đăng ký thành công", 
        f"Chúc mừng {user.full_name}, gian hàng {store.store_name} của bạn đã được duyệt!"
    )
    return {"message": "Đã duyệt thành công"}

@router.put("/sellers/{user_id}/reject")
def reject_seller(
    user_id: int,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    store = db.query(Store).filter(Store.user_id == user_id).first()

    if not user:
        raise HTTPException(404, "Không tìm thấy User")

    email = user.email
    name = user.full_name

    if store:
        db.delete(store)
    
    user.is_approved = False
    db.commit()

    send_email_notification(
        background_tasks, email, 
        "Đăng ký bị từ chối", 
        f"Chào {name}, hồ sơ đăng ký Seller của bạn chưa đạt yêu cầu. Vui lòng kiểm tra lại thông tin."
    )
    return {"message": "Đã từ chối và xóa hồ sơ"}


# HELPER GỬI MAIL
def send_email_notification(bg_tasks, email, subject, body):
    if not settings.MAIL_USERNAME:
        print(f"📧 [Mock Email] To: {email} | Subject: {subject}")
        return

    message = MessageSchema(
        subject=f"[Energy Platform] {subject}",
        recipients=[email],
        body=body,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    bg_tasks.add_task(fm.send_message, message)
    
# 6. API QUẢN LÝ ĐƠN HÀNG (Dành cho Admin)
# =================================================================
@router.get("/orders")
def get_admin_orders(
    payment_method: Optional[str] = Query(None, description="COD | QR"),
    status: Optional[str] = Query(None, description="Trạng thái đơn hàng"),
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách đơn hàng toàn hệ thống.
    Hỗ trợ lọc theo: Phương thức thanh toán (COD/QR) và Trạng thái.
    """
    # Query cơ bản: Lấy đơn hàng, nạp trước thông tin User và Items để tránh N+1 query
    query = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.items)
    )

    # 1. Lọc theo phương thức thanh toán (COD hoặc QR)
    if payment_method:
        query = query.filter(Order.payment_method == payment_method)

    # 2. Lọc theo trạng thái (PENDING, COMPLETED...)
    if status and status != "ALL":
        query = query.filter(Order.status == status)

    # 3. Tìm kiếm theo Mã đơn hoặc Tên khách
    if search:
        search_term = f"%{search}%"
        query = query.join(User).filter(
            or_(
                Order.id.cast(str).like(search_term),
                User.full_name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    # Sắp xếp mới nhất lên đầu
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()

    # Map dữ liệu trả về
    results = []
    for o in orders:
        # Tính tổng số lượng item
        total_items = sum(item.quantity for item in o.items)
        
        results.append({
            "order_id": o.id,
            "created_at": o.created_at,
            "customer_name": o.user.full_name if o.user else "Khách vãng lai",
            "payment_method": o.payment_method, # quan trọng: COD hay QR
            "status": o.status,
            "total_amount": o.total_amount,
            "item_count": total_items,
            "shipping_address": o.shipping_address
        })

    return {
        "data": results,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit
    }

@router.put("/orders/{order_id}/confirm-payment")
def confirm_qr_payment(
    order_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Dành cho đơn hàng QR Banking đang PENDING.
    Admin bấm xác nhận -> Status chuyển thành CONFIRMED.
    Lúc này Seller sẽ thấy đơn hàng ở trạng thái "Chờ xác nhận" để chuẩn bị hàng.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Chỉ xác nhận cho đơn QR và đang chờ
    if order.payment_method != "QR":
        raise HTTPException(status_code=400, detail="Chỉ áp dụng cho đơn thanh toán QR/Chuyển khoản")
        
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Đơn hàng này không ở trạng thái chờ thanh toán")

    # Cập nhật trạng thái
    order.status = "CONFIRMED"
    db.commit()
    
    return {
        "message": "Đã xác nhận thanh toán thành công",
        "order_id": order.id,
        "new_status": "CONFIRMED"
    }