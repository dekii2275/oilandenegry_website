from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from uuid import uuid4

router = APIRouter()

# Cấu hình thư mục lưu ảnh
UPLOAD_DIR = "static/images"
# Tạo thư mục nếu chưa có
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    # 1. Kiểm tra định dạng file
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/webp"]:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh (jpg, png, webp)")

    try:
        # 2. Đổi tên file để không bị trùng (dùng UUID)
        # Lấy đuôi file (ví dụ: .jpg)
        file_extension = file.filename.split(".")[-1]
        new_filename = f"{uuid4()}.{file_extension}"
        
        # Đường dẫn file trên ổ cứng (để lưu)
        file_path = f"{UPLOAD_DIR}/{new_filename}"

        # 3. Lưu file vào ổ cứng server
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4. Trả về đường dẫn xem ảnh (Đường dẫn tương đối)
        # ✅ QUAN TRỌNG: Trả về bắt đầu bằng dấu "/" (ví dụ: /static/images/abc.jpg)
        # Frontend sẽ tự nối thêm https://zenergy.cloud vào trước.
        url = f"/{file_path}"
        
        return {"url": url}

    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Lỗi lưu ảnh lên server")