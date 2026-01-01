// --- FILE: src/types/news.ts ---

export interface NewsItem {
  // 1. Định danh
  id: number;
  slug: string;
  originalUrl?: string; // Map từ original_url

  // 2. Nội dung
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;    // Map từ image_url
  
  // 3. Phân loại
  category?: string;
  tags?: string[];      // Quan trọng: Backend là String, nhưng Frontend sẽ dùng Array
  author?: string;
  source?: string;

  // 4. Chỉ số & Thời gian
  views?: number;
  isPublished?: boolean; // Map từ is_published
  publishedAt?: string;  // Map từ published_at
  createdAt?: string;    // Map từ created_at
}

export interface NewsListResponse {
  data: NewsItem[]
  total: number
}

export interface NewsListParams {
  page?: number
  limit?: number
  category?: string
  sort_by?: string
  order?: 'asc' | 'desc'
  skip?: number
}