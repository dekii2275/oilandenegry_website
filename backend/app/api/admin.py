from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, and_
from typing import List, Optional

from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.api.deps import get_current_admin
from app.schemas.store import SellerWithStoreResponse, StoreResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

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

# 👇 QUAN TRỌNG: Khởi tạo Router để main.py gọi được
router = APIRouter()

# =================================================================
# 1. API LẤY DANH SÁCH SELLER (TỐI ƯU HÓA JOIN)
# =================================================================
@router.get("/sellers", response_model=List[SellerWithStoreResponse])
def get_all_sellers(
    status: Optional[str] = Query(None, description="pending | active | blocked"),
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách Seller bằng cách JOIN bảng Store và User ngay từ đầu.
    Giúp tránh lỗi thiếu dữ liệu và tăng tốc độ.
    """
    
    # KỸ THUẬT JOIN: Lấy cả object Store và User cùng lúc
    query = db.query(Store, User).join(User, Store.user_id == User.id)

    # --- BỘ LỌC TRẠNG THÁI (Logic chuẩn) ---
    if status == "pending":
        # Pending: User chưa được duyệt
        query = query.filter(User.is_approved == False)
    elif status == "active":
        # Active: Đã duyệt + Store bật + User bật
        query = query.filter(User.is_approved == True, Store.is_active == True, User.is_active == True)
    elif status == "blocked":
        # Blocked: Đã duyệt nhưng bị khóa (User tắt hoặc Store tắt)
        query = query.filter(User.is_approved == True, or_(Store.is_active == False, User.is_active == False))

    # --- TÌM KIẾM ---
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Store.store_name.ilike(term),       # Tên Shop
                User.email.ilike(term),             # Email chủ shop
                User.full_name.ilike(term),         # Tên chủ shop
                Store.phone_number.ilike(term)      # SĐT shop
            )
        )

    # Sắp xếp: Mới nhất lên đầu
    # Kết quả trả về là list các tuple: [(StoreObj, UserObj), ...]
    raw_results = query.order_by(desc(Store.created_at)).all()

    # --- MAP DỮ LIỆU ---
    final_results = []
    
    for store_obj, user_obj in raw_results:
        try:
            # Gom dữ liệu từ 2 bảng vào 1 Schema trả về
            seller_data = {
                "id": user_obj.id,
                "email": user_obj.email,
                "full_name": user_obj.full_name,
                "role": user_obj.role,
                "is_verified": user_obj.is_verified,
                "is_approved": user_obj.is_approved,
                "is_active": user_obj.is_active,
                "created_at": user_obj.created_at,
                
                # Convert object Store thành Schema StoreResponse
                # (Sử dụng from_orm để map tự động các trường như city, district...)
                "store": StoreResponse.from_orm(store_obj)
            }
            final_results.append(SellerWithStoreResponse(**seller_data))
        except Exception as e:
            # Nếu có 1 dòng lỗi data, in log và bỏ qua, KHÔNG làm sập app
            print(f"⚠️ Lỗi map data Seller ID {user_obj.id}: {e}")
            continue
            
    return final_results


# =================================================================
# 2. API DUYỆT (APPROVE)
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

    # Cập nhật trạng thái
    user.role = "SELLER"
    user.is_approved = True
    user.is_active = True
    store.is_active = True 
    
    db.commit()

    # Gửi mail thông báo
    send_email_notification(
        background_tasks, user.email, 
        "Đăng ký thành công", 
        f"Chúc mừng {user.full_name}, gian hàng {store.store_name} của bạn đã được duyệt!"
    )
    return {"message": "Đã duyệt thành công"}


# =================================================================
# 3. API TỪ CHỐI (REJECT)
# =================================================================
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

    # Nếu từ chối: Xóa Store rác, Reset User về trạng thái chưa duyệt
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


# =================================================================
# HELPER GỬI MAIL
# =================================================================
def send_email_notification(bg_tasks, email, subject, body):
    # Kiểm tra nếu chưa cấu hình mail thì log ra console
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