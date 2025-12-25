// frontend/src/app/(customer)/products/components/Pagination.tsx
"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="mt-8 flex justify-center items-center space-x-2">
      {/* Mũi tên trái */}
      {currentPage > 1 && (
        <button
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-[25px] hover:border-green-500 hover:bg-green-50 transition"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <span className="text-gray-600">←</span>
        </button>
      )}

      {/* Hiển thị số trang theo logic */}
      {totalPages <= 3 ? (
        // Nếu có 3 trang trở xuống: hiển thị tất cả
        Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`w-10 h-10 flex items-center justify-center rounded-[25px] font-medium shadow-sm ${
              currentPage === pageNum
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-600 hover:border-green-500 hover:bg-green-50"
            }`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))
      ) : (
        // Nếu có nhiều hơn 3 trang
        <>
          {/* Luôn hiển thị trang 1 */}
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-[25px] font-medium shadow-sm ${
              currentPage === 1
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-600 hover:border-green-500 hover:bg-green-50"
            }`}
            onClick={() => handlePageChange(1)}
          >
            1
          </button>

          {/* Hiển thị ... nếu currentPage > 3 */}
          {currentPage > 3 && <span className="px-2 text-gray-400">...</span>}

          {/* Hiển thị trang trước nếu currentPage > 2 */}
          {currentPage > 2 && currentPage !== totalPages && (
            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-[25px] font-medium hover:border-green-500 hover:bg-green-50"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1}
            </button>
          )}

          {/* Hiển thị trang hiện tại nếu không phải trang đầu/cuối */}
          {currentPage > 1 && currentPage < totalPages && (
            <button className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-[25px] font-medium shadow-sm">
              {currentPage}
            </button>
          )}

          {/* Hiển thị trang tiếp theo nếu currentPage < totalPages - 1 */}
          {currentPage < totalPages - 1 && (
            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-[25px] font-medium hover:border-green-500 hover:bg-green-50"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1}
            </button>
          )}

          {/* Hiển thị ... nếu currentPage < totalPages - 2 */}
          {currentPage < totalPages - 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}

          {/* Luôn hiển thị trang cuối */}
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-[25px] font-medium shadow-sm ${
              currentPage === totalPages
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-600 hover:border-green-500 hover:bg-green-50"
            }`}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Mũi tên phải */}
      {currentPage < totalPages && (
        <button
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-[25px] hover:border-green-500 hover:bg-green-50 transition"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <span className="text-gray-600">→</span>
        </button>
      )}
    </div>
  );
};

export default Pagination;
