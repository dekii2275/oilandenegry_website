from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base
from pydantic import BaseModel, EmailStr
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="CUSTOMER")
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


# 1. Dữ liệu gửi lên khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 2. Dữ liệu Token trả về khi đăng nhập thành công
class Token(BaseModel):
    access_token: str
    token_type: str