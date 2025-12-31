/**
 * Categories Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { Category, CategoryListResponse } from '@/types/category'

export const categoriesService = {
  /**
   * Lấy danh sách categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<CategoryListResponse | Category[]>(
        API_ENDPOINTS.CATEGORIES.LIST
      )
      
      // Hỗ trợ cả array response và object response
      if (Array.isArray(response)) {
        return response
      }
      
      return response.data || []
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
      return await apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(Number(id)))
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error)
      throw error
    }
  },
}

