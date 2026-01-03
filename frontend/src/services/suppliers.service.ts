/**
 * Suppliers Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { Supplier } from '@/types/supplier'

export const suppliersService = {
  /**
   * Lấy danh sách suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      // Sử dụng <any> để bỏ qua kiểm tra kiểu nghiêm ngặt của AxiosResponse ban đầu
      const response = await apiClient.get<any>(
        API_ENDPOINTS.SUPPLIERS.LIST
      )
      
      const raw = response as any;

      // Kiểm tra nếu API trả về mảng trực tiếp (đã qua interceptor unwrap)
      if (Array.isArray(raw)) {
        return raw as Supplier[];
      }
      
      // Kiểm tra nếu dữ liệu nằm trong thuộc tính .data (cấu trúc Axios chuẩn)
      return (raw.data || raw.suppliers || []) as Supplier[];
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  },

  /**
   * Lấy danh sách suppliers đã verified
   */
  async getVerifiedSuppliers(): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.SUPPLIERS.VERIFIED
      )
      
      const raw = response as any;
      
      if (Array.isArray(raw)) {
        return raw as Supplier[];
      }
      
      return (raw.data || raw.suppliers || []) as Supplier[];
    } catch (error) {
      console.error('Error fetching verified suppliers:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết một supplier
   */
  async getSupplierById(id: number | string): Promise<Supplier> {
    try {
      // Ép kiểu tương tự cho phần lấy chi tiết để tránh lỗi AxiosResponse
      const response = await apiClient.get<any>(API_ENDPOINTS.SUPPLIERS.DETAIL(Number(id)))
      const raw = response as any;
      
      return (raw.data || raw) as Supplier;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error)
      throw error
    }
  },
}