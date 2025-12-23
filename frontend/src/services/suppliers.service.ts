/**
 * Suppliers Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { Supplier, SupplierListResponse } from '@/types/supplier'

export const suppliersService = {
  /**
   * Lấy danh sách suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<SupplierListResponse | Supplier[]>(
        API_ENDPOINTS.SUPPLIERS.LIST
      )
      
      // Hỗ trợ cả array response và object response
      if (Array.isArray(response)) {
        return response
      }
      
      return response.data || []
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
      const response = await apiClient.get<SupplierListResponse | Supplier[]>(
        API_ENDPOINTS.SUPPLIERS.VERIFIED
      )
      
      if (Array.isArray(response)) {
        return response
      }
      
      return response.data || []
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
      return await apiClient.get<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id))
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error)
      throw error
    }
  },
}

