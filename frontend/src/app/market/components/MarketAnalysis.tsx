"use client";

import { ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";

export default function MarketAnalysis() {
  return (
    <div className="bg-[#71C291] p-6 rounded-[32px] text-white shadow-lg shadow-green-100 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="font-bold mb-1">Phân tích Thị trường</h2>
        <p className="text-[10px] opacity-80 mb-6">
          Nhận định mới nhất từ chuyên gia EnergyMarket
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight size={14} className="text-green-200" />
              <span className="text-xs font-bold text-green-50">
                Xu hướng tăng
              </span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-90">
              Giá dầu thô dự kiến tăng nhẹ trong tuần tới do hạn chế nguồn cung
              từ OPEC+.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-green-200" />
              <span className="text-xs font-bold text-green-50">
                Điểm nổi bật
              </span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-90">
              Nhu cầu khí đốt tự nhiên tại Châu Á đang phục hồi mạnh mẽ sau mùa
              đông.
            </p>
          </div>
        </div>

        {/* Chuyển button thành Link hoặc bọc Link quanh button */}
        <Link href="/market/report" className="block">
          <button className="w-full bg-white text-[#71C291] font-bold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-all active:scale-[0.98]">
            Đọc báo cáo chi tiết
          </button>
        </Link>
      </div>
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
    </div>
  );
}
