"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { detailedPrices } from "../utils/marketData";

export default function MarketTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Logic cho nút Lọc (Filter)
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Danh mục lọc dựa trên dữ liệu thật
  const categories = [
    "Tất cả",
    "Dầu thô & Nhiên liệu",
    "Điện mặt trời",
    "Năng lượng tái tạo",
    "Máy phát điện",
  ];

  // Logic kết hợp: Tìm kiếm + Lọc theo loại
  const filteredPrices = detailedPrices.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const visiblePrices = isExpanded
    ? filteredPrices
    : filteredPrices.slice(0, 5);

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden flex flex-col">
      {/* Header & Controls */}
      <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-bold text-gray-800 text-lg">Bảng giá Chi tiết</h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm mặt hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-100 w-full sm:w-64 transition-all"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-2.5 border rounded-xl transition-all ${
                showFilterMenu || selectedCategory !== "Tất cả"
                  ? "bg-green-50 border-green-200 text-[#71C291]"
                  : "bg-gray-50 border-gray-100 text-gray-400"
              }`}
            >
              <Filter size={18} />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                  Lọc theo loại
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowFilterMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {cat}
                    {selectedCategory === cat && (
                      <Check size={14} className="text-[#71C291]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section - ĐẦY ĐỦ CÁC TRƯỜNG */}
      <div
        className={`overflow-x-auto custom-scrollbar ${
          isExpanded ? "max-h-[600px] overflow-y-auto" : ""
        }`}
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-y border-gray-50">
              <th className="px-6 py-4">Hàng hóa</th>
              <th className="px-6 py-4">Đơn vị</th>
              <th className="px-6 py-4">Giá hiện tại</th>
              <th className="px-6 py-4">Thay đổi</th>
              <th className="px-6 py-4">% Thay đổi</th>
              <th className="px-6 py-4">Cao nhất</th>
              <th className="px-6 py-4">Thấp nhất</th>
              <th className="px-6 py-4 text-center">Biểu đồ</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
            {visiblePrices.length > 0 ? (
              visiblePrices.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/market/product/${row.slug}`)}
                  className="hover:bg-gray-50/60 transition-all group cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold flex items-center gap-3">
                    <div
                      className={`w-1 h-4 rounded-full ${
                        row.color === "blue"
                          ? "bg-blue-500"
                          : row.color === "green"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    ></div>
                    <span className="group-hover:text-[#71C291] transition-colors">
                      {row.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium">
                    {row.unit}
                  </td>
                  <td className="px-6 py-4 font-black text-gray-800">
                    {mounted ? `$${row.price}` : "---"}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold ${
                      row.changeValue.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {mounted ? row.changeValue : "0.00"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${
                        row.changePercent.startsWith("+")
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {mounted ? row.changePercent : "--%"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-500">
                    ${mounted ? row.high : "---"}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-500">
                    ${mounted ? row.low : "---"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-8 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { v: 40 },
                            { v: 30 },
                            { v: 60 },
                            { v: 50 },
                            { v: 90 },
                            { v: 75 },
                          ]}
                        >
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={
                              row.changePercent.startsWith("+")
                                ? "#22c55e"
                                : "#ef4444"
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-20 text-center text-gray-400 font-bold"
                >
                  Không tìm thấy mặt hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-5 text-[11px] font-black text-gray-400 hover:text-[#71C291] transition-all border-t border-gray-50 flex items-center justify-center gap-2 uppercase tracking-widest bg-white"
      >
        {isExpanded ? "Thu gọn danh sách" : "Xem toàn bộ danh sách năng lượng"}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #71c291;
        }
      `}</style>
    </div>
  );
}
