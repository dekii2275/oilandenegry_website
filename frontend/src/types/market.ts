// --- FILE: src/types/market.ts ---

export interface MarketPrice {
  id: number | string;
  symbol: string;         // Mã: WTI, GOLD...
  name: string;           // Tên: Dầu thô WTI...
  image?: string;         // Ảnh/Icon nếu có
  
  // 👇 Các chỉ số tài chính (camelCase)
  price: number;          // Giá hiện tại
  change: number;         // Thay đổi tuyệt đối (+0.98)
  percentChange: number;  // Thay đổi % (+1.2%)
  
  // 👇 Các thông tin bổ sung (cho biểu đồ và chi tiết)
  open?: number;          // Giá mở cửa
  high?: number;          // Giá cao nhất
  low?: number;           // Giá thấp nhất
  volume?: number;        // Khối lượng
  
  isPositive: boolean;    // Tăng hay giảm (để tô màu xanh/đỏ)
  unit?: string;          // Đơn vị (thùng, ounce, lit)
  updatedAt?: string;     // Thời gian cập nhật
}

export interface MarketTrend {
  id: number | string;
  name: string;
  data: Array<{
    date: string;
    value: number;
  }>;
}

export interface MarketDataResponse {
  prices?: MarketPrice[];
  trends?: MarketTrend[];
  updatedAt?: string;
}