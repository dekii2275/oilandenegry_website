// frontend/src/app/profile/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { DEFAULT_AVATAR } from "../constants/mockData";
import { apiClient } from "./api";

export interface UseProfileReturn {
  avatarPreview: string | null;
  selectedFile: File | null;
  isUploading: boolean;
  uploadStatus: "idle" | "success" | "error";
  useMockData: boolean;
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
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // ==================== API CALL: Lấy thông tin user profile ====================
  // Endpoint: GET /api/user/profile
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("zenergy_token");

      // Kiểm tra có nên dùng mock data không
      if (!apiUrl || !token || apiUrl === "http://localhost:8000") {
        console.log("Using mock data for profile");
        setUseMockData(true);

        // Dùng data từ context hoặc localStorage
        const savedUser = localStorage.getItem("zenergy_user");
        let userData;

        if (savedUser) {
          try {
            userData = JSON.parse(savedUser);
          } catch {
            userData = null;
          }
        }

        if (userData) {
          setAvatarPreview(userData.avatar || DEFAULT_AVATAR);
          setProfileData({
            full_name: userData.name || "Nguyễn Văn A",
            email: userData.email || "nguyenvana@gmail.com",
            phone_number: "0912 345 678",
            birthday: "01/01/1995",
            addresses: [
              "123 Đường ABC, Quận 1, TP.HCM",
              "456 Đường XYZ, Quận 7, TP.HCM",
              "Chưa cập nhật",
            ],
          });
        } else {
          setAvatarPreview(DEFAULT_AVATAR);
          setProfileData({
            full_name: "Nguyễn Văn A",
            email: "nguyenvana@gmail.com",
            phone_number: "0912 345 678",
            birthday: "01/01/1995",
            addresses: [
              "123 Đường ABC, Quận 1, TP.HCM",
              "456 Đường XYZ, Quận 7, TP.HCM",
              "Chưa cập nhật",
            ],
          });
        }

        return;
      }

      // ========== GỌI API THẬT ==========
      console.log("Fetching user profile from API...");
      const result = await apiClient.getUserProfile();

      if (result.success && result.data) {
        const userData = result.data;

        setAvatarPreview(userData.avatar_url || DEFAULT_AVATAR);
        setProfileData({
          full_name: userData.full_name || userData.name,
          email: userData.email,
          phone_number: userData.phone_number,
          birthday: userData.birthday,
          addresses: userData.addresses || [],
        });

        // Cập nhật AuthContext
        updateUser({
          name: userData.full_name || userData.name,
          email: userData.email,
          avatar: userData.avatar_url,
        });

        setUseMockData(false);
      } else {
        // Nếu API fail, fallback về mock data
        console.warn("API failed, using mock data:", result.message);
        setUseMockData(true);
        setAvatarPreview(DEFAULT_AVATAR);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Không thể tải thông tin người dùng");
      // Fallback to mock data
      setUseMockData(true);
      setAvatarPreview(DEFAULT_AVATAR);
    } finally {
      setLoading(false);
    }
  };

  // ==================== API CALL: Upload avatar ====================
  // Endpoint: POST /api/user/avatar
  const handleSaveAvatar = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      // Nếu đang dùng mock data
      if (useMockData) {
        console.log("Using mock data for avatar upload");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

        updateAvatar(mockAvatarUrl);
        setAvatarPreview(mockAvatarUrl);
        setUploadStatus("success");
        setSelectedFile(null);

        // Cập nhật localStorage cho mock data
        const savedUser = localStorage.getItem("zenergy_user");
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            userData.avatar = mockAvatarUrl;
            localStorage.setItem("zenergy_user", JSON.stringify(userData));
          } catch (e) {
            console.error("Error updating localStorage:", e);
          }
        }

        setTimeout(() => setUploadStatus("idle"), 3000);
        return;
      }

      // ========== GỌI API THẬT ==========
      console.log("Uploading avatar to API...");
      const result = await apiClient.uploadAvatar(selectedFile);

      if (result.success && result.data) {
        const avatarUrl = result.data.avatar_url;

        updateAvatar(avatarUrl);
        setAvatarPreview(avatarUrl);
        setUploadStatus("success");
        setSelectedFile(null);

        setTimeout(() => setUploadStatus("idle"), 3000);
      } else {
        setUploadStatus("error");
        alert(result.message || "Upload thất bại");
      }
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setUploadStatus("error");
      alert(err.message || "Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==================== API CALL: Cập nhật thông tin user ====================
  // Endpoint: PUT /api/user/profile
  const updateUserProfile = async (data: {
    full_name: string;
    email: string;
    phone_number: string;
    birthday: string;
  }) => {
    try {
      // Nếu đang dùng mock data
      if (useMockData) {
        console.log("Using mock data for profile update");
        setProfileData((prev: any) => ({
          ...prev,
          ...data,
        }));

        if (user) {
          updateUser({
            name: data.full_name,
            email: data.email,
          });
        }

        return true;
      }

      // ========== GỌI API THẬT ==========
      console.log("Updating user profile via API...");
      const result = await apiClient.updateUserProfile(data);

      if (result.success && result.data) {
        const updatedData = result.data;

        setProfileData((prev: any) => ({
          ...prev,
          ...updatedData,
        }));

        if (user) {
          updateUser({
            name: updatedData.full_name || updatedData.name,
            email: updatedData.email,
          });
        }

        return true;
      } else {
        alert(result.message || "Cập nhật thất bại");
        return false;
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(err.message || "Cập nhật thất bại");
      return false;
    }
  };

  // ==================== API CALL: Cập nhật địa chỉ ====================
  // Endpoint: PUT /api/user/addresses
  const updateAddress = async (index: number, address: string) => {
    try {
      // Nếu đang dùng mock data
      if (useMockData) {
        const newAddresses = [...(profileData?.addresses || [])];
        newAddresses[index] = address;
        setProfileData((prev: any) => ({ ...prev, addresses: newAddresses }));
        return true;
      }

      // ========== GỌI API THẬT ==========
      console.log(`Updating address ${index} via API...`);
      const result = await apiClient.updateAddress(index, address);

      if (result.success && result.data) {
        setProfileData((prev: any) => ({
          ...prev,
          addresses: result.data,
        }));
        return true;
      } else {
        alert(result.message || "Cập nhật địa chỉ thất bại");
        return false;
      }
    } catch (err: any) {
      console.error("Error updating address:", err);
      alert(err.message || "Cập nhật thất bại");
      return false;
    }
  };

  // ==================== API CALL: Lấy thống kê tài khoản ====================
  // Endpoint: GET /api/user/stats
  const getAccountStats = async () => {
    try {
      // Nếu đang dùng mock data
      if (useMockData) {
        return {
          total_orders: 12,
          total_cards: 3,
          total_wallets: 2,
          total_spent: 15000000,
        };
      }

      // ========== GỌI API THẬT ==========
      console.log("Fetching account stats from API...");
      const result = await apiClient.getAccountStats();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn("Failed to get account stats:", result.message);
        return {
          total_orders: 0,
          total_cards: 0,
          total_wallets: 0,
          total_spent: 0,
        };
      }
    } catch (err: any) {
      console.error("Error getting account stats:", err);
      return {
        total_orders: 0,
        total_cards: 0,
        total_wallets: 0,
        total_spent: 0,
      };
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB");
        return;
      }
      setSelectedFile(file);
      setUploadStatus("idle");

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tự động fetch khi component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update avatar preview từ user context
  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  return {
    avatarPreview,
    selectedFile,
    isUploading,
    uploadStatus,
    useMockData,
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
