"use client";

import { RefreshCw, FileText, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MarketHeader() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // Thêm trạng thái kiểm tra đã mount (tải xong trên client) hay chưa để tránh lỗi Hydration
  const [mounted, setMounted] = useState(false);

  const fetchLastUpdated = async () => {
    setIsLoading(true);
    try {
      // Mock API call - sẽ thay bằng API thực tế
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Format current time
      const now = new Date();
      const formatted = now.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit", // Thêm giây để hiển thị chính xác
      });
      setLastUpdated(formatted);
    } catch (error) {
      console.error("Lỗi khi lấy thời gian cập nhật:", error);
      setLastUpdated(new Date().toLocaleString("vi-VN"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLastUpdated();
  };

  useEffect(() => {
    // Đánh dấu là đã tải xong trên trình duyệt
    setMounted(true);
    fetchLastUpdated();

    // Tự động refresh mỗi 5 phút
    const interval = setInterval(fetchLastUpdated, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link
              href="/"
              className="hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <Home size={12} />
              Trang chủ
            </Link>
            <span>&gt;</span>
            <span className="text-green-600 font-medium">Thị trường</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Báo cáo Thị trường Trực tuyến
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Cập nhật dữ liệu giá cả năng lượng, xăng dầu và xu hướng thị trường
            toàn cầu theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              Cập nhật lần cuối
            </p>
            <div className="text-sm font-bold text-gray-700 min-h-[20px]">
              {/* Chỉ hiển thị thời gian khi đã mounted trên client */}
              {!mounted ? (
                <span className="text-gray-300">--:--:--</span>
              ) : isLoading ? (
                <span className="text-gray-400 animate-pulse">Đang tải...</span>
              ) : (
                lastUpdated
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading || !mounted}
            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cập nhật dữ liệu"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/market/report"
            className="flex items-center gap-2 bg-[#71C291] hover:bg-[#5da97b] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-100"
          >
            <FileText size={18} />
            Tải báo cáo PDF
          </Link>
        </div>
      </div>
    </>
  );
}
