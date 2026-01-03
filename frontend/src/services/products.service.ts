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

      // 👇 SỬA 1: Dùng <any> và ép kiểu để xử lý linh hoạt
      const response = await apiClient.get<any>(endpoint)
      const raw = response as any;

      // Trường hợp 1: API trả về mảng trực tiếp (đã qua interceptor)
      if (Array.isArray(raw)) {
        return { data: raw } as ProductListResponse
      }

      // Trường hợp 2: API trả về AxiosResponse chuẩn (data nằm trong .data)
      // Kiểm tra xem raw.data là mảng hay object
      if (raw.data) {
        if (Array.isArray(raw.data)) {
           return { data: raw.data } as ProductListResponse
        }
        // Nếu raw.data là object dạng { data: [...] }
        return raw.data as ProductListResponse
      }
      
      // Fallback: Nếu raw chính là object { data: [...] }
      return raw as ProductListResponse
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
      // 👇 SỬA 2: Ép kiểu any để lấy data an toàn
      const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.DETAIL(Number(id)))
      const raw = response as any;
      
      // Ưu tiên lấy .data nếu có (Axios chuẩn), nếu không thì lấy chính nó (Interceptor)
      return (raw.data || raw) as Product;
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

      // 👇 SỬA 3: Logic tương tự getProducts
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams.toString()}`
      )
      const raw = response as any;
      
      // Xử lý mảng trực tiếp
      if (Array.isArray(raw)) {
        return { data: raw } as ProductListResponse
      }

      // Xử lý Axios wrap
      if (raw.data) {
         if (Array.isArray(raw.data)) return { data: raw.data } as ProductListResponse;
         return raw.data as ProductListResponse;
      }
      
      return raw as ProductListResponse
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