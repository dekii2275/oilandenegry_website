/**
 * Common Constants
 */

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_PAGE = 1

// API timeouts (nếu cần)
export const API_TIMEOUT = 30000 // 30 seconds

// Cache keys (nếu sử dụng caching)
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  NEWS: 'news',
  SUPPLIERS: 'suppliers',
  MARKET_PRICES: 'market_prices',
} as const

