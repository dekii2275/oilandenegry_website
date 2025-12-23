/**
 * News Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { NewsItem, NewsListParams, NewsListResponse } from '@/types/news'

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
      const endpoint = queryString 
        ? `${API_ENDPOINTS.NEWS.LIST}?${queryString}`
        : API_ENDPOINTS.NEWS.LIST

      const response = await apiClient.get<NewsListResponse | NewsItem[]>(endpoint)
      
      // Hỗ trợ cả array response và object response
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      return response
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
      return await apiClient.get<NewsItem>(API_ENDPOINTS.NEWS.DETAIL(id))
    } catch (error) {
      console.error(`Error fetching news ${id}:`, error)
      throw error
    }
  },
}

