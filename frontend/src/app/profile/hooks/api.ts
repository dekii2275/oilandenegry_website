// frontend/src/app/profile/hooks/api.ts
// Fix: base URL normalize + correct Orders APIs + map backend -> UI Order

import type { Order } from "../types";

const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// Nếu env = https://zenergy.cloud/api  -> strip "/api" để endpoint "/api/xxx" không bị double
const API_BASE = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL.slice(0, -4)
  : RAW_API_URL;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

type BackendOrderItem = {
  product_id: number;
  product_name: string;
  store_id?: number | null;
  store_name?: string | null;
  quantity: number;
  price: string | number;
  line_total: string | number;
};

type BackendOrderOut = {
  order_id: number;
  user_id: number;
  customer_name?: string | null;
  customer_phone?: string | null;
  status: string; // "PENDING" | "CONFIRMED" | ...
  payment_method?: string | null; // "COD" | "QR" | ...
  shipping_address?: string | null;
  created_at: string; // ISO
  subtotal?: string | number;
  shipping_fee?: string | number;
  tax?: string | number;
  total_amount: string | number;
  items: BackendOrderItem[];
};

function pickToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("zenergy_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null
  );
}

function toStatusLower(s: string): Order["status"] {
  const x = (s || "").toLowerCase();
  if (x.includes("pending")) return "pending";
  if (x.includes("confirm")) return "confirmed";
  if (x.includes("ship")) return "shipping";
  if (x.includes("complete")) return "completed";
  if (x.includes("cancel")) return "cancelled";
  // fallback an toàn
  return "pending";
}

function formatDateVN(iso: string): string {
  // backend trả ISO: 2026-01-03T08:10:41...
  // UI cũ đang dùng parseDate(dd/mm/yyyy), nên ta format về dd/mm/yyyy
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapBackendOrderToUI(o: BackendOrderOut): Order {
  const statusLower = toStatusLower(o.status);
  const paymentMethod = (o.payment_method || "").toUpperCase();

  const itemsText =
    Array.isArray(o.items) && o.items.length
      ? o.items
          .map((it) => `${it.product_name} x${it.quantity}`)
          .join(", ")
      : "—";

  // payment_status (UI đang có filter "paid/pending/refunded")
  // Tạm map đơn giản:
  // - COD: pending cho đến completed
  // - QR: pending nếu status pending, còn lại paid
  let payment_status = "pending";
  if (paymentMethod === "COD") {
    payment_status = statusLower === "completed" ? "paid" : "pending";
  } else if (paymentMethod === "QR") {
    payment_status = statusLower === "pending" ? "pending" : "paid";
  }

  return {
    id: String(o.order_id),
    order_number: `ORD-${o.order_id}`,
    created_at: formatDateVN(o.created_at),
    status: statusLower,
    total_amount: Number(o.total_amount) || 0,
    items: itemsText,
    payment_status,
  };
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = pickToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`API Call: ${API_BASE}${endpoint}`);

      const defaultHeaders = this.getHeaders();

      let finalHeaders: HeadersInit;
      if (options.body instanceof FormData) {
        const { "Content-Type": _, ...headersWithoutContentType } =
          defaultHeaders as Record<string, string>;
        finalHeaders = { ...headersWithoutContentType };
      } else {
        finalHeaders = defaultHeaders;
      }

      if (options.headers) {
        if (options.headers instanceof Headers) {
          const optionsHeadersObj: Record<string, string> = {};
          options.headers.forEach((value, key) => (optionsHeadersObj[key] = value));
          finalHeaders = { ...finalHeaders, ...optionsHeadersObj };
        } else if (typeof options.headers === "object") {
          finalHeaders = { ...finalHeaders, ...(options.headers as Record<string, string>) };
        }
      }

      if (options.body instanceof FormData) {
        const finalHeadersObj = finalHeaders as Record<string, string>;
        delete finalHeadersObj["Content-Type"];
        delete finalHeadersObj["content-type"];
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: finalHeaders,
      });

      const responseContentType = response.headers.get("content-type");
      if (responseContentType && responseContentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            message: data.message || data.detail || `HTTP ${response.status}`,
            errors: data.errors,
          };
        }

        return {
          success: true,
          data: (data.data ?? data) as T,
          message: data.message,
        };
      }

      if (!response.ok) {
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }
      return { success: true, data: response as any };
    } catch (error: any) {
      console.error("API Error:", error);
      return { success: false, message: error.message || "Network error" };
    }
  }

  // ==================== ORDERS APIs (FIXED) ====================

  // Lấy danh sách đơn hàng (backend: /api/orders/?skip=&limit=)
    // API 7: Lấy danh sách đơn hàng với phân trang và filter
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string; // "all", "pending", "confirmed", "shipping", "completed", "cancelled"
    search?: string;
    sort_by?: string; // "newest", "oldest", "highest", "lowest"
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
    payment_status?: string; // "all", "paid", "pending", "refunded"
  }) {
    // Backend thật của bạn: GET /orders/?skip=&limit=
    // (API_URL đã là .../api nên endpoint chỉ cần /orders)
    const page = params?.page || 1;
    const limit = params?.limit || 5;

    // để filter/tab hoạt động ổn, mình fetch nhiều hơn 1 chút rồi filter client-side
    const fetchLimit = Math.max(50, limit * 10);
    const skip = 0;

    const queryParams = new URLSearchParams();
    queryParams.append("skip", String(skip));
    queryParams.append("limit", String(fetchLimit));

    const res = await this.request<any[]>(`/orders/?${queryParams.toString()}`);
    if (!res.success || !res.data) return res;

    const rawList = Array.isArray(res.data) ? res.data : [];

    // map backend -> UI Order type (id/order_number/items/total_amount/status...)
    const mapped = rawList.map((o: any) => {
      const orderId = o?.order_id ?? o?.id ?? "";
      const createdISO = o?.created_at || "";
      const createdAt = createdISO
        ? new Date(createdISO).toLocaleDateString("vi-VN")
        : "";

      const statusRaw = String(o?.status || "pending").toLowerCase();
      const status =
        statusRaw === "pending" ||
        statusRaw === "confirmed" ||
        statusRaw === "shipping" ||
        statusRaw === "completed" ||
        statusRaw === "cancelled"
          ? statusRaw
          : "pending";

      const totalNum =
        typeof o?.total_amount === "number"
          ? o.total_amount
          : parseFloat(String(o?.total_amount || "0"));

      const itemsArr = Array.isArray(o?.items) ? o.items : [];
      const itemsText = itemsArr
        .map((it: any) => {
          const name = it?.product_name || it?.name || "Sản phẩm";
          const qty = Number(it?.quantity || 1);
          return `${name} x${qty}`;
        })
        .join(", ");

      const pm = String(o?.payment_method || "").toUpperCase();
      let payment_status = "pending";
      if (pm === "QR") payment_status = status === "pending" ? "pending" : "paid";
      if (pm === "COD") payment_status = "pending";

      return {
        id: String(orderId),
        order_number: `ORD-${orderId}`,
        created_at: createdAt,
        status,
        total_amount: Number.isFinite(totalNum) ? totalNum : 0,
        items: itemsText || "(Không có sản phẩm)",
        payment_status,
        // giữ lại raw nếu cần debug về sau (không ảnh hưởng UI)
        __raw: o,
      };
    });

    // ===== filter client-side theo UI đang dùng =====
    let result = [...mapped];

    if (params?.status && params.status !== "all") {
      result = result.filter((x) => x.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (x) =>
          x.order_number.toLowerCase().includes(q) ||
          x.items.toLowerCase().includes(q)
      );
    }

    if (typeof params?.min_amount === "number") {
      result = result.filter((x) => x.total_amount >= params.min_amount!);
    }
    if (typeof params?.max_amount === "number") {
      result = result.filter((x) => x.total_amount <= params.max_amount!);
    }

    if (params?.payment_status && params.payment_status !== "all") {
      result = result.filter((x) => x.payment_status === params.payment_status);
    }

    if (params?.sort_by) {
      switch (params.sort_by) {
        case "newest":
          result.sort((a, b) => (b.__raw?.created_at || "").localeCompare(a.__raw?.created_at || ""));
          break;
        case "oldest":
          result.sort((a, b) => (a.__raw?.created_at || "").localeCompare(b.__raw?.created_at || ""));
          break;
        case "highest":
          result.sort((a, b) => b.total_amount - a.total_amount);
          break;
        case "lowest":
          result.sort((a, b) => a.total_amount - b.total_amount);
          break;
      }
    }

    // paginate client-side (để tab/filter vẫn đúng)
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = result.slice(start, end);

    return {
      ...res,
      data: {
        data: pageItems,
        pagination: { page, limit, total, total_pages: totalPages },
      } as any,
    };
  }


  // Chi tiết đơn hàng (backend: /api/orders/{order_id})
  // API 8: Lấy chi tiết đơn hàng theo ID
  async getOrderById(orderId: string) {
    const res = await this.request<any>(`/orders/${orderId}`);
    if (!res.success || !res.data) return res;

    const o: any = res.data;
    const orderId2 = o?.order_id ?? o?.id ?? orderId;

    const createdISO = o?.created_at || "";
    const createdAt = createdISO
      ? new Date(createdISO).toLocaleDateString("vi-VN")
      : "";

    const statusRaw = String(o?.status || "pending").toLowerCase();
    const status =
      statusRaw === "pending" ||
      statusRaw === "confirmed" ||
      statusRaw === "shipping" ||
      statusRaw === "completed" ||
      statusRaw === "cancelled"
        ? statusRaw
        : "pending";

    const totalNum =
      typeof o?.total_amount === "number"
        ? o.total_amount
        : parseFloat(String(o?.total_amount || "0"));

    const itemsArr = Array.isArray(o?.items) ? o.items : [];
    const itemsText = itemsArr
      .map((it: any) => {
        const name = it?.product_name || it?.name || "Sản phẩm";
        const qty = Number(it?.quantity || 1);
        return `${name} x${qty}`;
      })
      .join(", ");

    const pm = String(o?.payment_method || "").toUpperCase();
    let payment_status = "pending";
    if (pm === "QR") payment_status = status === "pending" ? "pending" : "paid";
    if (pm === "COD") payment_status = "pending";

    return {
      ...res,
      data: {
        id: String(orderId2),
        order_number: `ORD-${orderId2}`,
        created_at: createdAt,
        status,
        total_amount: Number.isFinite(totalNum) ? totalNum : 0,
        items: itemsText || "(Không có sản phẩm)",
        payment_status,
        __raw: o,
      },
    };
  }


  // (tạm giữ lại để không lỗi build UI cũ — backend chưa có invoice/cancel theo đường dẫn cũ)
  async downloadInvoice(orderId: string) {
    return { success: false, message: "Chưa hỗ trợ tải hóa đơn (backend chưa có endpoint)." };
  }

  async cancelOrder(orderId: string) {
    return { success: false, message: "Chưa hỗ trợ hủy đơn (backend chưa có endpoint)." };
  }

  // ==================== USER PROFILE APIs (giữ nguyên cũ, chưa sửa trong bước này) ====================
  async getUserProfile() {
    return this.request<any>("/api/user/profile");
  }
  async updateUserProfile(data: {
    full_name: string;
    email: string;
    phone_number: string;
    birthday: string;
  }) {
    return this.request<any>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return this.request<{ avatar_url: string }>("/api/user/avatar", {
      method: "POST",
      body: formData,
    });
  }
  async getAddresses() {
    return this.request<string[]>("/api/user/addresses");
  }
  async updateAddress(index: number, address: string) {
    return this.request<string[]>("/api/user/addresses", {
      method: "PUT",
      body: JSON.stringify({ index, address }),
    });
  }
  async deleteAddress(index: number) {
    return this.request<string[]>(`/api/user/addresses/${index}`, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
