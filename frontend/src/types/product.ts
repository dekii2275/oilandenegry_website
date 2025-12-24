/**
 * Product Types
 */

export interface Product {
  id: number | string
  name: string
  description?: string
  category?: string
  category_id?: number
  price?: number
  old_price?: number
  image?: string
  image_url?: string
  images?: string[]
  unit?: string
  stock?: number
  is_active?: boolean
  store_id?: number
  store?: any // Will be imported from supplier types when needed
  created_at?: string
  updated_at?: string
  variants?: ProductVariant[]
  slug?: string
}

export interface ProductVariant {
  id: number | string
  product_id: number | string
  name?: string
  price: number
  stock?: number
  sku?: string
  attributes?: Record<string, any>
}

export interface ProductListParams {
  page?: number
  limit?: number
  category?: string | number
  search?: string
  min_price?: number
  max_price?: number
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface ProductListResponse {
  data: Product[]
  total?: number
  page?: number
  limit?: number
  total_pages?: number
}

