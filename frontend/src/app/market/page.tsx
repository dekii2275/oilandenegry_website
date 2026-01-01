// --- FILE: src/app/market/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import MarketHeader from "./components/MarketHeader";
import MarketChart from "./components/MarketChart";
import MarketAnalysis from "./components/MarketAnalysis";
import MarketTable from "./components/MarketTable";
import { marketService } from "@/services/market.service"; // Import Service
import { MarketPrice } from "@/types/market";

export default function MarketPage() {
  const [data, setData] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API một lần duy nhất ở đây
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const marketData = await marketService.getMarketPrices();
        console.log("Dữ liệu thị trường:", marketData); // Debug
        setData(marketData);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FDFB]">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {/* 👇 TRUYỀN DATA VÀO HEADER ĐỂ HIỂN THỊ 4 Ô TRÊN CÙNG */}
        <MarketHeader data={data} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 mt-6">
          <div className="lg:col-span-8">
            <MarketChart />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <MarketAnalysis />
          </div>
        </div>

        {/* Truyền data vào Table luôn nếu Table hỗ trợ props (Optional) */}
        <MarketTable /> 
      </main>
      <Footer />
    </div>
  );
}