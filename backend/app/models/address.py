from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Khóa ngoại liên kết với User
    
    full_name = Column(String)      # Tên người nhận hàng
    phone_number = Column(String)   # Số điện thoại người nhận
    city = Column(String)           # Tỉnh/Thành phố
    district = Column(String)       # Quận/Huyện
    ward = Column(String)           # Phường/Xã
    detail_address = Column(String) # Số nhà, tên đường
    is_default = Column(Boolean, default=False) 

    # Thiết lập mối quan hệ với User
    owner = relationship("app.models.users.User", back_populates="addresses")