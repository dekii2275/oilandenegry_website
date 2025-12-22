from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)          # Tiêu đề bài viết
    slug = Column(String, index=True, unique=True)  # Đường dẫn đẹp (vd: gia-dau-tang-manh)
    summary = Column(Text)                          # Tóm tắt (Do AI viết hoặc cắt từ Sapo)
    content = Column(Text)                          # Nội dung chi tiết (nếu cần)
    image_url = Column(String)                      # Link ảnh đại diện
    original_url = Column(String, unique=True)      # Link gốc (để trỏ về nguồn & tránh trùng)
    source = Column(String)                         # Nguồn: VnExpress, CafeF...
    
    is_published = Column(Boolean, default=True)    # Ẩn/Hiện bài viết
    created_at = Column(DateTime(timezone=True), server_default=func.now())