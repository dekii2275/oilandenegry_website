from sqlalchemy import Column, Integer, String, ForeignKey, Text, TIMESTAMP, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)  # 1 đến 5 sao
    comment = Column(Text, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Constraints: Rating phải từ 1-5
    __table_args__ = (CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),)

    # Relationships
    user = relationship("app.models.users.User", backref="reviews")
    product = relationship("app.models.product.Product", backref="reviews")
    order = relationship("app.models.order.Order", backref="reviews")