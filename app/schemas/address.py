from pydantic import BaseModel
from typing import Optional

# 1. Dữ liệu khách nhập vào
class AddressCreate(BaseModel):
    full_name: str
    phone_number: str
    city: str
    district: str
    ward: str
    detail_address: str
    is_default: bool = False

# 2. Dữ liệu trả về (Có thêm ID và UserID)
class AddressResponse(AddressCreate):
    id: int
    user_id: int

    class Config:
        orm_mode = True