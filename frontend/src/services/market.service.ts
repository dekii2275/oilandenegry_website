// --- FILE: src/services/market.service.ts ---

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api'
import type { MarketDataResponse, MarketPrice } from '@/types/market'

// 👇 HÀM MAP DỮ LIỆU: Chuyển Backend (snake_case) -> Frontend (camelCase)
const mapMarketItem = (item: any): MarketPrice => {
  // Logic tính toán cơ bản nếu backend trả thiếu
  const price = Number(item.current_price || item.price || 0);
  const change = Number(item.change || 0);
  const percentChange = Number(item.percent_change || item.change_percent || 0);
  
  return {
    id: item.id || item.symbol,
    symbol: item.symbol,
    name: item.name || item.symbol,
    
    // Map giá trị số
    price: price,
    change: change,
    percentChange: percentChange,
    
    // Logic xác định tăng/giảm
    isPositive: change >= 0,
    
    // Map thông tin bổ sung
    open: Number(item.open_price || item.open || 0),
    high: Number(item.high_price || item.high || 0),
    low: Number(item.low_price || item.low || 0),
    volume: Number(item.volume || 0),
    
    unit: item.unit || 'USD',
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
  };
};

export const marketService = {
  /**
   * Lấy giá thị trường (Cho 4 ô header và bảng)
   */
  async getMarketPrices(): Promise<MarketPrice[]> {
    try {
      // Gọi API lấy danh sách
      const response = await apiClient.get<any>(API_ENDPOINTS.MARKET.DATA);
      
      // 👇 SỬA Ở ĐÂY: Ép kiểu sang 'any' để TypeScript không báo lỗi khi truy cập .prices
      const raw = response as any;
      
      let rawList: any[] = [];
      
      // Xử lý các trường hợp trả về khác nhau của API
      if (Array.isArray(raw)) {
        rawList = raw;
      } else if (raw && Array.isArray(raw.data)) {
        rawList = raw.data;
      } else if (raw && Array.isArray(raw.prices)) {
        rawList = raw.prices;
      }
      
      // Map dữ liệu sang chuẩn camelCase
      return rawList.map(mapMarketItem);

    } catch (error) {
      console.error('Error fetching market prices:', error)
      // Trả về mảng rỗng thay vì throw lỗi để tránh sập giao diện
      return [];
    }
  },

  /**
   * Lấy xu hướng thị trường (Cho biểu đồ)
   */
  async getMarketTrends(): Promise<MarketDataResponse> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.MARKET.TRENDS);
      // Ép kiểu để return về đúng Type
      return (response as any).data || response;
    } catch (error) {
      console.error('Error fetching market trends:', error)
      return {};
    }
  },
}