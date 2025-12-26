/**
 * Supplier Types
 */

export interface Supplier {
  id: number | string
  name: string
  company_name?: string
  logo?: string
  logo_url?: string
  description?: string
  email?: string
  phone?: string
  address?: string
  rating?: number
  reviews_count?: number
  reviews?: number
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface SupplierListResponse {
  data: Supplier[]
  total?: number
}

