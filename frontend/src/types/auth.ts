export interface RegisterPayload {
  email: string
  password: string
  full_name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type?: string
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER"; // Định nghĩa rõ role
  is_active: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  phone_number?: string; // <--- Đây là cái quan trọng nhất để fix lỗi
  created_at?: string;
}
