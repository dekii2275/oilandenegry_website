from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# ❌ KHÔNG IMPORT Product Ở ĐÂY

class Cart(Base):
    __tablename__ = "carts"
    # ✅ THÊM DÒNG NÀY (BẮT BUỘC)
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # ✅ Dùng chuỗi full path
    user = relationship("app.models.users.User", back_populates="cart")
    # CartItem nằm cùng file nên dùng string tên class là được, hoặc full path cũng được
    items = relationship("app.models.cart.CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    # ✅ THÊM DÒNG NÀY (BẮT BUỘC)
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, nullable=True)

    quantity = Column(Integer, nullable=False, default=1)
    price_at_add = Column(Numeric(12, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # ✅ Dùng chuỗi full path
    cart = relationship("app.models.cart.Cart", back_populates="items")
    
    # 🔥 SỬA QUAN TRỌNG: Đổi "Product" thành full path
    product = relationship("app.models.product.Product")