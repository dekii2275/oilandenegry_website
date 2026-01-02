// frontend/src/app/profile/hooks/useOrders.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Order, FilterState, PaginationState } from "../types";
import { ALL_MOCK_ORDERS } from "../constants/mockData";
import { apiClient } from "./api";

export function useOrders() {
  const [activeTab, setActiveTab] = useState("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "", end: "" },
    minAmount: "",
    maxAmount: "",
    paymentStatus: "all",
    sortBy: "newest",
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  // Hàm parse date
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Hàm sort
  const sortOrders = useCallback((ordersToSort: Order[], sortBy: string) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            parseDate(b.created_at).getTime() -
            parseDate(a.created_at).getTime()
          );
        case "oldest":
          return (
            parseDate(a.created_at).getTime() -
            parseDate(b.created_at).getTime()
          );
        case "highest":
          return b.total_amount - a.total_amount;
        case "lowest":
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });
  }, []);

  // ==================== Hàm fetch chính ====================
  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem("zenergy_token");

        // Nếu dùng mock data
        if (
          !apiUrl ||
          !token ||
          apiUrl === "http://localhost:8000" ||
          useMockData
        ) {
          console.log("Using mock data for orders");
          console.log("Active tab:", activeTab);
          console.log("Total mock orders:", ALL_MOCK_ORDERS.length);

          setUseMockData(true);

          // Lấy toàn bộ mock data
          let result = [...ALL_MOCK_ORDERS];

          // Merge với đơn hàng từ localStorage
          try {
            const localOrders = JSON.parse(
              localStorage.getItem("zenergy_my_orders") || "[]"
            );
            if (Array.isArray(localOrders) && localOrders.length > 0) {
              // Merge và loại bỏ duplicate dựa trên order_number
              const existingOrderNumbers = new Set(
                result.map((o) => o.order_number)
              );
              const newLocalOrders = localOrders.filter(
                (o: Order) => !existingOrderNumbers.has(o.order_number)
              );
              result = [...result, ...newLocalOrders];
            }
          } catch (error) {
            console.error("Error loading local orders:", error);
          }

          // QUAN TRỌNG: Filter theo activeTab
          console.log("Filtering by activeTab:", activeTab);
          if (activeTab !== "all") {
            const beforeFilter = result.length;
            result = result.filter((order) => order.status === activeTab);
            console.log(
              `Filtered from ${beforeFilter} to ${result.length} orders`
            );
          }

          // Lọc theo tìm kiếm
          if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            result = result.filter(
              (order) =>
                order.order_number.toLowerCase().includes(searchLower) ||
                order.items.toLowerCase().includes(searchLower)
            );
          }

          // Lọc theo date range
          if (filters.dateRange.start || filters.dateRange.end) {
            result = result.filter((order) => {
              const orderDate = parseDate(order.created_at);
              if (
                filters.dateRange.start &&
                orderDate < new Date(filters.dateRange.start)
              )
                return false;
              if (
                filters.dateRange.end &&
                orderDate > new Date(filters.dateRange.end)
              )
                return false;
              return true;
            });
          }

          // Lọc theo amount range
          if (filters.minAmount) {
            const min = parseFloat(filters.minAmount);
            if (!isNaN(min)) {
              result = result.filter((order) => order.total_amount >= min);
            }
          }

          if (filters.maxAmount) {
            const max = parseFloat(filters.maxAmount);
            if (!isNaN(max)) {
              result = result.filter((order) => order.total_amount <= max);
            }
          }

          // Lọc theo payment status
          if (filters.paymentStatus !== "all") {
            result = result.filter(
              (order) => order.payment_status === filters.paymentStatus
            );
          }

          /// Sắp xếp
          result = sortOrders(result, filters.sortBy);

          // Cập nhật state orders
          setOrders(result);

          // Tính toán pagination DỰA TRÊN KẾT QUẢ ĐÃ FILTER
          const total = result.length;
          const limit = pagination.limit;
          const totalPages = Math.ceil(total / limit);

          console.log("Pagination info:", {
            page,
            limit,
            total,
            totalPages,
            activeTab,
          });

          // Tính toán items cho trang hiện tại
          const start = (page - 1) * limit;
          const end = start + limit;
          const paginatedResult = result.slice(start, end);

          console.log("Items for current page:", {
            start,
            end,
            items: paginatedResult.length,
          });

          setFilteredOrders(paginatedResult);
          setPagination({
            page,
            limit,
            total,
            totalPages,
          });

          return;
        }

        // ========== GỌI API THẬT ==========
        console.log("Fetching orders from API...");

        // Build query parameters
        const queryParams: any = {
          page,
          limit: pagination.limit,
          status: activeTab !== "all" ? activeTab : undefined,
          search: searchTerm || undefined,
          sort_by: filters.sortBy,
          start_date: filters.dateRange.start || undefined,
          end_date: filters.dateRange.end || undefined,
          min_amount: filters.minAmount
            ? parseFloat(filters.minAmount)
            : undefined,
          max_amount: filters.maxAmount
            ? parseFloat(filters.maxAmount)
            : undefined,
          payment_status:
            filters.paymentStatus !== "all" ? filters.paymentStatus : undefined,
        };

        const result = await apiClient.getOrders(queryParams);

        if (result.success && result.data) {
          const apiData = result.data as any;
          const ordersData = apiData.data || apiData;
          const paginationData = apiData.pagination;

          setOrders(ordersData);
          setFilteredOrders(ordersData);

          if (paginationData) {
            setPagination({
              page: paginationData.page || page,
              limit: paginationData.limit || pagination.limit,
              total: paginationData.total || ordersData.length,
              totalPages:
                paginationData.total_pages ||
                Math.ceil(ordersData.length / pagination.limit),
            });
          } else {
            setPagination({
              page,
              limit: pagination.limit,
              total: ordersData.length,
              totalPages: Math.ceil(ordersData.length / pagination.limit),
            });
          }

          setUseMockData(false);
        } else {
          console.warn("API failed, using mock data:", result.message);
          setUseMockData(true);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Không thể tải dữ liệu đơn hàng");
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchTerm, filters, pagination.limit, useMockData]
  );

  // ==================== API CALL: Tải hóa đơn ====================
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // Check localStorage first
      const localOrders = JSON.parse(
        localStorage.getItem("zenergy_orders") || "[]"
      );
      const foundOrder = localOrders.find((o: any) => o.orderId === orderId);

      if (foundOrder) {
        // Redirect to invoice page for download
        window.location.href = `/profile/orders/invoice/${orderId}?download=true`;
        return;
      }

      if (useMockData) {
        // Redirect to invoice page
        window.location.href = `/profile/orders/invoice/${orderId}?download=true`;
        return;
      }

      console.log(`Downloading invoice for order ${orderId}`);
      const result = await apiClient.downloadInvoice(orderId);

      if (!result.success) {
        alert(result.message || "Tải hóa đơn thất bại");
      }
    } catch (err: any) {
      console.error("Error downloading invoice:", err);
      // Fallback: redirect to invoice page
      window.location.href = `/profile/orders/invoice/${orderId}?download=true`;
    }
  };

  // ==================== API CALL: Xem chi tiết đơn hàng ====================
  const handleViewOrder = async (orderId: string) => {
    try {
      // Check localStorage first
      const localOrders = JSON.parse(
        localStorage.getItem("zenergy_orders") || "[]"
      );
      const foundOrder = localOrders.find((o: any) => o.orderId === orderId);

      if (foundOrder) {
        // Redirect to invoice page
        window.location.href = `/profile/orders/invoice/${orderId}`;
        return;
      }

      if (useMockData) {
        // For mock data, still redirect to invoice page
        window.location.href = `/profile/orders/invoice/${orderId}`;
        return;
      }

      console.log(`Viewing order ${orderId}`);
      const result = await apiClient.getOrderById(orderId);

      if (result.success && result.data) {
        window.location.href = `/profile/orders/invoice/${orderId}`;
      } else {
        alert(result.message || "Không thể xem chi tiết đơn hàng");
      }
    } catch (err: any) {
      console.error("Error viewing order:", err);
      // Fallback: redirect to invoice page anyway
      window.location.href = `/profile/orders/invoice/${orderId}`;
    }
  };

  // ==================== API CALL: Hủy đơn hàng ====================
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      if (useMockData) {
        alert(`Hủy đơn hàng ${orderId} (Mock Data)`);
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        fetchOrders(pagination.page);
        return;
      }

      console.log(`Cancelling order ${orderId}`);
      const result = await apiClient.cancelOrder(orderId);

      if (result.success) {
        alert("Đã hủy đơn hàng thành công");
        fetchOrders(pagination.page);
      } else {
        alert(result.message || "Hủy đơn hàng thất bại");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  // Xử lý search với debounce
  const handleSearchChange = (value: string) => {
    setTempSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      fetchOrders(1);
    }, 500);
  };

  // Xử lý khi filters thay đổi
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    fetchOrders(1);
  };

  // Xử lý khi tab thay đổi
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchOrders(1);
  };

  // Xử lý khi page thay đổi
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchOrders(page);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: { start: "", end: "" },
      minAmount: "",
      maxAmount: "",
      paymentStatus: "all",
      sortBy: "newest",
    });
    setTempSearchTerm("");
    setSearchTerm("");
    fetchOrders(1);
  };

  // Clear các filter cụ thể
  const clearDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start: "", end: "" },
    }));
    fetchOrders(1);
  };

  const clearAmountFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minAmount: "",
      maxAmount: "",
    }));
    fetchOrders(1);
  };

  const clearPaymentFilter = () => {
    setFilters((prev) => ({
      ...prev,
      paymentStatus: "all",
    }));
    fetchOrders(1);
  };

  const clearSearch = () => {
    setTempSearchTerm("");
    setSearchTerm("");
    fetchOrders(1);
  };

  // Tự động fetch khi component mount
  useEffect(() => {
    console.log("Initial fetch with activeTab:", activeTab);
    fetchOrders(1);
  }, []);

  // Cập nhật khi dependencies thay đổi
  useEffect(() => {
    console.log(
      "Dependency changed - activeTab:",
      activeTab,
      "useMockData:",
      useMockData
    );
    if (useMockData) {
      fetchOrders(pagination.page);
    }
  }, [activeTab, searchTerm, filters, useMockData]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    filterModalOpen,
    setFilterModalOpen,
    orders,
    filteredOrders,
    useMockData,
    loading,
    error,
    searchTerm,
    tempSearchTerm,
    setTempSearchTerm,
    filters,
    setFilters: handleFiltersChange,
    pagination,
    setPagination: handlePageChange,
    handleSearchChange,
    resetFilters,
    handleDownloadInvoice,
    handleViewOrder,
    handleCancelOrder,
    refreshOrders: () => fetchOrders(pagination.page),
    clearDateFilter,
    clearAmountFilter,
    clearPaymentFilter,
    clearSearch,
  };
}
