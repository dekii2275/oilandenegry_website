/**
 * Products Service
 * Service để fetch và manage products data từ backend
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { Product, ProductListParams, ProductListResponse } from '@/types/product'

export const productsService = {
  /**
   * Lấy danh sách sản phẩm
   */
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })
      }

      const queryString = queryParams.toString()
      const endpoint = queryString 
        ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.LIST

      // Hỗ trợ cả array response và object response
      const response = await apiClient.get<ProductListResponse | Product[]>(endpoint)
      
      // Nếu là array, wrap vào object
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      return response
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết một sản phẩm
   */
  async getProductById(id: number | string): Promise<Product> {
    try {
      return await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id))
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw error
    }
  },

  /**
   * Tìm kiếm sản phẩm
   */
  async searchProducts(query: string, params?: Omit<ProductListParams, 'search'>): Promise<ProductListResponse> {
    try {
      const queryParams = new URLSearchParams({ search: query })
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })
      }

      const response = await apiClient.get<ProductListResponse | Product[]>(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams.toString()}`
      )
      
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      return response
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  },

  /**
   * Lấy danh sách sản phẩm nổi bật (featured)
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const response = await this.getProducts({ limit, sort_by: 'featured', order: 'desc' })
      return response.data || []
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  },
}

