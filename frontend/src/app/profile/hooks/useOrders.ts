// frontend/src/app/profile/hooks/useOrders.ts
import { useState, useEffect, useRef, useCallback } from "react";
import type { Order, FilterState, PaginationState } from "../types";
import { ALL_MOCK_ORDERS } from "../constants/mockData";
import { apiClient } from "./api";

// Map status từ backend -> UI tabs (lowercase)
const STATUS_MAP: Record<string, Order["status"]> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// format ISO -> dd/mm/yyyy (UI đang hiển thị kiểu này)
function formatDateDDMMYYYY(input: string): string {
  if (!input) return "";
  // nếu đã là dd/mm/yyyy thì giữ nguyên
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input;

  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function parseToNumber(v: any): number {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
}

// backend order -> UI Order
function mapBackendOrderToUI(o: any): Order {
  const orderId = String(o?.order_id ?? o?.id ?? "");
  const statusUpper = String(o?.status ?? "").toUpperCase();
  const status = STATUS_MAP[statusUpper] || "pending";

  const itemsArr = Array.isArray(o?.items) ? o.items : [];
  const itemsText =
    itemsArr.length > 0
      ? itemsArr
          .map((it: any) => {
            const name = it?.product_name || `#${it?.product_id ?? ""}`;
            const qty = it?.quantity ?? 0;
            return `${name} (x${qty})`;
          })
          .join(", ")
      : "";

  // payment_status UI đang dùng để filter trong mock; backend không có field này
  // => set đơn giản: QR + PENDING => pending, còn lại coi là paid
  const paymentMethod = String(o?.payment_method ?? "").toUpperCase();
  const payment_status =
    paymentMethod === "QR" && status === "pending" ? "pending" : "paid";

  return {
    id: orderId,
    order_number: `#ORD-${orderId}`,
    created_at: formatDateDDMMYYYY(String(o?.created_at ?? "")),
    status,
    total_amount: parseToNumber(o?.total_amount),
    items: itemsText,
    payment_status,
  };
}

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

  // parse date cho sort: hỗ trợ dd/mm/yyyy hoặc ISO
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    }
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? new Date(0) : d;
  };

  const sortOrders = useCallback(
    (ordersToSort: Order[], sortBy: string) => {
      return [...ordersToSort].sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return parseDate(b.created_at).getTime() - parseDate(a.created_at).getTime();
          case "oldest":
            return parseDate(a.created_at).getTime() - parseDate(b.created_at).getTime();
          case "highest":
            return (b.total_amount || 0) - (a.total_amount || 0);
          case "lowest":
            return (a.total_amount || 0) - (b.total_amount || 0);
          default:
            return 0;
        }
      });
    },
    []
  );

  // ✅ Load orders từ backend thật
  const loadOrdersFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // NOTE: NEXT_PUBLIC_API_URL trong client build là build-time, có thể bị rỗng dù container runtime có env.
      // Backend của bạn đang chạy ổn ở https://zenergy.cloud/api, nên fallback cứng để tránh rơi vào mock.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://zenergy.cloud/api";
      const token =
        localStorage.getItem("zenergy_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      // thiếu token => fallback mock
      if (!token) {
        throw new Error("Thiếu token (zenergy_token/access_token)");
      }

      // Lấy nhiều để filter/paginate local cho đơn giản
      const res = await apiClient.getOrders({ page: 1, limit: 200 });

      if (!res.success || !res.data) {
        throw new Error(res.message || "API getOrders thất bại");
      }

      const raw = Array.isArray(res.data) ? res.data : [];
      const mapped = raw.map(mapBackendOrderToUI);

      setOrders(mapped);
      setUseMockData(false);
    } catch (e: any) {
      console.error("loadOrdersFromApi error:", e);
      setError(e?.message || "Không thể tải đơn hàng");
      setUseMockData(true);
      setOrders([...ALL_MOCK_ORDERS]);
    } finally {
      setLoading(false);
    }
  }, []);

  // filter + paginate local
  const applyFiltersAndPaginate = useCallback(
    (page = 1) => {
      let result = [...orders];

      // tab status
      if (activeTab !== "all") {
        result = result.filter((o) => o.status === activeTab);
      }

      // search
      if (searchTerm.trim()) {
        const s = searchTerm.trim().toLowerCase();
        result = result.filter(
          (o) =>
            (o.order_number || "").toLowerCase().includes(s) ||
            (o.items || "").toLowerCase().includes(s)
        );
      }

      // date range
      if (filters.dateRange.start || filters.dateRange.end) {
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        result = result.filter((o) => {
          const d = parseDate(o.created_at);
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      }

      // amount range
      if (filters.minAmount) {
        const min = Number(filters.minAmount);
        if (Number.isFinite(min)) {
          result = result.filter((o) => (o.total_amount || 0) >= min);
        }
      }
      if (filters.maxAmount) {
        const max = Number(filters.maxAmount);
        if (Number.isFinite(max)) {
          result = result.filter((o) => (o.total_amount || 0) <= max);
        }
      }

      // payment status
      if (filters.paymentStatus !== "all") {
        result = result.filter((o) => o.payment_status === filters.paymentStatus);
      }

      // sort
      result = sortOrders(result, filters.sortBy);

      // pagination
      const total = result.length;
      const limit = pagination.limit;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const safePage = Math.min(Math.max(1, page), totalPages);
      const startIdx = (safePage - 1) * limit;
      const endIdx = startIdx + limit;

      setFilteredOrders(result.slice(startIdx, endIdx));
      setPagination((prev) => ({
        ...prev,
        page: safePage,
        total,
        totalPages,
      }));
    },
    [orders, activeTab, searchTerm, filters, pagination.limit, sortOrders]
  );

  // init load
  useEffect(() => {
    loadOrdersFromApi();
  }, [loadOrdersFromApi]);

  // re-apply filters whenever deps change
  useEffect(() => {
    applyFiltersAndPaginate(1);
  }, [applyFiltersAndPaginate]);

  const handleSearchChange = (value: string) => {
    setTempSearchTerm(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 400);
  };

  const resetFilters = () => {
    setActiveTab("all");
    setSearchTerm("");
    setTempSearchTerm("");
    setFilters({
      dateRange: { start: "", end: "" },
      minAmount: "",
      maxAmount: "",
      paymentStatus: "all",
      sortBy: "newest",
    });
    applyFiltersAndPaginate(1);
  };

  const clearDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start: "", end: "" },
    }));
  };

  const clearAmountFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minAmount: "",
      maxAmount: "",
    }));
  };

  const clearPaymentFilter = () => {
    setFilters((prev) => ({
      ...prev,
      paymentStatus: "all",
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setTempSearchTerm("");
  };

  // Pagination handler
  const setPaginationPage = (page: number) => {
    applyFiltersAndPaginate(page);
  };

  // Actions (tạm)
  const handleDownloadInvoice = async (orderId: string) => {
    alert(`Backend chưa có invoice. Order: ${orderId}`);
  };
  const handleViewOrder = async (orderId: string) => {
    alert(`Xem chi tiết đơn hàng: ${orderId}`);
  };
  const handleCancelOrder = async (orderId: string) => {
    alert(`Backend chưa có API hủy đơn cho khách. Order: ${orderId}`);
  };

  return {
    activeTab,
    setActiveTab,

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
    setFilters,

    pagination,
    setPagination: setPaginationPage,

    handleSearchChange,
    resetFilters,

    handleDownloadInvoice,
    handleViewOrder,
    handleCancelOrder,

    clearDateFilter,
    clearAmountFilter,
    clearPaymentFilter,
    clearSearch,
  };
}
