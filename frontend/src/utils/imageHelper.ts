// src/utils/imageHelper.ts

const API_DOMAIN = "https://zenergy.cloud"; 

export const getFullImageUrl = (path: string | null | undefined) => {
  // 1. Nếu không có ảnh -> Trả về ảnh placeholder mặc định
  if (!path) {
    return "https://placehold.co/100x100?text=No+Image"; // Hoặc link ảnh logo mặc định của bạn
  }

  // 2. Nếu là link tuyệt đối (đã có http) -> Giữ nguyên
  if (path.startsWith("http")) {
    return path;
  }

  // 3. Xử lý trường hợp lỗi "None" cũ trong Database
  // Biến "None/static/..." thành "https://zenergy.cloud/static/..."
  if (path.startsWith("None/")) {
    return path.replace("None", API_DOMAIN);
  }

  // 4. Nếu là đường dẫn tương đối (/static/...) -> Nối thêm Domain
  if (path.startsWith("/")) {
    return `${API_DOMAIN}${path}`;
  }

  // 5. Trường hợp còn lại, nối thêm domain và dấu /
  return `${API_DOMAIN}/${path}`;
};