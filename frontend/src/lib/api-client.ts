/**
 * API Client Utility
 * Centralized API client với error handling, authentication, và response parsing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.212.128.129:8001/api'

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

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Get authentication token từ localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
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
      // Nếu không phải JSON, trả về empty object hoặc text
      const text = await response.text()
      return (text ? JSON.parse(text) : {}) as T
    }

    const data = await response.json()
    
    // Hỗ trợ cả { data: ... } wrapper và direct response
    return (data.data !== undefined ? data.data : data) as T
  }

  /**
   * Handle errors một cách nhất quán
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'Có lỗi xảy ra'
    let errorData: any = null

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        errorMessage = await response.text() || errorMessage
      }
    } catch (e) {
      // Nếu không parse được error, dùng status text
      errorMessage = response.statusText || errorMessage
    }

    const error: ApiError = {
      message: errorMessage,
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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options.headers),
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        await this.handleError(response)
      }

      return await this.parseResponse<T>(response)
    } catch (error) {
      // Nếu là ApiError thì throw lại
      if (error && typeof error === 'object' && 'message' in error) {
        throw error
      }

      // Network error hoặc lỗi khác
      throw {
        message: error instanceof Error ? error.message : 'Lỗi kết nối đến server',
        status: 0,
      } as ApiError
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export class để có thể tạo instance mới nếu cần
export { ApiClient }

