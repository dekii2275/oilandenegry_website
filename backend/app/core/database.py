from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. Tạo động cơ kết nối (Engine) từ URL trong file config
engine = create_engine(settings.DATABASE_URL)

# 2. Tạo phiên làm việc (Session)
# Mỗi khi có request từ người dùng, ta sẽ mở một session này
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Class cơ sở (Base)
# Tất cả các bảng (như User) sẽ kế thừa từ class này
Base = declarative_base()

# 4. Hàm Dependency (Dùng trong API)
# Hàm này giúp mở kết nối DB khi bắt đầu request và đóng lại khi xong việc
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
