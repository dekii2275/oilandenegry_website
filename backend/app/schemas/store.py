from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema để customer gửi thông tin cửa hàng khi đăng ký seller
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

# Schema trả về thông tin store
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

# Schema để admin xem danh sách seller với thông tin đầy đủ
class SellerWithStoreResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_verified: bool
    is_approved: bool
    created_at: datetime
    store: Optional[StoreResponse] = None

    class Config:
        from_attributes = True
