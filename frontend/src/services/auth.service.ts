/**
 * Auth Service
 * Service để handle authentication operations
 */

import apiClient from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { RegisterPayload, LoginPayload, AuthResponse } from '@/types/auth'

export const authService = {
  /**
   * Đăng ký user mới
   */
  async register(payload: RegisterPayload): Promise<AuthResponse | { success: boolean }> {
    try {
      const response = await apiClient.post<AuthResponse | { success: boolean }>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload
      )
      return response
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  },

  /**
   * Đăng nhập
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload
      )
      
      // Lưu token vào localStorage nếu có
      if (response.token && typeof window !== 'undefined') {
        localStorage.setItem('zenergy_token', response.token)
        localStorage.setItem('access_token', response.token)
        if (response.user) {
          localStorage.setItem('zenergy_user', JSON.stringify(response.user))
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }
      
      return response
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      // Gọi API logout nếu có
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
      } catch (e) {
        // Nếu API chưa có, chỉ cần clear localStorage
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
   */
  async getCurrentUser(): Promise<any> {
    try {
      return await apiClient.get(API_ENDPOINTS.AUTH.ME)
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  },

  /**
   * Quên mật khẩu
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw error
    }
  },

  /**
   * Reset mật khẩu
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password })
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`)
    } catch (error) {
      console.error('Error verifying email:', error)
      throw error
    }
  },
}

// Export helper functions
export const registerUser = (data: RegisterPayload) => authService.register(data)
export const loginUser = (email: string, password: string) => 
  authService.login({ email, password })
export const logoutUser = () => authService.logout()

