const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.212.128.129:8001/api'

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/me`,
  },
  MARKET: {
    DATA: `${API_BASE_URL}/market-data/`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    DETAIL: (id: number) => `${API_BASE_URL}/products/${id}`,
  },
  CATEGORIES: {
    LIST: `${API_BASE_URL}/categories`,
  },
  NEWS: {
    LIST: `${API_BASE_URL}/news`,
    DETAIL: (id: number) => `${API_BASE_URL}/news/${id}`,
  },
  SUPPLIERS: {
    LIST: `${API_BASE_URL}/suppliers`,
  },
}

export default API_BASE_URL