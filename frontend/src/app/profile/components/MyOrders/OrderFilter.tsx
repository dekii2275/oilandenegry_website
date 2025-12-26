// frontend/src/app/profile/components/MyOrders/OrderFilter.tsx
"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import { FilterState } from "../../types";

interface OrderFilterProps {
  activeTab: string;
  tabs: Array<{ key: string; label: string }>;
  tempSearchTerm: string;
  filters: FilterState;
  useMockData: boolean;
  searchTerm: string;
  onTabChange: (tab: string) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onFilterClick: () => void;
  onResetFilters: () => void;
  onClearDateFilter: () => void;
  onClearAmountFilter: () => void;
  onClearPaymentFilter: () => void;
  formatCurrency: (amount: number) => string;
}

export default function OrderFilter({
  activeTab,
  tabs,
  tempSearchTerm,
  filters,
  useMockData,
  searchTerm,
  onTabChange,
  onSearchChange,
  onClearSearch,
  onFilterClick,
  onResetFilters,
  onClearDateFilter,
  onClearAmountFilter,
  onClearPaymentFilter,
  formatCurrency,
}: OrderFilterProps) {
  return (
    <div className="bg-[#EFEDED] rounded-[25px] p-6 shadow-sm">
      <div className="flex border-b border-gray-300 mb-6 gap-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap rounded-lg transition relative ${
              activeTab === tab.key
                ? "bg-black text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm"
            className="w-full pl-12 pr-10 py-3 rounded-full border-none bg-white focus:ring-2 focus:ring-[#88D0B5] outline-none"
            value={tempSearchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {tempSearchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onFilterClick}
            className={`flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition ${
              filters.dateRange.start ||
              filters.dateRange.end ||
              filters.minAmount ||
              filters.maxAmount ||
              filters.paymentStatus !== "all" ||
              filters.sortBy !== "newest"
                ? "bg-blue-50 border-blue-300 text-blue-600"
                : ""
            }`}
          >
            <Filter size={18} />
            <span className="text-sm font-medium">Lọc</span>
            {(filters.dateRange.start ||
              filters.dateRange.end ||
              filters.minAmount ||
              filters.maxAmount ||
              filters.paymentStatus !== "all" ||
              filters.sortBy !== "newest") && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>

          <button
            className="p-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition"
            onClick={onResetFilters}
            title="Reset tất cả bộ lọc"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
          </button>
        </div>
      </div>

      {(searchTerm ||
        filters.dateRange.start ||
        filters.dateRange.end ||
        filters.minAmount ||
        filters.maxAmount ||
        filters.paymentStatus !== "all") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              Tìm: "{searchTerm}"
              <button
                onClick={onClearSearch}
                className="ml-1 hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
              Từ {filters.dateRange.start || "..."} đến{" "}
              {filters.dateRange.end || "..."}
              <button
                onClick={onClearDateFilter}
                className="ml-1 hover:text-green-900"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs">
              Giá:{" "}
              {filters.minAmount
                ? `≥ ${formatCurrency(parseFloat(filters.minAmount))}`
                : ""}
              {filters.minAmount && filters.maxAmount && " → "}
              {filters.maxAmount
                ? `≤ ${formatCurrency(parseFloat(filters.maxAmount))}`
                : ""}
              <button
                onClick={onClearAmountFilter}
                className="ml-1 hover:text-purple-900"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {filters.paymentStatus !== "all" && (
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
              Thanh toán:{" "}
              {filters.paymentStatus === "paid"
                ? "Đã thanh toán"
                : filters.paymentStatus === "pending"
                ? "Chờ thanh toán"
                : "Hoàn tiền"}
              <button
                onClick={onClearPaymentFilter}
                className="ml-1 hover:text-yellow-900"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
