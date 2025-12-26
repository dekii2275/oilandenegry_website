/**
 * Error Handler Utilities
 * Utilities để handle và format errors một cách nhất quán
 */

import { ApiError } from '@/lib/api-client'

export interface ErrorMessage {
  title: string
  message: string
  type: 'error' | 'warning' | 'info'
}

/**
 * Format error thành message dễ hiểu cho user
 */
export function formatError(error: any): ErrorMessage {
  // Nếu là ApiError từ api-client
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError
    
    // Map status codes thành messages phù hợp
    switch (apiError.status) {
      case 401:
        return {
          title: 'Không có quyền truy cập',
          message: 'Vui lòng đăng nhập để tiếp tục',
          type: 'warning',
        }
      case 403:
        return {
          title: 'Truy cập bị từ chối',
          message: 'Bạn không có quyền thực hiện thao tác này',
          type: 'error',
        }
      case 404:
        return {
          title: 'Không tìm thấy',
          message: apiError.message || 'Dữ liệu bạn tìm kiếm không tồn tại',
          type: 'info',
        }
      case 500:
      case 502:
      case 503:
        return {
          title: 'Lỗi server',
          message: 'Server đang gặp sự cố. Vui lòng thử lại sau',
          type: 'error',
        }
      default:
        return {
          title: 'Có lỗi xảy ra',
          message: apiError.message || 'Vui lòng thử lại sau',
          type: 'error',
        }
    }
  }

  // Nếu là Error object thông thường
  if (error instanceof Error) {
    return {
      title: 'Có lỗi xảy ra',
      message: error.message,
      type: 'error',
    }
  }

  // Fallback
  return {
    title: 'Có lỗi xảy ra',
    message: typeof error === 'string' ? error : 'Đã xảy ra lỗi không xác định',
    type: 'error',
  }
}

/**
 * Check nếu error là network error
 */
export function isNetworkError(error: any): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return error.status === 0
  }
  return error?.message?.includes('fetch') || error?.message?.includes('network')
}

