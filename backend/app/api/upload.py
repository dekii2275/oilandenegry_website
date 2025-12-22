from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid

router = APIRouter()

# Cấu hình thư mục lưu ảnh
UPLOAD_DIR = "static/images"
# Tạo thư mục nếu chưa có
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Thay IP này bằng IP Server AWS của bạn (để trả về link ảnh xem được)
BASE_URL = os.getenv("BASE_URL")

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    # 1. Kiểm tra định dạng file
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh (jpg, png)")

    # 2. Đổi tên file để không bị trùng (dùng UUID)
    # Ví dụ: avatar.jpg -> 550e8400-e29b-....jpg
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_location = f"{UPLOAD_DIR}/{new_filename}"

    # 3. Lưu file vào ổ cứng server
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Trả về đường dẫn xem ảnh
    # Ví dụ: http://3.131.../static/images/abc.jpg
    url = f"{BASE_URL}/{file_location}"
    
    return {"url": url}