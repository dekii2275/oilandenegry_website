// frontend/src/app/(customer)/products/components/SortBar.tsx
"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SortBarProps {
  sortLabel: string;
  isSortOpen: boolean;
  sortOptions: SortOption[];
  onSortToggle: () => void;
  onSortSelect: (value: string, label: string) => void;
  currentSort: string;
  startItem: number;
  endItem: number;
  totalProducts: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SortBar: React.FC<SortBarProps> = ({
  sortLabel,
  isSortOpen,
  sortOptions,
  onSortToggle,
  onSortSelect,
  currentSort,
  startItem,
  endItem,
  totalProducts,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-[25px] shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        Hiển thị{" "}
        <span className="font-semibold text-gray-900">
          {totalProducts > 0 ? `${startItem}-${endItem}` : "0"}
        </span>{" "}
        trên{" "}
        <span className="font-semibold text-gray-900">{totalProducts}</span> sản
        phẩm
        {hasActiveFilters && (
          <span className="ml-3 text-green-600">
            (Đang lọc)
            <button
              className="ml-2 text-red-500 hover:text-red-700 font-medium"
              onClick={onClearFilters}
            >
              Xóa tất cả
            </button>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Sắp xếp theo:</span>

        {/* Dropdown sắp xếp */}
        <div className="relative sort-dropdown-container">
          <button
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-[25px] hover:border-green-500 transition bg-white min-w-[180px] justify-between"
            onClick={onSortToggle}
          >
            <span className="text-sm text-gray-700">{sortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isSortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {isSortOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-[25px] shadow-lg z-50 max-h-80 overflow-y-auto">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                    currentSort === option.value
                      ? "text-green-600 bg-green-50 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => onSortSelect(option.value, option.label)}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortBar;
