from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)  # Mỗi user chỉ có 1 store
    
    # Thông tin cửa hàng
    store_name = Column(String, nullable=False)  # Tên cửa hàng
    store_description = Column(Text, nullable=True)  # Mô tả cửa hàng
    phone_number = Column(String, nullable=True)  # Số điện thoại cửa hàng
    address = Column(String, nullable=True)  # Địa chỉ cửa hàng
    city = Column(String, nullable=True)  # Tỉnh/Thành phố
    district = Column(String, nullable=True)  # Quận/Huyện
    ward = Column(String, nullable=True)  # Phường/Xã
    
    # Thông tin pháp lý (có thể cần cho admin duyệt)
    business_license = Column(String, nullable=True)  # Giấy phép kinh doanh
    tax_code = Column(String, nullable=True)  # Mã số thuế
    
    # Trạng thái
    is_active = Column(Boolean, default=False)  # Cửa hàng có đang hoạt động không
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationship với User
    owner = relationship("app.models.users.User", back_populates="store")
