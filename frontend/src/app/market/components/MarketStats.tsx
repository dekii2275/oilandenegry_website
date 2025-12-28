"use client";

import {
  Droplets,
  Flame,
  Zap,
  Battery,
  Fuel,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { marketStats } from "../utils/marketData";

const iconMap = {
  blue: <Droplets className="text-blue-500" size={20} />,
  purple: <Fuel className="text-purple-500" size={20} />,
  orange: <Flame className="text-orange-500" size={20} />,
  yellow: <Zap className="text-yellow-500" size={20} />,
  green: <Battery className="text-green-500" size={20} />,
};

const getIconByCategory = (category: string) => {
  if (category.includes("Dầu")) return "blue";
  if (category.includes("Điện")) return "yellow";
  if (category.includes("Năng lượng")) return "green";
  if (category.includes("Máy phát")) return "purple";
  return "orange";
};

export default function MarketStats() {
  // 1. Khởi tạo state mounted để kiểm tra môi trường Client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 2. Khi useEffect chạy, nghĩa là đã ở phía Client
    setMounted(true);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {marketStats.map((stat) => (
        <Link
          key={stat.id}
          href={`/market/product/${stat.slug}`}
          className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between hover:border-green-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                {
                  iconMap[
                    getIconByCategory(stat.category) as keyof typeof iconMap
                  ]
                }
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">{stat.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                  {stat.location}
                </p>
              </div>
            </div>

            {/* 3. Chỉ hiển thị phần thay đổi % khi đã mounted */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                stat.isUp
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {stat.isUp ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {mounted ? stat.change : "--%"}
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-800">
                ${stat.price}
              </span>
              <span className="text-[10px] text-gray-400 font-medium ml-2">
                /{stat.unit}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              Chi tiết →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
