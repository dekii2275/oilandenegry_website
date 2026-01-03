// frontend/src/app/market/product/[slug]/components/ChartSection.tsx

"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Product } from "../types";
import { generateChartDataByRange } from "../utils/chartData";

interface ChartSectionProps {
  product: Product;
}

export default function ChartSection({ product }: ChartSectionProps) {
  const [chartTimeRange, setChartTimeRange] = useState("30d");
  const [chartData, setChartData] = useState(product.chartData || []);

  useEffect(() => {
    if (typeof product.price === "number") {
      const newChartData = generateChartDataByRange(
        product.price,
        product.isUp,
        chartTimeRange
      );
      setChartData(newChartData);
    }
  }, [chartTimeRange, product.price, product.isUp]);

  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            Phân tích giá & Dự báo
          </h3>
          <p className="text-sm text-gray-500">
            Dữ liệu{" "}
            {chartTimeRange === "7d"
              ? "7 ngày"
              : chartTimeRange === "30d"
              ? "30 ngày"
              : chartTimeRange === "90d"
              ? "90 ngày"
              : "1 năm"}{" "}
            gần nhất với dự báo AI
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setChartTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                chartTimeRange === range
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {range === "7d"
                ? "7 ngày"
                : range === "30d"
                ? "30 ngày"
                : range === "90d"
                ? "90 ngày"
                : "1 năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#71C291" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#71C291" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString("vi-VN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                "Giá",
              ]}
              labelFormatter={(label) => `Ngày ${label}`}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorForecast)"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#71C291"
              strokeWidth={3}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex justify-center gap-8 mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-4 h-1 bg-[#71C291] rounded-full"></div>
          <span className="text-gray-700">Giá thực tế</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-4 h-1 border-b-2 border-dashed border-purple-500"></div>
          <span className="text-gray-500">Dự báo AI</span>
        </div>
      </div>
    </div>
  );
}
