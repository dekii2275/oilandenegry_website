# backend/app/schemas/store.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# --- 1. Schema để Customer gửi khi đăng ký Seller ---
# (Khớp với form ở Frontend)
class StoreCreate(BaseModel):
    store_name: str
    store_description: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    business_license: Optional[str] = None
    tax_code: Optional[str] = None

# --- 2. Schema trả về thông tin Store đầy đủ ---
# (Dùng cho Admin hoặc chủ Shop xem)
class StoreResponse(BaseModel):
    id: int
    user_id: int
    store_name: str
    store_description: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    business_license: Optional[str] = None
    tax_code: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- 3. Schema cho Admin xem danh sách Seller ---
# (Kết hợp thông tin User + Store)
class SellerWithStoreResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_verified: bool
    is_approved: bool
    created_at: datetime
    # 👇 Quan trọng: Chứa full thông tin store ở trên (gồm cả city, district...)
    store: Optional[StoreResponse] = None

    class Config:
        from_attributes = True

# --- 4. Schema cho Khách hàng xem Store (Ẩn thông tin nhạy cảm) ---
# (Dùng cho trang Market/Product Detail)
class StorePublicResponse(BaseModel):
    id: int
    store_name: str
    store_description: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    created_at: datetime
    product_count: Optional[int] = 0  # Số lượng products của store (nếu có tính toán)
    
    class Config:
        from_attributes = True