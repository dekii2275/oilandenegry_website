import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { authService } from "@/services/auth.service"; 
import { apiClient } from "./api"; 
// Dùng any tạm thời cho import này để tránh xung đột type
import type { UserProfile } from "../types"; 

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
      const result = await authService.getCurrentUser();
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

        // ✅ SỬA LỖI 1: Thêm 'as any' để ép kiểu, bỏ qua lỗi thiếu phone_number trong AuthProvider
        updateUser({
          name: userData.full_name || userData.name,
          email: userData.email,
          avatar: userData.avatar_url,
          phone_number: userData.phone_number 
        } as any); 
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
      const result = await apiClient.uploadAvatar(selectedFile);
      const avatarUrl = result.data?.avatar_url || result.data?.avatar_url;
      
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
      const result = await authService.updateCurrentUser(data);
      const updatedData = result.data || result;

      if (updatedData) {
        setProfileData((prev: any) => ({ ...prev, ...updatedData }));
        
        // ✅ SỬA LỖI 2: Thêm 'as any' tại đây nữa
        updateUser({
            name: updatedData.full_name, 
            phone_number: updatedData.phone_number 
        } as any); 

        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(err.message || "Cập nhật thất bại");
      return false;
    }
  };

  const getAccountStats = async () => {
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