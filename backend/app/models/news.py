from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class News(Base):
    __tablename__ = "news"

    # 1. Định danh cơ bản
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, index=True, unique=True)  # Đường dẫn trên URL (vd: gia-dau-tang-manh)
    original_url = Column(String, unique=True)      # Link gốc bài báo (để check trùng lặp)

    # 2. Nội dung chính
    title = Column(String, nullable=False)          # Tiêu đề bài viết
    summary = Column(Text)                          # Tóm tắt ngắn (hiện ở trang chủ)
    content = Column(Text)                          # Nội dung chi tiết (Markdown do AI viết lại)
    image_url = Column(String)                      # Ảnh đại diện (Thumbnail)

    # 3. Phân loại & Metadata (Để hiển thị giao diện đẹp)
    category = Column(String, index=True)           # VD: "Thị trường", "Công nghệ", "Điện gió"
    tags = Column(String)                           # Lưu các tag cách nhau dấu phẩy. VD: "xăng,dầu,netzero"
    author = Column(String, default="Ban biên tập") # Tên tác giả
    source = Column(String, default="Tổng hợp")     # Nguồn lấy tin (CafeF, VnExpress...)

    # 4. Chỉ số & Thời gian
    views = Column(Integer, default=0)              # Đếm lượt xem (để làm mục "Tin nổi bật")
    is_published = Column(Boolean, default=True)    # Ẩn/Hiện bài viết
    
    published_at = Column(DateTime(timezone=True))  # Thời gian bài báo gốc được đăng
    created_at = Column(DateTime(timezone=True), server_default=func.now()) # Thời gian mình crawl về