"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Bot, 
  Loader2, 
  RefreshCcw 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Định nghĩa kiểu dữ liệu khớp với JSON từ Backend trả về
interface AIAnalysisData {
  trend: string;        // VD: "Tăng mạnh"
  trendDesc: string;    // Mô tả xu hướng
  highlight: string;    // VD: "Gas sụt giảm"
  highlightDesc: string;// Mô tả điểm nhấn
  isPositive: boolean;  // true = Xanh, false = Đỏ
  last_updated: string; // Thời gian cập nhật
}

export default function MarketAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Lấy URL từ biến môi trường trong docker-compose (https://zenergy.cloud/api)
  // Nếu không lấy được thì fallback về chuỗi cứng để tránh lỗi null
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zenergy.cloud/api";

  // Hàm gọi API từ Python Backend
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      
      // Ghép chuỗi URL: https://zenergy.cloud/api + /market/analysis
      // Kết quả: https://zenergy.cloud/api/market/analysis
      const res = await fetch(`${API_BASE_URL}/market/analysis`);
      
      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
      
      const data = await res.json();
      setAnalysis(data);
      setIsError(false);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu AI:", error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  // Màu sắc chủ đạo dựa trên cảm xúc thị trường
  const bgClass = analysis?.isPositive 
    ? "bg-[#71C291] shadow-green-100" // Xanh lá (Tốt)
    : "bg-[#EF4444] shadow-red-100";  // Đỏ (Xấu)

  return (
    <div className={`p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden transition-all duration-500 h-full flex flex-col ${loading ? "bg-gray-100" : bgClass}`}>
      
      {/* --- TRẠNG THÁI LOADING --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-xs font-medium animate-pulse">AI đang phân tích dữ liệu...</span>
        </div>
      )}

      {/* --- TRẠNG THÁI CÓ DỮ LIỆU --- */}
      {!loading && !isError && analysis && (
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="font-bold text-lg">Góc nhìn Chuyên gia</h2>
              <div className="flex items-center gap-1.5 opacity-90 mt-1">
                <Bot size={12} className="text-white" />
                <span className="text-[10px] font-medium">
                  Powered by Gemini • Cập nhật: {analysis.last_updated}
                </span>
              </div>
            </div>
            
            {/* Nút refresh nhỏ */}
            <button 
              onClick={fetchAnalysis}
              className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              title="Làm mới phân tích"
            >
              <RefreshCcw size={12} className="text-white" />
            </button>
          </div>

          <div className="space-y-3 my-auto">
            {/* Box 1: Xu hướng */}
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-2 mb-1.5">
                {analysis.isPositive ? (
                  <ArrowUpRight size={18} className="text-green-100 group-hover:scale-110 transition-transform" />
                ) : (
                  <ArrowDownRight size={18} className="text-white group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Xu hướng: {analysis.trend}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95 font-medium text-justify">
                {analysis.trendDesc}
              </p>
            </div>

            {/* Box 2: Điểm nổi bật */}
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={16} className="text-yellow-100 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {analysis.highlight}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95 font-medium text-justify">
                {analysis.highlightDesc}
              </p>
            </div>
          </div>

          {/* Button Footer */}
          <Link href="/market/report" className="block mt-4">
            <button className={`w-full font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                analysis.isPositive 
                  ? "bg-white text-[#71C291] hover:bg-gray-50" 
                  : "bg-white text-[#EF4444] hover:bg-gray-50"
            }`}>
              Xem chi tiết báo cáo
              <ArrowUpRight size={14}/>
            </button>
          </Link>
        </div>
      )}

      {/* --- TRẠNG THÁI LỖI --- */}
      {isError && !loading && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
           <span className="text-2xl">⚠️</span>
           <p className="text-xs text-center">Không thể kết nối đến AI Server.</p>
           <button onClick={fetchAnalysis} className="text-xs text-blue-500 underline">Thử lại</button>
        </div>
      )}

      {/* Hiệu ứng nền trang trí */}
      <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
}