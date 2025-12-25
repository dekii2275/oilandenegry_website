// frontend/src/app/profile/MyOrders.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useOrders } from "./hooks/useOrders";
import OrderTable from "./components/MyOrders/OrderTable";
import OrderFilter from "./components/MyOrders/OrderFilter";
import FilterModal from "./components/MyOrders/FilterModal";
import Pagination from "./components/MyOrders/Pagination";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function MyOrders() {
  const {
    activeTab,
    setActiveTab,
    filterModalOpen,
    setFilterModalOpen,
    filteredOrders = [],
    useMockData = false,
    searchTerm = "",
    tempSearchTerm = "",
    setTempSearchTerm,
    filters = {
      dateRange: { start: "", end: "" },
      minAmount: "",
      maxAmount: "",
      paymentStatus: "all",
      sortBy: "newest",
    },
    setFilters,
    pagination = {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    },
    setPagination,
    handleSearchChange,
    resetFilters,
    getCurrentPageOrders,
    handleDownloadInvoice,
    handleViewOrder,
    handleCancelOrder,
    refreshOrders,
  } = useOrders();

  // State local để quản lý pagination
  const [localPagination, setLocalPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  // Đồng bộ pagination từ hook
  useEffect(() => {
    setLocalPagination(pagination);
  }, [pagination]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-400 text-black";
      case "shipping":
        return "bg-yellow-400 text-black";
      case "pending":
        return "bg-blue-400 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "confirmed":
        return "bg-purple-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // SỬA LẠI CÁC HÀM FILTER - Thêm type cho filters
  const clearDateFilter = () => {
    if (setFilters) {
      setFilters({
        ...filters,
        dateRange: { start: "", end: "" },
      });
    }
  };

  const clearAmountFilter = () => {
    if (setFilters) {
      setFilters({
        ...filters,
        minAmount: "",
        maxAmount: "",
      });
    }
  };

  const clearPaymentFilter = () => {
    if (setFilters) {
      setFilters({
        ...filters,
        paymentStatus: "all",
      });
    }
  };

  const clearSearch = () => {
    if (setTempSearchTerm) {
      setTempSearchTerm("");
    }
    if (handleSearchChange) {
      handleSearchChange("");
    }
  };

  // SỬA LẠI HÀM PAGINATION - Đơn giản hóa
  const handlePageChange = (page: number) => {
    // Cập nhật local state
    setLocalPagination((prev) => ({ ...prev, page }));

    // Gọi hàm từ hook nếu có - đơn giản hóa logic
    if (setPagination) {
      try {
        // Thử gọi trực tiếp với page
        (setPagination as any)(page);
      } catch (error) {
        console.log("Error setting pagination:", error);
      }
    }
  };

  const handleTabChange = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    // Reset về trang 1 khi đổi tab
    setLocalPagination((prev) => ({ ...prev, page: 1 }));

    if (setPagination) {
      try {
        (setPagination as any)(1);
      } catch (error) {
        console.log("Error setting pagination:", error);
      }
    }
  };

  // Thêm hàm xử lý cancel order
  const handleCancelOrderWrapper = (orderId: string) => {
    if (handleCancelOrder) {
      handleCancelOrder(orderId);
    } else {
      if (confirm(`Bạn có chắc muốn hủy đơn hàng ${orderId}?`)) {
        alert(`Đã hủy đơn hàng ${orderId} (Mock Data)`);
        // Có thể gọi refreshOrders nếu cần
        if (refreshOrders) {
          refreshOrders();
        }
      }
    }
  };

  // Hàm lấy orders cho trang hiện tại
  const getCurrentOrders = () => {
    if (getCurrentPageOrders) {
      return getCurrentPageOrders();
    }

    // Fallback: tự phân trang nếu hook không cung cấp
    const start = (localPagination.page - 1) * localPagination.limit;
    const end = start + localPagination.limit;
    return filteredOrders.slice(start, end);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>

      {useMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Đang hiển thị dữ liệu mẫu. Kết nối backend để xem dữ liệu thực.
              </p>
            </div>
          </div>
        </div>
      )}

      <OrderFilter
        activeTab={activeTab || "all"}
        tabs={TABS}
        tempSearchTerm={tempSearchTerm}
        filters={filters}
        useMockData={useMockData}
        searchTerm={searchTerm}
        onTabChange={handleTabChange}
        onSearchChange={
          handleSearchChange ||
          ((value: string) => {
            // Fallback nếu handleSearchChange không tồn tại
            if (setTempSearchTerm) {
              setTempSearchTerm(value);
            }
          })
        }
        onClearSearch={clearSearch}
        onFilterClick={() => {
          if (setFilterModalOpen) {
            setFilterModalOpen(true);
          }
        }}
        onResetFilters={resetFilters || (() => {})}
        onClearDateFilter={clearDateFilter}
        onClearAmountFilter={clearAmountFilter}
        onClearPaymentFilter={clearPaymentFilter}
        formatCurrency={formatCurrency}
      />

      {filterModalOpen && (
        <FilterModal
          filters={filters}
          setFilters={setFilters || (() => {})}
          onClose={() => {
            if (setFilterModalOpen) {
              setFilterModalOpen(false);
            }
          }}
          onReset={resetFilters || (() => {})}
        />
      )}

      <div className="bg-[#D9D9D9] rounded-[25px] overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="mx-auto"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-lg">
              Không tìm thấy đơn hàng
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Không có đơn hàng nào phù hợp với bộ lọc của bạn
            </p>
            <button
              onClick={resetFilters || (() => {})}
              className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
            >
              Xem tất cả đơn hàng
            </button>
          </div>
        ) : (
          <>
            <OrderTable
              orders={getCurrentOrders()}
              useMockData={useMockData}
              onViewOrder={handleViewOrder || (() => {})}
              onDownloadInvoice={handleDownloadInvoice || (() => {})}
              onCancelOrder={handleCancelOrderWrapper}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              formatCurrency={formatCurrency}
            />

            {localPagination.totalPages > 1 && (
              <Pagination
                pagination={localPagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
