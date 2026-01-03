// --- FILE: src/services/news.service.ts ---

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { NewsItem, NewsListParams, NewsListResponse } from '@/types/news'

// 👇 HÀM MAP DỮ LIU: Chuyển Backend (snake_case) -> Frontend (camelCase)
const mapNewsItem = (item: any): NewsItem => {
  // Xử lý tags
  let tagsArray: string[] = [];
  if (item.tags && typeof item.tags === 'string') {
    tagsArray = item.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
  } else if (Array.isArray(item.tags)) {
    tagsArray = item.tags;
  }

  return {
    id: item.id,
    slug: item.slug,
    originalUrl: item.original_url || item.originalUrl,

    title: item.title,
    summary: item.summary,
    content: item.content,
    imageUrl: item.image_url || item.imageUrl || '/assets/images/placeholder.png',

    category: item.category || 'Tin tức chung',
    tags: tagsArray,
    author: item.author || 'Ban biên tập',
    source: item.source || 'Tổng hợp',

    views: item.views || 0,
    isPublished: item.is_published !== undefined ? item.is_published : true,
    
    publishedAt: item.published_at || item.publishedAt,
    createdAt: item.created_at || item.createdAt,
  };
};

export const newsService = {
  /**
   * Lấy danh sách tin tức
   */
  async getNews(params?: NewsListParams): Promise<NewsListResponse> {
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
      let baseUrl = API_ENDPOINTS.NEWS.LIST;
      if (!baseUrl.endsWith('/')) baseUrl += '/';
      
      const endpoint = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      // Gọi API
      const response = await apiClient.get<any>(endpoint)
      
      // 👇 SỬA Ở ĐÂY: Ép kiểu sang 'any' để TypeScript không báo lỗi .total
      const raw = response as any;
      
      let rawList: any[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        rawList = raw;
        total = raw.length;
      } else if (raw && Array.isArray(raw.data)) {
        rawList = raw.data;
        // TypeScript sẽ không báo lỗi dòng này nữa vì 'raw' là any
        total = raw.total || rawList.length;
      }

      // Map toàn bộ danh sách
      const mappedData = rawList.map(mapNewsItem);

      return { 
        data: mappedData,
        total: total
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      throw error
    }
  },

  /**
   * Lấy tin tức mới nhất
   */
  async getLatestNews(limit: number = 3): Promise<NewsItem[]> {
    try {
      const response = await this.getNews({ limit, sort_by: 'created_at', order: 'desc' })
      return response.data || []
    } catch (error) {
      console.error('Error fetching latest news:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết một tin tức
   */
  async getNewsById(id: number | string): Promise<NewsItem> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.NEWS.DETAIL(id.toString()));
      
      // 👇 SỬA THÊM: An toàn hơn khi lấy chi tiết (unwrap data nếu có)
      const raw = response as any;
      const data = raw.data || raw;
      
      return mapNewsItem(data);
    } catch (error) {
      console.error(`Error fetching news ${id}:`, error)
      throw error
    }
  },
}