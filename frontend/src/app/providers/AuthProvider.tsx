// app/providers/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi component mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const savedUser = localStorage.getItem("zenergy_user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
        // Để test: tự động đăng nhập với user giả định
        else if (process.env.NODE_ENV === "development") {
          const mockUser: User = {
            id: "1",
            name: "Nguyễn Văn A",
            email: "test@example.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
            role: "customer",
          };
          setUser(mockUser);
          localStorage.setItem("zenergy_user", JSON.stringify(mockUser));
          localStorage.setItem("zenergy_token", "mock_jwt_token_" + Date.now());
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Cập nhật thông tin user
  const updateUser = (updates: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = { ...prevUser, ...updates };

      // Lưu vào localStorage để đồng bộ
      localStorage.setItem("zenergy_user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  // Cập nhật avatar cụ thể
  const updateAvatar = (avatarUrl: string) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = { ...prevUser, avatar: avatarUrl };

      // Lưu vào localStorage để đồng bộ
      localStorage.setItem("zenergy_user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock data cho development
      const mockUser: User = {
        id: "1",
        name: "Nguyễn Văn A",
        email: email,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email,
        role: "customer",
      };

      setUser(mockUser);
      localStorage.setItem("zenergy_user", JSON.stringify(mockUser));
      localStorage.setItem("zenergy_token", "mock_jwt_token_" + Date.now());
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zenergy_user");
    localStorage.removeItem("zenergy_token");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    updateUser,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Helper functions
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const savedUser = localStorage.getItem("zenergy_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zenergy_token");
};
