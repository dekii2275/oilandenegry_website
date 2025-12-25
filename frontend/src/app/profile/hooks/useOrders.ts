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

  // ==================== API CALL: Lấy danh sách đơn hàng ====================
  // Endpoint: GET /api/user/orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra xem có nên dùng API thật không
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("zenergy_token");

      // Nếu không có API URL hoặc token, dùng mock data
      if (!apiUrl || !token || apiUrl === "http://localhost:8000") {
        console.log("Using mock data for orders");
        setUseMockData(true);
        setOrders(ALL_MOCK_ORDERS);
        setFilteredOrders(ALL_MOCK_ORDERS);
        setPagination({
          page: 1,
          limit: 5,
          total: ALL_MOCK_ORDERS.length,
          totalPages: Math.ceil(ALL_MOCK_ORDERS.length / 5),
        });
        return;
      }

      // ========== GỌI API THẬT ==========
      console.log("Fetching orders from API...");

      // Build query parameters từ filters hiện tại
      const queryParams: any = {
        page: pagination.page,
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

      // Gọi API
      const result = await apiClient.getOrders(queryParams);

      if (result.success && result.data) {
        // API trả về data đã được paginated và filtered
        const apiData = result.data as any;
        const ordersData = apiData.data || apiData;
        const paginationData = apiData.pagination;

        setOrders(ordersData);
        setFilteredOrders(ordersData);

        if (paginationData) {
          setPagination({
            page: paginationData.page || 1,
            limit: paginationData.limit || 5,
            total: paginationData.total || ordersData.length,
            totalPages:
              paginationData.total_pages || Math.ceil(ordersData.length / 5),
          });
        } else {
          setPagination({
            page: 1,
            limit: 5,
            total: ordersData.length,
            totalPages: Math.ceil(ordersData.length / 5),
          });
        }

        setUseMockData(false);
      } else {
        // Nếu API fail, fallback về mock data
        console.warn("API failed, using mock data:", result.message);
        setUseMockData(true);
        setOrders(ALL_MOCK_ORDERS);
        setFilteredOrders(ALL_MOCK_ORDERS);
        setPagination({
          page: 1,
          limit: 5,
          total: ALL_MOCK_ORDERS.length,
          totalPages: Math.ceil(ALL_MOCK_ORDERS.length / 5),
        });
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Không thể tải dữ liệu đơn hàng");
      // Fallback to mock data nếu có lỗi
      setUseMockData(true);
      setOrders(ALL_MOCK_ORDERS);
      setFilteredOrders(ALL_MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, searchTerm, filters]);

  // ==================== API CALL: Tải hóa đơn ====================
  // Endpoint: GET /api/user/orders/:id/invoice
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      if (useMockData) {
        // Mock data behavior
        alert(`Tải hóa đơn cho đơn hàng ${orderId} (Mock Data)`);
        const blob = new Blob(
          [`Hóa đơn ${orderId}\nNgày: ${new Date().toLocaleDateString()}`],
          { type: "text/plain" }
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${orderId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      // ========== GỌI API THẬT ==========
      console.log(`Downloading invoice for order ${orderId}`);
      const result = await apiClient.downloadInvoice(orderId);

      if (!result.success) {
        alert(result.message || "Tải hóa đơn thất bại");
      }
    } catch (err: any) {
      console.error("Error downloading invoice:", err);
      alert("Có lỗi xảy ra khi tải hóa đơn");
    }
  };

  // ==================== API CALL: Xem chi tiết đơn hàng ====================
  // Endpoint: GET /api/user/orders/:id
  const handleViewOrder = async (orderId: string) => {
    try {
      if (useMockData) {
        alert(`Xem chi tiết đơn hàng ${orderId} (Mock Data)`);
        return;
      }

      // ========== GỌI API THẬT ==========
      console.log(`Viewing order ${orderId}`);
      const result = await apiClient.getOrderById(orderId);

      if (result.success && result.data) {
        // Chuyển hướng đến trang chi tiết đơn hàng
        window.location.href = `/orders/${orderId}`;
      } else {
        alert(result.message || "Không thể xem chi tiết đơn hàng");
      }
    } catch (err: any) {
      console.error("Error viewing order:", err);
      alert("Có lỗi xảy ra khi xem chi tiết đơn hàng");
    }
  };

  // ==================== API CALL: Hủy đơn hàng ====================
  // Endpoint: POST /api/user/orders/:id/cancel
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      if (useMockData) {
        alert(`Hủy đơn hàng ${orderId} (Mock Data)`);
        // Update local state for mock data
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        return;
      }

      // ========== GỌI API THẬT ==========
      console.log(`Cancelling order ${orderId}`);
      const result = await apiClient.cancelOrder(orderId);

      if (result.success) {
        alert("Đã hủy đơn hàng thành công");
        // Refresh orders list
        fetchOrders();
      } else {
        alert(result.message || "Hủy đơn hàng thất bại");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  // Parse date từ string "dd/mm/yyyy"
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Sắp xếp orders
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

  // Áp dụng filters và search (chỉ cho mock data)
  const applyFiltersAndSearch = useCallback(
    (searchValue = searchTerm) => {
      // Nếu đang dùng API thật, không cần filter client-side
      if (!useMockData) {
        // API đã filter server-side, chỉ cần set search term
        setSearchTerm(searchValue);
        // Gọi lại API với filter mới
        fetchOrders();
        return;
      }

      // Chỉ filter client-side cho mock data
      let result = [...orders];

      // Lọc theo tab
      if (activeTab !== "all") {
        result = result.filter((order) => order.status === activeTab);
      }

      // Lọc theo tìm kiếm
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase().trim();
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

      // Sắp xếp
      result = sortOrders(result, filters.sortBy);

      setFilteredOrders(result);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        total: result.length,
        totalPages: Math.ceil(result.length / prev.limit),
      }));
    },
    [
      activeTab,
      filters,
      orders,
      searchTerm,
      sortOrders,
      useMockData,
      fetchOrders,
    ]
  );

  // Xử lý search với debounce
  const handleSearchChange = (value: string) => {
    setTempSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      applyFiltersAndSearch(value);
    }, 500);
  };

  // Xử lý khi filters thay đổi
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Nếu dùng API thật, fetch với filter mới
    if (!useMockData) {
      fetchOrders();
    }
  };

  // Xử lý khi tab thay đổi
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Nếu dùng API thật, fetch với tab mới
    if (!useMockData) {
      fetchOrders();
    }
  };

  // Xử lý khi page thay đổi
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    // Nếu dùng API thật, fetch với page mới
    if (!useMockData) {
      fetchOrders();
    }
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
    // Nếu dùng API thật, fetch lại với filter rỗng
    if (!useMockData) {
      fetchOrders();
    }
  };

  // Lấy orders cho trang hiện tại
  const getCurrentPageOrders = () => {
    // Nếu dùng API thật, API đã trả về data paginated
    if (!useMockData) {
      return filteredOrders;
    }

    // Mock data: cần paginate client-side
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredOrders.slice(start, end);
  };

  // Tự động fetch khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Áp dụng filters khi thay đổi (chỉ cho mock data)
  useEffect(() => {
    if (useMockData && orders.length > 0) {
      applyFiltersAndSearch();
    }
  }, [activeTab, filters, applyFiltersAndSearch, orders.length, useMockData]);

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
    getCurrentPageOrders,
    applyFiltersAndSearch,
    handleDownloadInvoice,
    handleViewOrder,
    handleCancelOrder,
    refreshOrders: fetchOrders,
  };
}
