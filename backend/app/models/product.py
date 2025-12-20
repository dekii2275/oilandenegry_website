from sqlalchemy import Column, Integer, String, Boolean, Text, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    variants = relationship("Variant", back_populates="product", cascade="all, delete-orphan")
    store = relationship("app.models.store.Store", back_populates="products")

class Variant(Base):
    __tablename__ = "variants"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    name = Column(String, nullable=False)  # VD: "500ml", "1L", "Màu đỏ"
    sku = Column(String, unique=True, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)  # Giá bán
    stock = Column(Integer, default=0)  # Số lượng tồn kho
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="variants")
    cart_items = relationship("CartItem", back_populates="variant")
    order_items = relationship("OrderItem", back_populates="variant")