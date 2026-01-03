# app/schemas/order.py

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from decimal import Decimal
from datetime import datetime

# Định nghĩa phương thức thanh toán
PaymentMethod = Literal["COD", "QR"]

# --- 1. Schema cho việc TẠO đơn hàng (Dùng cho Buyer) ---
class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=5)
    payment_method: PaymentMethod

# --- 2. Schema hiển thị Item (Sản phẩm trong đơn) ---
class OrderItemOut(BaseModel):
    product_id: int
    product_name: str
    store_id: int | None = None
    store_name: str | None = None
    quantity: int
    price: Decimal
    line_total: Decimal

    # ✅ BẮT BUỘC CÓ: Để Pydantic đọc được dữ liệu từ SQLAlchemy model
    class Config:
        from_attributes = True 

# --- 3. Schema hiển thị Đơn hàng (Chung hoặc cho Seller) ---
class OrderOut(BaseModel):
    order_id: int           # Frontend đang dùng order_id, Backend Order model dùng id (cần map hoặc đổi tên)
    # Lưu ý: Nếu model Order của bạn có field là 'id', Pydantic nên để là 'id' hoặc dùng alias. 
    # Nhưng để khớp với frontend code bạn gửi, mình sẽ giữ order_id và xử lý ở API.
    
    user_id: int
    
    # ✅ THÊM MỚI: Thông tin khách hàng cho Seller xem
    customer_name: Optional[str] = "Khách vãng lai"
    customer_phone: Optional[str] = None

    status: str
    payment_method: str
    shipping_address: str
    created_at: datetime

    subtotal: Decimal
    shipping_fee: Decimal = Decimal(0)
    tax: Decimal = Decimal(0)
    total_amount: Decimal

    items: List[OrderItemOut]

    # ✅ BẮT BUỘC CÓ
    class Config:
        from_attributes = True