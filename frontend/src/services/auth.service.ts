/**
 * Auth Service
 * Service để handle authentication operations
 */

import { apiClient } from '@/lib/api-client'
import type { RegisterPayload, LoginPayload, AuthResponse } from '@/types/auth'

// Định nghĩa các đường dẫn API trực tiếp tại đây (KHÔNG CÓ /api ở đầu)
const AUTH_URL = '/auth'
const USERS_URL = '/users'

// --- HÀM XỬ LÝ LỖI CHUNG (QUAN TRỌNG) ---
// Hàm này giúp biến mọi object lỗi phức tạp thành chuỗi string đơn giản
const handleApiError = (error: any) => {
  // 1. Check lỗi từ backend FastAPI/Pydantic (Validation Error)
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // Nếu là mảng lỗi (Ví dụ: [{msg: "...", type: "..."}])
    if (Array.isArray(detail)) {
      return detail[0]?.msg || "Dữ liệu không hợp lệ";
    }
    // Nếu là string lỗi trực tiếp
    if (typeof detail === 'string') {
      return detail;
    }
    // Nếu là object khác -> ép sang string JSON để debug
    return JSON.stringify(detail);
  }

  // 2. Check lỗi message thông thường
  if (error.message) {
    return error.message;
  }

  // 3. Fallback
  return "Đã xảy ra lỗi không xác định.";
};

export const authService = {
  /**
   * Đăng ký user mới
   * Endpoint: /auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse | { success: boolean }> {
    try {
      // Ép kiểu response về any để tránh lỗi TypeScript khi build
      // (Vì AxiosResponse không khớp trực tiếp với AuthResponse)
      const response = await apiClient.post<any>(
        `${AUTH_URL}/register`, 
        payload
      );
      
      // Kiểm tra nếu response có thuộc tính data (trường hợp Axios trả về object đầy đủ)
      // hoặc trả về trực tiếp (nếu có interceptor)
      const data = (response as any).data || response;
      
      return data as AuthResponse | { success: boolean };
    } catch (error: any) {
      console.error('Error registering user:', error)
      // Ném ra Error mới chỉ chứa string message -> UI không bị crash
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Đăng nhập
   * Endpoint: /auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        `${AUTH_URL}/login`,
        payload
      )
      
      // Tương tự, lấy data từ response hoặc dùng chính response
      const data = (response as any).data || response;
      const authData = data as AuthResponse;

      if (authData.access_token && typeof window !== 'undefined') {
        localStorage.setItem('zenergy_token', authData.access_token)
        localStorage.setItem('access_token', authData.access_token)
      }
      
      // Lấy thông tin user ngay sau khi login để lưu vào storage
      if (typeof window !== 'undefined') {
        try {
            const user = await authService.getCurrentUser()
            localStorage.setItem('zenergy_user', JSON.stringify(user))
            localStorage.setItem('user', JSON.stringify(user))
        } catch (e) {
            console.warn("Không thể lấy thông tin user sau khi login:", e)
        }
      }

      return authData
    } catch (error: any) {
      console.error('Error logging in:', error)
      // Xử lý lỗi sạch sẽ trước khi ném ra ngoài
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      try {
        await apiClient.post(`${AUTH_URL}/logout`)
      } catch (e) {
        // Backend có thể không có endpoint logout, bỏ qua lỗi
      }
    } finally {
      // Luôn clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zenergy_token')
        localStorage.removeItem('zenergy_user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
  },

  /**
   * Lấy thông tin user hiện tại
   * Endpoint thường là: /users/me
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${USERS_URL}/me`);
      return (response as any).data || response;
    } catch (error: any) {
      // Không ném lỗi ở đây để tránh crash AuthProvider khi token hết hạn
      // Chỉ log và ném tiếp để AuthProvider xử lý logout
      console.error('Error fetching current user:', error)
      throw error; 
    }
  },

  /**
   * Cập nhật thông tin user
   */
   async updateCurrentUser(payload: {
    full_name?: string | null
    avatar_url?: string | null
    phone_number?: string | null
    address?: string | null
  }): Promise<any> {
    try {
      const response = await apiClient.put<any>(`${USERS_URL}/me`, payload);
      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error updating current user:', error)
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Quên mật khẩu
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<any>(`${AUTH_URL}/forgot-password`, { email });
      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error requesting password reset:', error)
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Reset mật khẩu
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<any>(`${AUTH_URL}/reset-password`, { token, password });
      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error resetting password:', error)
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Verify email - CHỖ NÀY ĐÃ ĐƯỢC FIX
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      // Lưu ý: Nếu backend của bạn yêu cầu POST thay vì GET, hãy đổi thành .post
      // Nhưng dựa vào log ảnh trước đó (GET 422), tôi giữ nguyên là .get
      const response = await apiClient.get<any>(`${AUTH_URL}/verify`, { params: { token } });
      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error verifying email:', error)
      // QUAN TRỌNG: Ném ra Error string, không ném raw object
      throw new Error(handleApiError(error));
    }
  },
}

// Export helper functions
export const registerUser = (data: RegisterPayload) => authService.register(data)
export const loginUser = (email: string, password: string) => 
  authService.login({ email, password })
export const logoutUser = () => authService.logout()