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

    class Config:
        from_attributes = True