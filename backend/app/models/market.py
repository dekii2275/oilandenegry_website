from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.core.database import Base

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)       # Ví dụ: BRENT, WTI, GAS
    symbol = Column(String)                 # Ví dụ: BZ=F, CL=F
    price = Column(Float)                   # Giá hiện tại
    change = Column(Float)                  # Thay đổi tuyệt đối
    percent = Column(Float)                 # Thay đổi phần trăm
    status = Column(String)                 # 'up' hoặc 'down'
    updated_at = Column(DateTime, default=datetime.utcnow) # Thời gian cập nhật