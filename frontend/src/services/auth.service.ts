import { API_ENDPOINTS } from '@/lib/api';

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  avatar_url?: string;
}

class AuthService {
  async register(data: RegisterData): Promise<UserProfile> {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Đăng ký thất bại');
    }
    return response.json();
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Đăng nhập thất bại');
    }

    const result = await response.json();
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
    }
    return result;
  }

  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(API_ENDPOINTS.PROFILE, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Không thể lấy thông tin người dùng');
    return response.json();
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
export default authService;