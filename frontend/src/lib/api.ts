/**
 * API Endpoints Configuration
 * Centralized endpoint definitions để dễ dàng maintain và update
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.212.128.129:8001/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify',
    REFRESH_TOKEN: '/auth/refresh',
  },

  // Users
  USERS: {
    ME: '/users/me',
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: number | string) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: number | string) => `/categories/${id}`,
  },

  // News & Events
  NEWS: {
    LIST: '/news',
    DETAIL: (id: number | string) => `/news/${id}`,
    LATEST: '/news/latest',
  },

  // Suppliers
  SUPPLIERS: {
    LIST: '/suppliers',
    DETAIL: (id: number | string) => `/suppliers/${id}`,
    VERIFIED: '/suppliers/verified',
  },

  // Market Data
  MARKET: {
    PRICES: '/market-data/prices',
    TRENDS: '/market-data/trends',
  },

  // Cart
  CART: {
    LIST: '/cart',
    ADD: '/cart',
    UPDATE: (id: number | string) => `/cart/${id}`,
    DELETE: (id: number | string) => `/cart/${id}`,
    CLEAR: '/cart/clear',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: number | string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: number | string) => `/orders/${id}/cancel`,
  },

  // Addresses
  ADDRESSES: {
    LIST: '/users/addresses',
    CREATE: '/users/addresses',
    UPDATE: (id: number | string) => `/users/addresses/${id}`,
    DELETE: (id: number | string) => `/users/addresses/${id}`,
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    AVATAR: '/upload/avatar',
  },
} as const;

export default API_BASE_URL;
