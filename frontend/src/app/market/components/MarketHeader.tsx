"use client";

import { RefreshCw, FileText, Home, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
// Đảm bảo bạn đã có file api config, nếu chưa có thì thay bằng fetch('/api/market-proxy')
import { API_ENDPOINTS } from "@/lib/api"; 

interface MarketData {
  id: number | string;
  name: string;
  price: string;
  change: string;
  percent: string;
  isUp: boolean;
}

export default function MarketHeader() {
  const [marketStats, setMarketStats] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // GỌI API THẬT (Thay thế Mock Data)
      // Nếu bạn chưa cấu hình API_ENDPOINTS, hãy dùng: fetch('/api/market-proxy') hoặc endpoint backend của bạn
      const res = await fetch(API_ENDPOINTS.MARKET.DATA); 
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        // Map dữ liệu từ Backend thành 4 ô chuẩn
        const mappedData: MarketData[] = data.data.map((item: any) => {
          // Chuẩn hóa tên hiển thị
          const nameMap: Record<string, string> = {
            'BRENT': 'Dầu Brent',
            'WTI': 'Dầu WTI',
            'GAS': 'Khí tự nhiên',
            'SOLAR': 'Điện mặt trời'
          };

          return {
            id: item.name, // Dùng tên làm ID
            name: nameMap[item.name] || item.name,
            price: item.name === 'SOLAR' ? item.price.toString() : `$${item.price}`,
            change: item.change > 0 ? `+${item.change}` : item.change.toString(),
            percent: `${item.percent}%`,
            isUp: item.status === 'up' || item.change >= 0
          };
        });

        // Chỉ lấy 4 chỉ số quan trọng nhất nếu API trả về nhiều hơn
        const keyIndices = ['Dầu Brent', 'Dầu WTI', 'Khí tự nhiên', 'Điện mặt trời'];
        const filteredData = mappedData.filter(item => keyIndices.includes(item.name));
        
        // Nếu API trả về thiếu hoặc tên không khớp, fallback về mappedData gốc (hoặc xử lý tùy ý)
        setMarketStats(filteredData.length >= 4 ? filteredData : mappedData.slice(0, 4));
        
        // Cập nhật thời gian thực
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu thị trường:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh mỗi 60s
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* --- PHẦN HEADER TITLE VÀ BUTTONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <Home size={12} /> Trang chủ
            </Link>
            <span>&gt;</span>
            <span className="text-green-600 font-medium">Thị trường</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dữ liệu Thị trường
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden md:block">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Cập nhật lúc</p>
            <p className="text-sm font-bold text-gray-700">{lastUpdated || "--:--"}</p>
          </div>
          
          <button
            onClick={fetchMarketData}
            disabled={isLoading}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <Link
            href="/market/report"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            <FileText size={18} />
            Xuất báo cáo
          </Link>
        </div>
      </div>

      {/* --- PHẦN 4 Ô DỮ LIỆU TỪ BACKEND --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && marketStats.length === 0 ? (
          // Skeleton Loading
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-[120px]" />
          ))
        ) : (
          marketStats.map((stat) => (
            <div 
              key={stat.id} 
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.name}</span>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                  stat.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.isUp ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                  {stat.percent}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-extrabold text-gray-800">{stat.price}</span>
              </div>
              
              <div className="mt-1 text-xs text-gray-400 font-medium">
                Biến động: <span className={stat.isUp ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}