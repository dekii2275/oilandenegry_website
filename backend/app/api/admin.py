from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.users import User
from app.models.store import Store
from app.api.deps import get_current_admin
from app.schemas.store import SellerWithStoreResponse, StoreResponse
from app.schemas.user import UserResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

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

# --- API LẤY DANH SÁCH SELLER CHỜ DUYỆT ---
@router.get("/sellers/pending", response_model=List[SellerWithStoreResponse])
def get_pending_sellers(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    pending_sellers = (
        db.query(User)
        .join(Store, Store.user_id == User.id)
        .filter(
            User.role == "CUSTOMER",
            User.is_approved == False,
            Store.is_active == False,
        )
        .all()
    )
    
    result = []
    for seller in pending_sellers:
        store = db.query(Store).filter(Store.user_id == seller.id).first()
        seller_data = {
            "id": seller.id,
            "email": seller.email,
            "full_name": seller.full_name,
            "role": seller.role,
            "is_verified": seller.is_verified,
            "is_approved": seller.is_approved,
            "created_at": seller.created_at,
            "store": StoreResponse.from_orm(store) if store else None
        }
        result.append(SellerWithStoreResponse(**seller_data))
    
    return result

# --- API XEM CHI TIẾT SELLER ---
@router.get("/sellers/{seller_id}", response_model=SellerWithStoreResponse)
def get_seller_detail(
    seller_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    API để Admin xem chi tiết thông tin của một Seller
    """
    seller = db.query(User).filter(
        User.id == seller_id,
        User.role == "SELLER"
    ).first()
    
    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Seller này"
        )
    
    store = db.query(Store).filter(Store.user_id == seller.id).first()
    
    seller_data = {
        "id": seller.id,
        "email": seller.email,
        "full_name": seller.full_name,
        "role": seller.role,
        "is_verified": seller.is_verified,
        "is_approved": seller.is_approved,
        "created_at": seller.created_at,
        "store": StoreResponse.from_orm(store) if store else None
    }
    
    return SellerWithStoreResponse(**seller_data)

# --- API DUYỆT SELLER ---
@router.put("/sellers/{seller_id}/approve", response_model=UserResponse)
def approve_seller(
    seller_id: int,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Tìm user (lúc này vẫn đang là CUSTOMER)
    user = db.query(User).filter(User.id == seller_id, User.role == "CUSTOMER", User.is_approved == False).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    store = db.query(Store).filter(Store.user_id == user.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Không tìm thấy store của người dùng này")

    # Thực hiện nâng cấp role và duyệt
    user.role = "SELLER" 
    user.is_approved = True
    store.is_active = True
    
    
    db.commit()
    db.refresh(user)

    # Gửi email thông báo cho seller
    html = f"""
    <h3>Chúc mừng! Tài khoản Nhà bán hàng đã được duyệt</h3>
    <p>Xin chào {user.full_name},</p>
    <p>Yêu cầu đăng ký Nhà bán hàng của bạn trên <b>Energy Platform</b> đã được Admin phê duyệt thành công.</p>
    <p>Bây giờ bạn có thể đăng nhập và bắt đầu đăng tải các sản phẩm của cửa hàng mình.</p>
    <br>
    <p>Trân trọng,<br>Đội ngũ hỗ trợ Energy Platform</p>
    """
    message = MessageSchema(
        subject="[Energy Platform] Thông báo: Duyệt tài khoản Nhà bán hàng THÀNH CÔNG",
        recipients=[user.email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message)

    return user

# --- API TỪ CHỐI SELLER ---
@router.put("/sellers/{seller_id}/reject", response_model=dict)
async def reject_seller(
    seller_id: int,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == seller_id, User.role == "CUSTOMER").first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    user_email = user.email
    user_name = user.full_name

    user.is_approved = False
    
    # Xóa store đang chờ duyệt để biến mất khỏi pending
    store = db.query(Store).filter(Store.user_id == user.id).first()
    if store:
        db.delete(store)
    
    db.commit()

    html = f"""
    <h3>Thông báo về yêu cầu đăng ký Nhà bán hàng</h3>
    <p>Xin chào {user_name},</p>
    <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu đăng ký Nhà bán hàng của bạn đã <b>không được phê duyệt</b> vào lúc này.</p>
    <p>Lý do có thể do thông tin cửa hàng hoặc giấy phép kinh doanh chưa hợp lệ. Bạn vui lòng kiểm tra lại thông tin và đăng ký lại hoặc liên hệ hỗ trợ.</p>
    <br>
    <p>Trân trọng,<br>Đội ngũ hỗ trợ Energy Platform</p>
    """
    message = MessageSchema(
        subject="[Energy Platform] Thông báo: Kết quả đăng ký Nhà bán hàng",
        recipients=[user_email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message)
    
    return {
        "message": f"Đã từ chối đăng ký của {user_email}. Email thông báo đã được gửi."
    }