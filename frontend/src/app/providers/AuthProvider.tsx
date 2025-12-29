"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, authService } from "@/services/auth.service";

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  updateUser: () => {},
  updateAvatar: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// --- HÀM HELPER: Lọc lỗi sạch sẽ (Nguyên nhân chính gây crash) ---
const getSafeErrorMessage = (error: any): string => {
  // 1. Ưu tiên lấy lỗi từ response của Backend (FastAPI/Pydantic)
  const detail = error?.response?.data?.detail;
  
  if (detail) {
    // Nếu là mảng lỗi (trường hợp bạn đang gặp) -> lấy msg đầu tiên
    if (Array.isArray(detail)) {
      return detail[0]?.msg || "Lỗi dữ liệu không hợp lệ";
    }
    // Nếu là string
    if (typeof detail === "string") {
      return detail;
    }
    // Nếu là object khác -> ép sang string
    return JSON.stringify(detail);
  }

  // 2. Lấy từ message của Error object
  if (error?.message) return error.message;

  // 3. Fallback cuối cùng
  return "Đăng nhập thất bại. Vui lòng thử lại.";
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("zenergy_user");
      if (savedUser) {
         // Thêm try-catch nhỏ ở đây đề phòng localStorage chứa rác gây crash
         try {
             const parsed = JSON.parse(savedUser);
             // Chỉ set nếu parsed là object hợp lệ
             if (parsed && typeof parsed === 'object') {
                 setUser(parsed);
             }
         } catch(e) {
             console.error("Lỗi parse user từ storage", e);
             localStorage.removeItem("zenergy_user"); // Xóa nếu lỗi
         }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // 1) login -> lưu token (đã làm trong auth.service)
      await loginUser(email, password);

      // 2) nếu có pending profile từ lúc register thì update luôn
      const pendingRaw = localStorage.getItem("zenergy_pending_profile");
      if (pendingRaw) {
        try {
            const pending = JSON.parse(pendingRaw);
            await authService.updateCurrentUser({
                full_name: pending.full_name,
                phone_number: pending.phone_number,
                address: pending.address,
            });
            localStorage.removeItem("zenergy_pending_profile");
        } catch (parseError) {
            console.error("Lỗi xử lý pending profile:", parseError);
        }
      }

      // 3) lấy user mới nhất và lưu vào storage + state
      const user = await authService.getCurrentUser();
      localStorage.setItem("zenergy_user", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

    } catch (error: any) {
      console.error("Login error (Raw):", error);
      
      // --- SỬA LỖI TẠI ĐÂY ---
      // Dùng hàm helper để lấy chuỗi text an toàn
      const safeMessage = getSafeErrorMessage(error);
      
      // Ném ra một Error object mới chỉ chứa string message
      // Component Login bên ngoài sẽ catch được cái này và render safeMessage (là string) -> KHÔNG CRASH
      throw new Error(safeMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zenergy_user");
    localStorage.removeItem("zenergy_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Dùng replace hoặc push của router sẽ mượt hơn, nhưng href an toàn nhất để clear state
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem("zenergy_user", JSON.stringify(next));
      return next;
    });
  };

  const updateAvatar = (avatarUrl: string) => updateUser({ avatar: avatarUrl });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        updateUser,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}