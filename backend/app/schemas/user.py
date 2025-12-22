from pydantic import BaseModel, EmailStr
from typing import Optional

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
    email: str
    full_name: Optional[str] = None
    role: str
    is_verified: bool # Trả về trạng thái xác thực
    is_approved: Optional[bool] = False
    avatar_url: Optional[str] = None # <-- Thêm dòng này

    class Config:
        from_attributes = True

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