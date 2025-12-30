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
} from "recharts";
import { chartTimeRanges, marketStats } from "../utils/marketData"; // Lấy marketStats đã filter từ marketData

// Danh mục hiển thị khớp với logic màu sắc trong marketData
const productCategories = [
  { id: "Dầu", name: "Dầu thô & Nhiên liệu", color: "#71C291" },
  { id: "Điện", name: "Điện mặt trời", color: "#F59E0B" },
  { id: "Năng lượng", name: "Năng lượng tái tạo", color: "#3B82F6" },
  { id: "Máy phát", name: "Máy phát điện", color: "#8B5CF6" },
];

const generateChartDataByProduct = (range: string, categoryId: string) => {
  // Tìm giá thực tế của sản phẩm thuộc category này từ marketStats
  const targetProduct = marketStats.find((s) =>
    s.category.includes(categoryId)
  );

  // Lấy giá trị số từ chuỗi price (ví dụ: "$82.40" -> 82.40)
  const realPrice = targetProduct
    ? parseFloat(targetProduct.price.replace(/[$,]/g, ""))
    : 100;

  const generatePoints = (labels: string[], basePrice: number) => {
    return labels.map((name, i) => {
      const randomFlux = (Math.random() - 0.5) * (basePrice * 0.05); // Biến động 5%
      const gia = basePrice + randomFlux + i * (basePrice * 0.005); // Xu hướng tăng nhẹ
      return {
        name,
        gia: Number(gia.toFixed(2)),
        duBao: Number((gia + Math.random() * 2).toFixed(2)),
      };
    });
  };

  switch (range) {
    case "1 Tuần":
      return generatePoints(
        ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"],
        realPrice
      );
    case "1 Tháng":
      return generatePoints(
        ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
        realPrice
      );
    case "1 Năm":
      return generatePoints(
        [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8",
          "T9",
          "T10",
          "T11",
          "T12",
        ],
        realPrice
      );
    case "3 Tháng":
      return generatePoints(["Tháng 1", "Tháng 2", "Tháng 3"], realPrice);
    default:
      return [];
  }
};

export default function MarketChart() {
  const [selectedRange, setSelectedRange] = useState("1 Tuần");
  const [selectedCategory, setSelectedCategory] = useState(
    productCategories[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const chartData = generateChartDataByProduct(
        selectedRange,
        selectedCategory.id
      );
      setData(chartData);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedRange, selectedCategory]);

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Biểu đồ Xu hướng Giá
          </h2>
          <div className="flex gap-4 mt-4">
            {productCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory.id === cat.id
                    ? "text-[#71C291]"
                    : "text-gray-300 hover:text-gray-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedCategory.id === cat.id
                      ? ""
                      : "bg-transparent border border-gray-200"
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory.id === cat.id ? cat.color : "",
                  }}
                ></div>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
          {chartTimeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`text-[10px] px-4 py-2 rounded-xl font-bold transition-all ${
                selectedRange === range
                  ? "bg-white shadow-sm text-[#71C291]"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-3xl">
            <div className="w-6 h-6 border-2 border-[#71C291] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={selectedCategory.color}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={selectedCategory.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#CBD5E1", fontWeight: 600 }}
              dy={15}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#CBD5E1", fontWeight: 600 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              }}
            />
            <Area
              type="monotone"
              dataKey="duBao"
              stroke="#E2E8F0"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="gia"
              stroke={selectedCategory.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMain)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-10">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <div
            className="w-3 h-[2px] rounded-full"
            style={{ backgroundColor: selectedCategory.color }}
          ></div>
          Giá thực tế từ kho sản phẩm
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
          <div className="w-3 h-[2px] border-t-2 border-dashed border-gray-300"></div>
          Dự báo (AI)
        </div>
      </div>
    </div>
  );
}
