from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey,
    TIMESTAMP, Float, Numeric
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON

from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)

    brand = Column(String, nullable=True)
    origin = Column(String, nullable=True)
    warranty = Column(String, nullable=True)
    unit = Column(String, nullable=True)

    # 🖼️ ẢNH CHÍNH: Dùng cho hiển thị danh sách nhanh
    image_url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    specifications = Column(JSON, nullable=True)

    # 💰 THÔNG TIN BÁN HÀNG: Đã hợp nhất từ Variant vào đây
    price = Column(Numeric(12, 2), nullable=True)
    market_price = Column(Numeric(12, 2), nullable=True)
    stock = Column(Integer, default=0)
    sku = Column(String, nullable=True)

    rating_average = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # 🔗 RELATIONSHIPS
    # Giữ lại bảng ảnh phụ để làm Gallery (nhiều ảnh cho 1 sản phẩm)
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    # Quan hệ với cửa hàng
    store = relationship("app.models.store.Store", back_populates="products")
    
    # ❌ ĐÃ XÓA relationship variants vì bạn không dùng bảng này nữa

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    display_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

# ❌ ĐÃ XÓA HOÀN TOÀN CLASS VARIANT ĐỂ TRÁNH LỖI MAPPER