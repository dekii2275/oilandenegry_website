from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Text, TIMESTAMP, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PLACED = "PLACED"
    PENDING_CONFIRM = "PENDING_CONFIRM"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPING = "SHIPPING"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class PaymentMethod(str, enum.Enum):
    COD = "COD"
    BANK_TRANSFER = "BANK_TRANSFER"
    VNPAY = "VNPAY"
    MOMO = "MOMO"

class ShippingMethod(str, enum.Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    SAME_DAY = "same_day"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    
    # Order info
    status = Column(String, default=OrderStatus.PLACED.value)
    payment_method = Column(String, nullable=False)
    shipping_method = Column(String, default=ShippingMethod.STANDARD.value)
    
    # Pricing
    subtotal = Column(Numeric(12, 2), nullable=False)
    discount = Column(Numeric(12, 2), default=0)
    shipping_fee = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), nullable=False)
    
    # Additional info
    note = Column(Text, nullable=True)
    voucher_code = Column(String, nullable=True)
    payment_url = Column(String, nullable=True)  # Cho online payment
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("app.models.users.User", back_populates="orders")
    address = relationship("app.models.address.Address")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=False)
    
    # Snapshot tại thời điểm checkout
    product_name = Column(String, nullable=False)
    variant_name = Column(String, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="items")
    variant = relationship("Variant", back_populates="order_items")