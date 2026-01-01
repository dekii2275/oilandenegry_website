"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 1. Cấu hình Data
const productCategories = [
  { id: "WTI", symbol: "CL=F", name: "Dầu WTI", color: "#10B981" },
  { id: "BRENT", symbol: "BZ=F", name: "Dầu Brent", color: "#3B82F6" },
  { id: "GAS", symbol: "NG=F", name: "Khí tự nhiên", color: "#EF4444" },
  { id: "SOLAR", symbol: "TAN", name: "Điện mặt trời", color: "#F59E0B" },
];

const timeRanges = [
  { label: "1T", value: "1wk" },
  { label: "1Th", value: "1mo" },
  { label: "3Th", value: "3mo" },
  { label: "1N", value: "1y" },
];

export default function MarketChart() {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0]);
  const [selectedCategory, setSelectedCategory] = useState(productCategories[0]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- FILE: src/app/market/components/MarketChart.tsx ---

useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      setHoveredPrice(null);
      
      try {
        // ✅ CẬP NHẬT: Trỏ đúng vào thư mục node-api như cấu trúc file của bạn
        const res = await fetch(
          `/node-api/market-proxy?symbol=${selectedCategory.symbol}&range=${selectedRange.value}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Lỗi kết nối server");
        }

        const rawData = await res.json();

        // Kiểm tra dữ liệu mảng trả về từ yahoo-finance2 (route.ts trả về { date, price, ... })
        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error("Không có dữ liệu cho mã này");
        }

        // Map lại dữ liệu: route.ts của bạn đang trả về field 'date' và 'price'
        const formattedData = rawData.map((item: any) => ({
          rawDate: item.date, // Khớp với field 'date' trong route.ts
          price: item.price ? Number(item.price.toFixed(2)) : 0, // Khớp với field 'price'
        }));

        setChartData(formattedData);
      } catch (err: any) {
        console.error("Chart Error:", err.message);
        setChartData([]);
        setError(err.message === "Lỗi kết nối server" ? "Chưa có dữ liệu" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
}, [selectedCategory, selectedRange]);

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload) {
      setHoveredPrice(state.activePayload[0].value);
    }
  };

  return (
    // --- THAY ĐỔI QUAN TRỌNG: h-[320px] để ép thành hình chữ nhật dài ---
    <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 w-full h-[320px] flex flex-col">
      
      {/* HEADER: Dồn tất cả lên 1 dòng để tiết kiệm chiều cao */}
      <div className="flex justify-between items-center mb-2">
        {/* Dropdown chọn loại */}
        <div className="flex items-center gap-3">
             <div className="relative group">
                <select 
                    value={selectedCategory.id}
                    onChange={(e) => setSelectedCategory(productCategories.find(c => c.id === e.target.value) || productCategories[0])}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer focus:outline-none hover:bg-white hover:border-green-500 transition-all"
                >
                    {productCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            {/* Chỉ số hiện tại (Nếu có hover thì hiện giá hover, ko thì hiện tên) */}
            <div className="text-sm font-bold" style={{ color: selectedCategory.color }}>
                {hoveredPrice ? `$${hoveredPrice.toFixed(2)}` : ""}
            </div>
        </div>

        {/* Nút thời gian nhỏ gọn */}
        <div className="flex bg-gray-50 p-1 rounded-lg gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range)}
              disabled={loading}
              className={`text-[10px] px-3 py-1 rounded-md font-bold transition-all ${
                selectedRange.value === range.value
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHART AREA: Chiếm toàn bộ phần còn lại */}
      <div className="flex-grow w-full relative min-h-0" onMouseLeave={() => setHoveredPrice(null)}>
        
        {/* Loading / Error Layer */}
        {(loading || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-[1px]">
                {loading ? <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/> : <span className="text-xs text-red-400">{error}</span>}
            </div>
        )}

        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedCategory.color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={selectedCategory.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f0f0f0" />
              
              <XAxis dataKey="rawDate" hide={true} />
              
              {/* Trục Y nằm bên phải (orientation="right") */}
              <YAxis 
                orientation="right" 
                tick={{ fontSize: 10, fill: "#999" }} 
                tickFormatter={(val) => val.toFixed(1)}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                width={35}
              />
              
              <Tooltip
                contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#333', padding: 0 }}
                labelFormatter={formatTooltipDate}
                formatter={(value: any) => [`$${value}`, 'Price']}
                cursor={{ stroke: '#ccc', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              {/* Đường kẻ ngang tham chiếu khi hover */}
              {hoveredPrice && (
                 <ReferenceLine y={hoveredPrice} stroke={selectedCategory.color} strokeDasharray="3 3" />
              )}
              
              <Area
                type="monotone"
                dataKey="price"
                stroke={selectedCategory.color}
                strokeWidth={2}
                fill="url(#colorGradient)"
                animationDuration={500}
                activeDot={{ r: 4, strokeWidth: 0, fill: selectedCategory.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}