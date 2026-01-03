from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="CUSTOMER")
    phone_number = Column(String, nullable=True)
    
    # --- BỔ SUNG CỘT CÒN THIẾU ---
    is_active = Column(Boolean, default=True)  # <--- Fix lỗi Seed data
    # -----------------------------
    
    is_verified = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    avatar_url = Column(String, nullable=True)

    # --- RELATIONSHIPS (Dùng đường dẫn đầy đủ để tránh lỗi import vòng tròn) ---
    addresses = relationship("app.models.address.Address", back_populates="owner")
    store = relationship("app.models.store.Store", back_populates="owner", uselist=False)
    
    # Sửa lại đường dẫn full path cho Cart và Order để an toàn hơn
    cart = relationship("app.models.cart.Cart", back_populates="user", uselist=False)
    orders = relationship("app.models.order.Order", back_populates="user")
    
    # --- BỔ SUNG RELATIONSHIP REVIEW ---
    reviews = relationship("app.models.review.Review", back_populates="user")
    # -----------------------------------


# 1. Dữ liệu gửi lên khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 2. Dữ liệu Token trả về khi đăng nhập thành công
class Token(BaseModel):
    access_token: str
    token_type: str