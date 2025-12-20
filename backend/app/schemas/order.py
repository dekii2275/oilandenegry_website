from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.models.order import OrderStatus, PaymentMethod, ShippingMethod

class OrderCreate(BaseModel):
    address_id: int
    payment_method: str  # COD, BANK_TRANSFER, VNPAY, MOMO
    shipping_method: str = "standard"
    note: Optional[str] = None
    voucher_code: Optional[str] = None

class OrderPreviewRequest(BaseModel):
    address_id: int
    shipping_method: str = "standard"
    voucher_code: Optional[str] = None

class OrderPreviewResponse(BaseModel):
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    total: Decimal
    warnings: List[str] = []

class OrderItemResponse(BaseModel):
    id: int
    product_name: str
    variant_name: str
    price: Decimal
    quantity: int
    line_total: Decimal
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    order_id: int
    status: str
    total: Decimal
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderDetailResponse(OrderResponse):
    address_id: int
    payment_method: str
    shipping_method: str
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    note: Optional[str] = None
    voucher_code: Optional[str] = None
    payment_url: Optional[str] = None
    
    class Config:
        from_attributes = True