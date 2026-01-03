/**
 * Categories Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { Category } from '@/types/category'

export const categoriesService = {
  /**
   * Lấy danh sách categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      // 👇 SỬA 1: Dùng <any> để bypass kiểm tra type ban đầu
      const response = await apiClient.get<any>(
        API_ENDPOINTS.CATEGORIES.LIST
      )
      
      // 👇 SỬA 2: Ép kiểu sang any để kiểm tra linh hoạt
      const raw = response as any;

      // Trường hợp 1: API trả về mảng trực tiếp (interceptor đã xử lý)
      if (Array.isArray(raw)) {
        return raw as Category[];
      }
      
      // Trường hợp 2: API trả về object có chứa data (Axios chuẩn)
      if (raw.data && Array.isArray(raw.data)) {
        return raw.data as Category[];
      }
      
      // Fallback: Trả về mảng rỗng nếu không tìm thấy dữ liệu
      return []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết một category
   */
  async getCategoryById(id: number | string): Promise<Category> {
    try {
      // 👇 SỬA 3: Áp dụng tương tự cho chi tiết để tránh lỗi tiềm ẩn
      const response = await apiClient.get<any>(API_ENDPOINTS.CATEGORIES.DETAIL(Number(id)))
      const raw = response as any;
      
      // Ưu tiên lấy trong .data, nếu không thì lấy chính nó
      return (raw.data || raw) as Category;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error)
      throw error
    }
  },
}