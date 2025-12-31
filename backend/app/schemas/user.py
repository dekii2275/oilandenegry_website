from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Khuôn mẫu dữ liệu gửi lên khi Đăng ký
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

# Khuôn mẫu dữ liệu gửi lên khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Khuôn mẫu dữ liệu Server trả về (Giấu mật khẩu đi)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool            # <--- Thêm dòng này (để biết Active/Banned)
    is_verified: bool          # <--- Thêm dòng này
    created_at: Optional[datetime] = None  # <--- Thêm dòng này (để hiện ngày tạo)
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True # Quan trọng

# Dùng cho API 1: Yêu cầu gửi mail
class EmailSchema(BaseModel):
    email: EmailStr

# Dùng cho API 2: Đặt lại mật khẩu
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str

# API update user
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

# Schema cho đăng ký seller (customer đăng ký làm seller)
class SellerRegistrationRequest(BaseModel):
    store_name: str
    store_description: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    business_license: Optional[str] = None
    tax_code: Optional[str] = None