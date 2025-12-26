from sqlalchemy import Column, Integer, String, Boolean, Text, Numeric, ForeignKey, TIMESTAMP, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True) # URL thân thiện (vd: he-thong-dien-mat-troi-50kw)
    description = Column(Text, nullable=True) # Mô tả chi tiết (HTML)
    category = Column(String, nullable=True, index=True) # Danh mục (Điện mặt trời, Dầu thô...)
    
    # --- CÁC TRƯỜNG MỚI BỔ SUNG CHO KHỚP UI ---
    brand = Column(String, nullable=True)     # Thương hiệu (VD: SunPower Maxeon)
    origin = Column(String, nullable=True)    # Xuất xứ (VD: USA, Vietnam)
    warranty = Column(String, nullable=True)  # Bảo hành (VD: 25 năm)
    unit = Column(String, nullable=True)      # Đơn vị tính (VD: Bộ, Thùng, Lít)
    
    # Ảnh đại diện chính (Hiện ở trang danh sách)
    image_url = Column(String, nullable=True) 
    
    # Nhãn sản phẩm (VD: ["HOT", "BÁN SỈ", "NEW"]) - Lưu dạng JSON
    tags = Column(JSON, nullable=True) 
    
    # Thông số kỹ thuật (Lưu JSON cho linh động. VD: {"cong_suat": "50kW", "loai_pin": "Mono"})
    specifications = Column(JSON, nullable=True)

    # Thống kê nhanh (Để đỡ phải query bảng Review nhiều lần)
    rating_average = Column(Float, default=0.0) # 4.8
    review_count = Column(Integer, default=0)   # 24 đánh giá
    
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    variants = relationship("Variant", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan") # Quan hệ 1-nhiều ảnh
    store = relationship("app.models.store.Store", back_populates="products")

# Bảng mới: Lưu danh sách ảnh chi tiết (Gallery)
class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    display_order = Column(Integer, default=0) # Thứ tự hiển thị
    
    product = relationship("Product", back_populates="images")

class Variant(Base):
    __tablename__ = "variants"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    name = Column(String, nullable=False)  # VD: "Gói tiêu chuẩn", "Gói cao cấp"
    sku = Column(String, unique=True, nullable=True)
    
    # --- BỔ SUNG GIÁ GỐC ĐỂ TÍNH GIẢM GIÁ ---
    price = Column(Numeric(12, 2), nullable=False)        # Giá bán hiện tại ($12.450)
    market_price = Column(Numeric(12, 2), nullable=True)  # Giá thị trường/Giá gốc ($15.850)
    
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    product = relationship("Product", back_populates="variants")
    cart_items = relationship("CartItem", back_populates="variant")
    order_items = relationship("OrderItem", back_populates="variant")