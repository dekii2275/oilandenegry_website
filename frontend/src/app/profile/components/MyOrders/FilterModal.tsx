// frontend/src/app/profile/components/MyOrders/FilterModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
import { FilterState } from "../../types";

interface FilterModalProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function FilterModal({
  filters,
  setFilters,
  onClose,
  onReset,
}: FilterModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Bộ lọc nâng cao</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Khoảng thời gian
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Từ ngày
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Đến ngày
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Khoảng giá</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Tối thiểu
                </label>
                <input
                  type="number"
                  placeholder="VNĐ"
                  className="w-full p-2 border rounded-lg"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Tối đa
                </label>
                <input
                  type="number"
                  placeholder="VNĐ"
                  className="w-full p-2 border rounded-lg"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Trạng thái thanh toán
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters({ ...filters, paymentStatus: e.target.value })
              }
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sắp xếp theo
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Giá cao nhất</option>
              <option value="lowest">Giá thấp nhất</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onReset}
            className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#88D0B5] text-white rounded-lg font-medium hover:bg-[#76b9a1] transition"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
