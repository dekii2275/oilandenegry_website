// frontend/src/app/profile/components/MyOrders/Pagination.tsx
"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PaginationState } from "../../types";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const [showPageSelector, setShowPageSelector] = useState(false);

  console.log("Pagination Component:", { page, limit, total, totalPages });

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePageChange = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  const handlePageSelectorClick = () => {
    setShowPageSelector(!showPageSelector);
  };

  const handleSelectPage = (selectedPage: number) => {
    onPageChange(selectedPage);
    setShowPageSelector(false);
  };

  return (
    <div className="p-5 flex flex-col sm:flex-row justify-between items-center bg-[#D9D9D9] border-t border-gray-400 gap-4 relative">
      <span className="text-sm font-medium text-gray-600">
        Hiển thị {startItem} → {endItem} trong tổng số {total} đơn hàng
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="p-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {totalPages <= 3 ? (
          Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                page === pageNum
                  ? "bg-[#88D0B5] text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handlePageChange(pageNum)}
              aria-label={`Trang ${pageNum}`}
            >
              {pageNum}
            </button>
          ))
        ) : (
          <>
            <button
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                page === 1
                  ? "bg-[#88D0B5] text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handlePageChange(1)}
              aria-label="Trang 1"
            >
              1
            </button>

            {page > 3 && <span className="px-1 text-gray-400">...</span>}

            {page > 2 && page !== totalPages && (
              <button
                className="w-8 h-8 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 transition"
                onClick={() => handlePageChange(page - 1)}
                aria-label={`Trang ${page - 1}`}
              >
                {page - 1}
              </button>
            )}

            {page > 1 && page < totalPages && (
              <button
                className="w-8 h-8 rounded-lg text-sm font-medium bg-[#88D0B5] text-white shadow-sm transition"
                aria-label={`Trang ${page} (hiện tại)`}
                aria-current="page"
              >
                {page}
              </button>
            )}

            {page < totalPages - 1 && (
              <button
                className="w-8 h-8 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 transition"
                onClick={() => handlePageChange(page + 1)}
                aria-label={`Trang ${page + 1}`}
              >
                {page + 1}
              </button>
            )}

            {page < totalPages - 2 && (
              <span className="px-1 text-gray-400">...</span>
            )}

            <button
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                page === totalPages
                  ? "bg-[#88D0B5] text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handlePageChange(totalPages)}
              aria-label={`Trang ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>

        {totalPages > 1 && (
          <div className="relative">
            <button
              onClick={handlePageSelectorClick}
              className="p-2 bg-white rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
              aria-label="Chọn trang"
              title="Chọn trang"
            >
              <List size={16} />
            </button>

            {/* Dropdown chọn trang */}
            {showPageSelector && (
              <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px] max-h-60 overflow-y-auto z-10">
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b">
                    Chọn trang
                  </div>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handleSelectPage(pageNum)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition ${
                          page === pageNum
                            ? "bg-[#88D0B5] text-white hover:bg-[#76b9a1]"
                            : "text-gray-700"
                        }`}
                      >
                        Trang {pageNum}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showPageSelector && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPageSelector(false)}
        />
      )}
    </div>
  );
}
