// frontend/src/app/profile/hooks/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("zenergy_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`API Call: ${API_URL}${endpoint}`);

      // Tạo headers mặc định
      const defaultHeaders = this.getHeaders();

      // Nếu body là FormData, xóa Content-Type để browser tự set
      let finalHeaders: HeadersInit;
      if (options.body instanceof FormData) {
        const { "Content-Type": _, ...headersWithoutContentType } =
          defaultHeaders as Record<string, string>;
        finalHeaders = {
          ...headersWithoutContentType,
        };
      } else {
        finalHeaders = defaultHeaders;
      }

      // Merge với headers từ options nếu có
      if (options.headers) {
        if (options.headers instanceof Headers) {
          const optionsHeadersObj: Record<string, string> = {};
          options.headers.forEach((value, key) => {
            optionsHeadersObj[key] = value;
          });
          finalHeaders = { ...finalHeaders, ...optionsHeadersObj };
        } else if (typeof options.headers === "object") {
          finalHeaders = {
            ...finalHeaders,
            ...(options.headers as Record<string, string>),
          };
        }
      }

      // Nếu body là FormData, không set Content-Type trong headers
      if (options.body instanceof FormData) {
        const finalHeadersObj = finalHeaders as Record<string, string>;
        delete finalHeadersObj["Content-Type"];
        delete finalHeadersObj["content-type"];
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: finalHeaders,
      });

      // Nếu response không phải JSON (ví dụ file download)
      const responseContentType = response.headers.get("content-type");
      if (
        responseContentType &&
        responseContentType.includes("application/json")
      ) {
        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            message: data.message || `HTTP ${response.status}`,
            errors: data.errors,
          };
        }

        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } else {
        // Trả về response object cho non-JSON responses
        if (!response.ok) {
          return {
            success: false,
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        return {
          success: true,
          data: response as any,
        };
      }
    } catch (error: any) {
      console.error("API Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  }

  // ==================== USER PROFILE APIs ====================
  // API 1: Lấy thông tin người dùng
  async getUserProfile() {
    return this.request<any>("/api/user/profile");
  }

  // API 2: Cập nhật thông tin người dùng
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

  // API 3: Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    return this.request<{ avatar_url: string }>("/api/user/avatar", {
      method: "POST",
      body: formData,
    });
  }

  // API 4: Lấy danh sách địa chỉ
  async getAddresses() {
    return this.request<string[]>("/api/user/addresses");
  }

  // API 5: Thêm/Cập nhật địa chỉ
  async updateAddress(index: number, address: string) {
    return this.request<string[]>("/api/user/addresses", {
      method: "PUT",
      body: JSON.stringify({ index, address }),
    });
  }

  // API 6: Xóa địa chỉ
  async deleteAddress(index: number) {
    return this.request<string[]>(`/api/user/addresses/${index}`, {
      method: "DELETE",
    });
  }

  // ==================== ORDERS APIs ====================
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
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status && params.status !== "all")
      queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.min_amount)
      queryParams.append("min_amount", params.min_amount.toString());
    if (params?.max_amount)
      queryParams.append("max_amount", params.max_amount.toString());
    if (params?.payment_status && params.payment_status !== "all")
      queryParams.append("payment_status", params.payment_status);

    const queryString = queryParams.toString();
    return this.request<PaginatedResponse<any>>(
      `/api/user/orders${queryString ? `?${queryString}` : ""}`
    );
  }

  // API 8: Lấy chi tiết đơn hàng theo ID
  async getOrderById(orderId: string) {
    return this.request<any>(`/api/user/orders/${orderId}`);
  }

  // API 9: Tải hóa đơn (PDF)
  async downloadInvoice(orderId: string) {
    try {
      const token = localStorage.getItem("zenergy_token");
      const response = await fetch(
        `${API_URL}/api/user/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Tạo blob từ response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // API 10: Hủy đơn hàng
  async cancelOrder(orderId: string) {
    return this.request<any>(`/api/user/orders/${orderId}/cancel`, {
      method: "POST",
    });
  }

  // ==================== PAYMENT APIs ====================
  // API 11: Lấy danh sách phương thức thanh toán
  async getPaymentMethods() {
    return this.request<any[]>("/api/user/payment-methods");
  }

  // API 12: Thêm phương thức thanh toán mới (thẻ)
  async addPaymentMethod(data: {
    card_number: string;
    expiry_date: string; // "MM/YY"
    cvv: string;
    card_holder_name: string;
  }) {
    return this.request<any>("/api/user/payment-methods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // API 13: Xóa phương thức thanh toán
  async deletePaymentMethod(methodId: string) {
    return this.request<any>(`/api/user/payment-methods/${methodId}`, {
      method: "DELETE",
    });
  }

  // API 14: Đặt làm phương thức thanh toán mặc định
  async setDefaultPaymentMethod(methodId: string) {
    return this.request<any>(
      `/api/user/payment-methods/${methodId}/set-default`,
      {
        method: "PUT",
      }
    );
  }

  // API 15: Hủy liên kết thẻ (không xóa)
  async deactivatePaymentMethod(methodId: string) {
    return this.request<any>(
      `/api/user/payment-methods/${methodId}/deactivate`,
      {
        method: "PUT",
      }
    );
  }

  // API 16: Kích hoạt lại thẻ đã hủy
  async activatePaymentMethod(methodId: string) {
    return this.request<any>(`/api/user/payment-methods/${methodId}/activate`, {
      method: "PUT",
    });
  }

  // API 17: Lấy danh sách ví điện tử
  async getWallets() {
    return this.request<any[]>("/api/user/wallets");
  }

  // API 18: Kết nối ví điện tử
  async connectWallet(walletType: string) {
    return this.request<{ auth_url?: string }>("/api/user/wallets/connect", {
      method: "POST",
      body: JSON.stringify({ wallet_type: walletType }),
    });
  }

  // API 19: Hủy kết nối ví điện tử
  async disconnectWallet(walletType: string) {
    return this.request<any>("/api/user/wallets/disconnect", {
      method: "POST",
      body: JSON.stringify({ wallet_type: walletType }),
    });
  }

  // ==================== SECURITY APIs ====================
  // API 20: Đổi mật khẩu
  async changePassword(data: { old_password: string; new_password: string }) {
    return this.request<any>("/api/user/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // API 21: Lấy danh sách thiết bị đã đăng nhập
  async getDevices() {
    return this.request<any[]>("/api/user/devices");
  }

  // API 22: Đăng xuất thiết bị cụ thể
  async logoutDevice(deviceId: string) {
    return this.request<any>(`/api/user/devices/${deviceId}/logout`, {
      method: "DELETE",
    });
  }

  // API 23: Đăng xuất tất cả thiết bị khác
  async logoutAllDevices() {
    return this.request<any>("/api/user/devices/logout-all", {
      method: "POST",
    });
  }

  // API 24: Lấy QR code cho 2FA
  async get2FAQRCode() {
    return this.request<{ qr_code_url: string; secret: string }>(
      "/api/user/2fa/qr"
    );
  }

  // API 25: Bật 2FA với mã xác thực
  async enable2FA(code: string) {
    return this.request<any>("/api/user/enable-2fa", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // API 26: Tắt 2FA
  async disable2FA() {
    return this.request<any>("/api/user/disable-2fa", {
      method: "POST",
    });
  }

  // API 27: Kiểm tra trạng thái 2FA
  async get2FAStatus() {
    return this.request<{ two_factor_enabled: boolean }>(
      "/api/user/2fa/status"
    );
  }

  // ==================== STATISTICS APIs ====================
  // API 28: Lấy thống kê tài khoản
  async getAccountStats() {
    return this.request<{
      total_orders: number;
      total_cards: number;
      total_wallets: number;
      total_spent: number;
    }>("/api/user/stats");
  }

  // ==================== UTILITY METHODS ====================
  // Kiểm tra kết nối API
  async testConnection() {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Lấy thông tin API server
  async getServerInfo() {
    return this.request<any>("/api/info");
  }
}

export const apiClient = new ApiClient();
