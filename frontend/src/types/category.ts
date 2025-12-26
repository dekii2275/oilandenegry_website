/**
 * Category Types
 */

export interface Category {
  id: number | string
  name: string
  slug?: string
  description?: string
  icon?: string
  image?: string
  parent_id?: number | string | null
  children?: Category[]
  product_count?: number
  created_at?: string
  updated_at?: string
}

export interface CategoryListResponse {
  data: Category[]
  total?: number
}

