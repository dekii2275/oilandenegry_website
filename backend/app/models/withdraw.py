# app/models/withdraw.py

from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

# ⛔️ TUYỆT ĐỐI KHÔNG IMPORT Store Ở ĐÂY
# NẾU CÓ DÒNG NÀY HÃY XÓA NÓ ĐI: from app.models.store import ...

class WithdrawRequest(Base):
    __tablename__ = "withdraw_requests"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    status = Column(String, default="PENDING") 
    
    bank_name = Column(String, nullable=True)
    bank_account = Column(String, nullable=True)
    bank_holder = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # ✅ Dùng chuỗi String chính xác này:
    store = relationship("app.models.store.Store", back_populates="withdraws")