"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mockProducts } from "@/app/(customer)/products/utils/productUtils";
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  Flame,
  Zap,
  Battery,
  Fuel,
} from "lucide-react";

// Icon map giống với MarketStats
const iconMap = {
  blue: <Droplets className="text-blue-500" size={20} />,
  purple: <Fuel className="text-purple-500" size={20} />,
  orange: <Flame className="text-orange-500" size={20} />,
  yellow: <Zap className="text-yellow-500" size={20} />,
  green: <Battery className="text-green-500" size={20} />,
};

// Map icon theo category - giống với MarketStats
const getIconByCategory = (category: string) => {
  if (category?.includes("Dầu")) return "blue";
  if (category?.includes("Điện")) return "yellow";
  if (category?.includes("Năng lượng")) return "green";
  if (category?.includes("Máy phát")) return "purple";
  if (category?.includes("Khí")) return "orange";
  return "green";
};

// Hàm tạo slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Format price
const formatPrice = (price: number): string => {
  if (price < 100) return price.toFixed(2);
  if (price < 1000) return price.toFixed(0);
  return price.toLocaleString("vi-VN");
};

export default function MarketPrices() {
  const [marketProducts, setMarketProducts] = useState<any[]>([]);

  useEffect(() => {
    // Lấy 4 sản phẩm nhiên liệu/năng lượng từ mockProducts
    const products = mockProducts as any[]; // Type assertion để tránh lỗi

    const topMarketProducts = products
      .filter(
        (product) =>
          (product.category || "").includes("Dầu") ||
          (product.category || "").includes("Nhiên liệu") ||
          (product.category || "").includes("Năng lượng") ||
          product.name.includes("Dầu") ||
          product.name.includes("Khí") ||
          product.name.includes("Điện")
      )
      .slice(0, 4)
      .map((product) => {
        const slug = generateSlug(product.name);
        const isUp = Math.random() > 0.3;
        const changes = ["+1.2%", "+0.8%", "-0.5%", "+2.1%"];
        const change = changes[Math.floor(Math.random() * changes.length)];
        const price = product.price || 0;
        const unit = product.unit || "chiếc";
        const category = product.category || "Năng lượng";

        // Lấy location từ store
        const getLocationByStore = (storeName?: string): string => {
          const locationMap: Record<string, string> = {
            "Global Petroleum": "London",
            SolarWorld: "Berlin",
            "Energy Plus": "New York",
            "GreenTech Solutions": "Singapore",
            "PowerGen International": "Houston",
            "Heavy Duty Power": "Dubai",
          };
          return storeName ? locationMap[storeName] || "Global" : "Global";
        };

        return {
          id: product.id,
          name: product.name,
          location: getLocationByStore(product.store?.name),
          price: formatPrice(price),
          change,
          isUp,
          unit,
          slug,
          category,
          iconColor: getIconByCategory(category),
        };
      });

    setMarketProducts(topMarketProducts);
  }, []);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Tỷ giá thị trường trực tuyến
          </h2>
          <Link
            href="/market"
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm flex items-center gap-1 group"
          >
            Xem báo cáo chi tiết
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Grid cards - Design giống MarketStats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketProducts.map((stat) => (
            <Link
              key={stat.id}
              href={`/market/product/${stat.slug}`}
              className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {iconMap[stat.iconColor as keyof typeof iconMap]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">
                      {stat.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                      {stat.location}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                    stat.isUp
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {stat.isUp ? (
                    <TrendingUp size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {stat.change}
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
                <span className="text-[10px] text-teal-600 font-medium">
                  Chi tiết →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note - giữ nguyên */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                Dữ liệu trực tiếp
              </span>
              <span>Cập nhật: {new Date().toLocaleTimeString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
