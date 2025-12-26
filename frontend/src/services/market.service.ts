/**
 * Market Data Service
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { MarketDataResponse, MarketPrice } from '@/types/market'

export const marketService = {
  /**
   * Lấy giá thị trường
   */
  async getMarketPrices(): Promise<MarketPrice[]> {
    try {
      const response = await apiClient.get<MarketDataResponse | MarketPrice[]>(
        API_ENDPOINTS.MARKET.PRICES
      )
      
      // Hỗ trợ cả array response và object response
      if (Array.isArray(response)) {
        return response
      }
      
      return response.prices || []
    } catch (error) {
      console.error('Error fetching market prices:', error)
      throw error
    }
  },

  /**
   * Lấy xu hướng thị trường
   */
  async getMarketTrends(): Promise<MarketDataResponse> {
    try {
      return await apiClient.get<MarketDataResponse>(API_ENDPOINTS.MARKET.TRENDS)
    } catch (error) {
      console.error('Error fetching market trends:', error)
      throw error
    }
  },
}

