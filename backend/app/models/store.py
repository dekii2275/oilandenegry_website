# app/models/store.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, TIMESTAMP, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# ⛔️ TUYỆT ĐỐI KHÔNG IMPORT WithdrawRequest Ở ĐÂY
# NẾU CÓ DÒNG NÀY HÃY XÓA NÓ ĐI: from app.models.withdraw import ...

class Store(Base):
    __tablename__ = "stores"
    
    # ✅ Giữ dòng này để fix lỗi "Table already defined"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Thông tin cửa hàng
    store_name = Column(String, nullable=False)
    store_description = Column(Text, nullable=True)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    ward = Column(String, nullable=True)
    
    # Thông tin pháp lý
    business_license = Column(String, nullable=True)
    tax_code = Column(String, nullable=True)
    
    # Trạng thái
    is_active = Column(Boolean, default=False)
    
    # Ví tiền & Ngân hàng
    balance = Column(DECIMAL(15, 2), default=0)
    bank_name = Column(String, nullable=True)
    bank_account = Column(String, nullable=True)
    bank_holder = Column(String, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    # Dùng chuỗi string đầy đủ (full path) để tránh import vòng tròn
    owner = relationship("app.models.users.User", back_populates="store")
    products = relationship("app.models.product.Product", back_populates="store")
    
    # ✅ Dùng chuỗi String chính xác này:
    withdraws = relationship("app.models.withdraw.WithdrawRequest", back_populates="store")