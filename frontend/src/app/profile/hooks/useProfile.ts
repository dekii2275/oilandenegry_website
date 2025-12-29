import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { authService } from "@/services/auth.service"; // ✅ Import authService chuẩn
import { apiClient } from "./api"; // Vẫn giữ để upload ảnh/update nếu cần

export interface UseProfileReturn {
  avatarPreview: string | null;
  selectedFile: File | null;
  isUploading: boolean;
  uploadStatus: "idle" | "success" | "error";
  loading: boolean;
  error: string | null;
  profileData: any;
  setAvatarPreview: (url: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  setUploadStatus: (status: "idle" | "success" | "error") => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveAvatar: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<boolean>;
  getAccountStats: () => Promise<any>;
}

export function useProfile(): UseProfileReturn {
  const { user, updateAvatar, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // ==================== LẤY PROFILE TỪ BACKEND ====================
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching user profile (Real API)...");
      
      // ✅ SỬ DỤNG authService ĐỂ GỌI ĐÚNG ENDPOINT /users/me
      const result = await authService.getCurrentUser();

      // Kiểm tra kết quả trả về
      // Backend FastAPI thường trả về trực tiếp object user, không bọc trong { data: ... }
      // Nhưng nếu api-client của bạn đã bọc, hãy kiểm tra kỹ.
      // Dưới đây là code xử lý linh hoạt cả 2 trường hợp:
      const userData = result.data || result; 

      if (userData) {
        setAvatarPreview(userData.avatar_url || null);
        setProfileData({
          full_name: userData.full_name || userData.name,
          email: userData.email,
          phone_number: userData.phone_number || "",
          birthday: userData.birthday || "",
          addresses: userData.addresses || [],
        });

        // Đồng bộ ngược lại AuthContext
        updateUser({
          name: userData.full_name || userData.name,
          email: userData.email,
          avatar: userData.avatar_url,
        });
      } else {
        throw new Error("Dữ liệu trả về rỗng");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UPLOAD AVATAR ====================
  const handleSaveAvatar = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStatus("idle");

    try {
      console.log("Uploading avatar to API...");
      // Gọi API upload (Check lại endpoint trong file api.ts của bạn nếu vẫn lỗi 404)
      const result = await apiClient.uploadAvatar(selectedFile);

      const avatarUrl = result.data?.avatar_url || result.avatar_url; // Handle response format
      
      if (avatarUrl) {
        updateAvatar(avatarUrl);
        setAvatarPreview(avatarUrl);
        setUploadStatus("success");
        setSelectedFile(null);
        setTimeout(() => setUploadStatus("idle"), 3000);
      } else {
        throw new Error("Không nhận được URL ảnh mới");
      }
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setUploadStatus("error");
      alert(err.message || "Lỗi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==================== UPDATE PROFILE ====================
  const updateUserProfile = async (data: any) => {
    try {
      console.log("Updating profile...");
      // Dùng authService để update luôn cho đồng bộ
      const result = await authService.updateCurrentUser(data);
      const updatedData = result.data || result;

      if (updatedData) {
        setProfileData((prev: any) => ({ ...prev, ...updatedData }));
        updateUser({
            name: updatedData.full_name, 
            phone_number: updatedData.phone_number 
        }); // Update context
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(err.message || "Cập nhật thất bại");
      return false;
    }
  };

  // Stats (Giữ nguyên hoặc comment lại nếu backend chưa có API này)
  const getAccountStats = async () => {
      // Tạm thời trả về 0 để không bị lỗi 404 nếu chưa có API
      return { total_orders: 0, total_cards: 0, total_wallets: 0, total_spent: 0 };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    avatarPreview,
    selectedFile,
    isUploading,
    uploadStatus,
    loading,
    error,
    profileData,
    setAvatarPreview,
    setSelectedFile,
    setUploadStatus,
    handleFileChange,
    handleSaveAvatar,
    fetchUserProfile,
    updateUserProfile,
    getAccountStats,
  };
}