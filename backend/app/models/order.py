from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, TIMESTAMP, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

# --- ĐỊNH NGHĨA ENUM (ĐỂ KHỚP VỚI API/ORDERS.PY) ---
class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPING = "SHIPPING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentMethod(str, enum.Enum):
    COD = "COD"
    BANK_TRANSFER = "BANK_TRANSFER"
    CREDIT_CARD = "CREDIT_CARD"

class ShippingMethod(str, enum.Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"

# ---------------------------------------------------

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    total_amount = Column(Numeric(12, 2), nullable=False)
    
    # Lưu dưới dạng String trong DB để tránh lỗi phức tạp với PostgreSQL Enum lúc này
    status = Column(String, default=OrderStatus.PENDING)
    shipping_address = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    shipping_method = Column(String, default=ShippingMethod.STANDARD) # Thêm cột này cho đủ bộ

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("app.models.users.User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    # reviews = relationship("app.models.review.Review", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=False)
    
    quantity = Column(Integer, default=1)
    price = Column(Numeric(12, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    variant = relationship("app.models.product.Variant", back_populates="order_items")