export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `/api/auth/register`,
    LOGIN: `/api/auth/login`,
    LOGOUT: `/api/auth/logout`,
    FORGOT_PASSWORD: `/api/auth/forgot-password`,
    RESET_PASSWORD: `/api/auth/reset-password`,
    VERIFY_EMAIL: `/api/auth/verify`,
  },

  USERS: {
    PROFILE: `/api/users/me`,
  },

  MARKET: {
    DATA: `/api/market-data/`,
    REFRESH_NOW: `/api/market-data/refresh-now`,
    PRICES: `/api/market-data/prices`,
    TRENDS: `/api/market-data/trends`,
  },

  NEWS: {
    LIST: `/api/news/`,
    DETAIL: (slug: string) => `/api/news/${slug}`,
    CRAWL_NOW: `/api/news/crawl-now`,
  },

  // --- ĐÃ SỬA: Đổi tên key cho khớp với Service ---
  CATEGORIES: {
    LIST: `/api/categories/`,           // Đã đổi từ GET_ALL -> LIST
    DETAIL: (id: number) => `/api/categories/${id}`, // Đã đổi từ GET_ONE -> DETAIL
  },

  // --- ĐÃ SỬA: Đổi tên key và thêm VERIFIED ---
  SUPPLIERS: {
    LIST: `/api/suppliers/`,            // Đã đổi từ GET_ALL -> LIST
    DETAIL: (id: number) => `/api/suppliers/${id}`, // Đã đổi từ GET_ONE -> DETAIL
    VERIFIED: `/api/suppliers/verified`, // <--- Đã thêm dòng này
  },

  PRODUCTS: {
    LIST: `/api/products/`,
    DETAIL: (id: number) => `/api/products/${id}`,
    SEARCH: `/api/products/search`,
  },

  STORES: {
    LIST: `/api/stores/`,
    DETAIL: (id: number) => `/api/stores/${id}`,
  },

  CART: {
    GET: `/api/cart/`,
    ADD_ITEM: `/api/cart/items`,
    UPDATE_ITEM: (cartItemId: number) => `/api/cart/items/${cartItemId}`,
    DELETE_ITEM: (cartItemId: number) => `/api/cart/items/${cartItemId}`,
  },

  ORDERS: {
    PREVIEW: `/api/orders/preview`,
    CREATE: `/api/orders/`,
    DETAIL: (orderId: number) => `/api/orders/${orderId}`,
    CANCEL: (orderId: number) => `/api/orders/${orderId}/cancel`,
  },

  REVIEWS: {
    CREATE: `/api/reviews/`,
    BY_PRODUCT: (productId: number) => `/api/reviews/product/${productId}`,
  },

  ADMIN: {
    SELLERS_PENDING: `/api/admin/sellers/pending`,
    SELLER_DETAIL: (sellerId: number) => `/api/admin/sellers/${sellerId}`,
    APPROVE_SELLER: (sellerId: number) => `/api/admin/sellers/${sellerId}/approve`,
    REJECT_SELLER: (sellerId: number) => `/api/admin/sellers/${sellerId}/reject`,
  },

  SELLER: {
    PRODUCTS: `/api/seller/products`,
    PRODUCT_DETAIL: (productId: number) => `/api/seller/products/${productId}`,
    PRODUCT_VARIANTS: (productId: number) => `/api/seller/products/${productId}/variants`,
    ADD_VARIANT: (productId: number) => `/api/seller/products/${productId}/variants`,
    VARIANT_DETAIL: (variantId: number) => `/api/seller/variants/${variantId}`,
    ORDERS: `/api/seller/orders`,
    UPDATE_ORDER_STATUS: (orderId: number) => `/api/seller/orders/${orderId}/status`,
  },

  UPLOAD: {
    IMAGE: `/api/upload/image`,
  },
};