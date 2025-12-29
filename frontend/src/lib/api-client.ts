// --- FILE: src/lib/api-client.ts ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status?: number
  data?: any
}

// 👇 ĐỊNH NGHĨA LẠI KIỂU DỮ LIỆU ĐỂ HỖ TRỢ PARAMS 👇
interface CustomRequestInit extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = (baseURL || '').replace(/\/+$/, '')
  }

  /**
   * Get authentication token từ localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('zenergy_token') || localStorage.getItem('access_token')
  }

  /**
   * Build headers với authentication nếu có
   */
  private buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Merge custom headers nếu có
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, customHeaders)
      }
    }

    // Thêm Authorization token nếu có
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Parse response - hỗ trợ nhiều format response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      // Nếu không phải JSON, trả về text hoặc object rỗng để tránh lỗi parse
      return (text ? { message: text } : {}) as unknown as T
    }

    const data = await response.json()
    
    // Hỗ trợ cả { data: ... } wrapper và direct response
    return (data.data !== undefined ? data.data : data) as T
  }

  /**
   * Handle errors một cách nhất quán
   * Đã tích hợp logic chống Crash React (Object as Child)
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'Có lỗi xảy ra'
    let errorData: any = null

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
        
        // --- XỬ LÝ LỖI THÔNG MINH ---
        const rawMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        
        // 1. Nếu là Array (Lỗi validation FastAPI/Pydantic) -> Lấy msg đầu tiên
        if (Array.isArray(rawMessage)) {
             errorMessage = rawMessage[0]?.msg || JSON.stringify(rawMessage);
        }
        // 2. Nếu là Object khác -> Ép sang chuỗi JSON
        else if (typeof rawMessage === 'object') {
            errorMessage = JSON.stringify(rawMessage); 
        } 
        // 3. Nếu là String -> Dùng luôn
        else {
            errorMessage = String(rawMessage);
        }
        // -----------------------------

      } else {
        errorMessage = await response.text() || errorMessage
      }
    } catch (e) {
      errorMessage = response.statusText || errorMessage
    }

    const error: ApiError = {
      message: errorMessage, // Đảm bảo luôn là String
      status: response.status,
      data: errorData,
    }

    throw error
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: CustomRequestInit = {} // Sử dụng CustomRequestInit thay vì RequestInit
  ): Promise<T> {
    
    // ✅ SỬ DỤNG LET ĐỂ CÓ THỂ CỘNG CHUỖI
    let url = endpoint.startsWith('http') 
        ? endpoint 
        : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options.headers),
    }

    // Xử lý params (Query String)
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
      });
      const separator = url.includes('?') ? '&' : '?';
      url += separator + searchParams.toString(); // ✅ Hợp lệ vì url là 'let'
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        await this.handleError(response)
      }

      return await this.parseResponse<T>(response)
    } catch (error) {
      // Nếu lỗi đã được xử lý (có message là string), ném tiếp
      if (error && typeof error === 'object' && 'message' in error) {
        throw error
      }

      // Lỗi mạng hoặc lỗi không xác định
      throw {
        message: error instanceof Error ? error.message : 'Lỗi kết nối đến server',
        status: 0,
      } as ApiError
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: CustomRequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: CustomRequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: CustomRequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: CustomRequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: CustomRequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export class
export { ApiClient }