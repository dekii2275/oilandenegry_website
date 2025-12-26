from sqlalchemy import Column, Integer, String, ForeignKey, Text, TIMESTAMP, CheckConstraint, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False) 
    
    rating = Column(Integer, nullable=False)
    title = Column(String, nullable=True) 
    comment = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)  
    
    reply_comment = Column(Text, nullable=True)
    reply_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),)

    # --- SỬA LỖI TẠI ĐÂY ---
    # Dùng back_populates để khớp với khai báo bên model User
    user = relationship("app.models.users.User", back_populates="reviews")
    
    # Các relationship khác vẫn dùng backref nếu model kia chưa khai báo relationship ngược lại
    # Tuy nhiên, để an toàn và chuẩn, nếu Product/Order chưa sửa thì giữ nguyên, 
    # nhưng thường Product nên dùng backref ở đây cho tiện.
    product = relationship("app.models.product.Product", backref="reviews") 
    order = relationship("app.models.order.Order", backref="reviews")