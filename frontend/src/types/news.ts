/**
 * News & Events Types
 */

export interface NewsItem {
  id: number | string
  title: string
  content?: string
  excerpt?: string
  description?: string
  category?: string
  image?: string
  image_url?: string
  author?: string
  author_id?: number
  published_at?: string
  created_at?: string
  updated_at?: string
  slug?: string
  link?: string
  tags?: string[]
  views?: number
}

export interface NewsListParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface NewsListResponse {
  data: NewsItem[]
  total?: number
  page?: number
  limit?: number
  total_pages?: number
}

