import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# ✅ BỔ SUNG CLASS NÀY (Đã bị thiếu trước đó)
class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"      # Chờ xử lý (hoặc chờ thanh toán QR)
    CONFIRMED = "CONFIRMED"  # Đã xác nhận (Seller chuẩn bị hàng)
    SHIPPING = "SHIPPING"    # Đang giao hàng
    COMPLETED = "COMPLETED"  # Thành công / Đã nhận hàng
    CANCELLED = "CANCELLED"  # Đã hủy

class Order(Base):
    __tablename__ = "orders"
    
    # ✅ Giữ dòng này để tránh lỗi "Table already defined"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Thông tin người nhận
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    shipping_address = Column(String, nullable=True)
    
    # Thông tin thanh toán
    total_amount = Column(DECIMAL(15, 2), default=0)
    
    # Trạng thái: Lưu dưới dạng String trong DB nhưng dùng Enum trong code
    status = Column(String, default=OrderStatus.PENDING.value)
    
    payment_method = Column(String, default="COD") # COD, QR
    note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # --- RELATIONSHIPS (DÙNG CHUỖI STRING ĐỂ TRÁNH LỖI IMPORT) ---
    
    # Liên kết với User (Khách hàng)
    user = relationship("app.models.users.User", back_populates="orders")
    
    # Liên kết với OrderItem
    items = relationship("app.models.order.OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
    # Store ID để biết món này của shop nào
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)

    quantity = Column(Integer, default=1)
    price = Column(DECIMAL(15, 2), default=0) # Giá tại thời điểm mua

    # --- RELATIONSHIPS (DÙNG CHUỖI STRING) ---
    
    order = relationship("app.models.order.Order", back_populates="items")
    
    # Link tới Product
    product = relationship("app.models.product.Product")
    
    # Link tới Store (Dùng string để không bị lỗi Circular Import với file store.py)
    store = relationship("app.models.store.Store")