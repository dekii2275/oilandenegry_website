"use client";

import Link from "next/link";
import { RefreshCw, FileText, Home, TrendingUp, TrendingDown } from "lucide-react";
import { MarketPrice } from "@/types/market";

interface MarketHeaderProps {
  data: any[]; // Để any để xử lý linh hoạt từ API
}

export default function MarketHeader({ data }: MarketHeaderProps) {
  const lastUpdated = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });

  // 👇 HÀM CHUẨN HÓA: Ép dữ liệu từ Backend sang chuẩn Component mong muốn
  const normalizeData = (name: string, fallbackName: string) => {
    const item = data.find(i => i.name?.toUpperCase() === name);
    if (!item) return { id: name, name: fallbackName, price: 0, change: 0, percentChange: 0, isPositive: true };
    
    return {
      id: item.id || name,
      name: fallbackName,
      // Map đúng tên thuộc tính từ API Python
      price: item.price || 0,
      change: item.change || 0,
      percentChange: item.percent || 0, 
      isPositive: item.status === 'up' || item.change >= 0
    };
  };

  const statsToShow = [
    normalizeData("BRENT", "Dầu Brent"),
    normalizeData("WTI", "Dầu WTI"),
    normalizeData("GAS", "Khí tự nhiên"),
    normalizeData("SOLAR", "Điện mặt trời"),
  ];

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-green-600 flex items-center gap-1"><Home size={12} /> Trang chủ</Link>
            <span>&gt;</span>
            <span className="text-green-600 font-medium">Thị trường</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dữ liệu Thị trường</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden md:block">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Cập nhật lúc</p>
            <p className="text-sm font-bold text-gray-700">{lastUpdated}</p>
          </div>
          <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"><RefreshCw size={18} /></button>
          <Link href="/market/report" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"><FileText size={18} /> Xuất báo cáo</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.length === 0 ? (
          // Hiển thị skeleton khi chưa có data
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-[120px]" />
          ))
        ) : (
          statsToShow.map((stat) => (
            <div key={stat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.name}</span>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.isPositive ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                  {Math.abs(stat.percentChange)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-extrabold text-gray-800">
                  {stat.name.includes("mặt trời") ? stat.price.toLocaleString() : `$${stat.price.toFixed(2)}`}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400 font-medium">
                Biến động: <span className={stat.isPositive ? "text-green-600" : "text-red-600"}>
                  {stat.change >= 0 ? `+${stat.change}` : stat.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}