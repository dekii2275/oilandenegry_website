from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.models.newsletter import Subscriber

router = APIRouter()

# --- 1. Định nghĩa dữ liệu đầu vào (Validation) ---
# Dùng Pydantic để tự động kiểm tra email có hợp lệ không (có @, có dấu chấm...)
class NewsletterInput(BaseModel):
    email: EmailStr

# --- 2. Viết API ---
@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe_newsletter(
    data: NewsletterInput, 
    db: Session = Depends(get_db)
):
    # Bước 1: Kiểm tra xem email này đã đăng ký chưa
    # (Tìm trong bảng Subscriber xem có dòng nào trùng email không)
    existing_sub = db.query(Subscriber).filter(Subscriber.email == data.email).first()
    
    if existing_sub:
        # Nếu đã có rồi thì báo lỗi 400 (Bad Request) để Frontend biết
        raise HTTPException(
            status_code=400, 
            detail="Email này đã được đăng ký trước đó rồi!"
        )
    
    # Bước 2: Tạo đối tượng người đăng ký mới
    new_sub = Subscriber(email=data.email)
    
    # Bước 3: Lưu vào Database
    try:
        db.add(new_sub)       # Thêm vào session
        db.commit()           # Lưu chính thức (Commit transaction)
        db.refresh(new_sub)   # Lấy lại thông tin (bao gồm ID vừa sinh ra)
        
        return {
            "message": "Đăng ký nhận tin thành công!", 
            "email": data.email,
            "id": new_sub.id
        }
    except Exception as e:
        db.rollback() # Nếu lỗi thì hoàn tác, không lưu bậy
        raise HTTPException(status_code=500, detail="Lỗi hệ thống, vui lòng thử lại sau.")