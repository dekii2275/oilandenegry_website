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
    DATA: `/market-data/`, 
    REFRESH_NOW: `/market-data/refresh-now`,
    PRICES: `/market-data/prices`,
    TRENDS: `/market-data/trends`
  },

  NEWS: {
    LIST: '/news/',  
    DETAIL: (id: string) => `/news/${id}`, 
    CRAWL_NOW: `/news/crawl-now`, 
  },

  CATEGORIES: {
    LIST: `/categories/`,            
    DETAIL: (id: number) => `/categories/${id}`, 
  },

  SUPPLIERS: {
    LIST: `/suppliers/`,            
    DETAIL: (id: number) => `/suppliers/${id}`, 
    VERIFIED: `/suppliers/verified`, 
  },

  PRODUCTS: {
    // 👇 QUAN TRỌNG: Sửa dòng này để hết lỗi 307
    LIST: `/products/`, // Xóa /api đầu, giữ / cuối
    DETAIL: (id: number) => `/products/${id}`,
    SEARCH: `/products/search`,
  },

  STORES: {
    LIST: `/stores/`,
    DETAIL: (id: number) => `/stores/${id}`,
  },

  CART: {
    GET: `/cart/`,
    ADD_ITEM: `/cart/items`,
    UPDATE_ITEM: (cartItemId: number) => `/cart/items/${cartItemId}`,
    DELETE_ITEM: (cartItemId: number) => `/cart/items/${cartItemId}`,
  },

  ORDERS: {
    PREVIEW: `/orders/preview`,
    CREATE: `/orders/`,
    DETAIL: (orderId: number) => `/orders/${orderId}`,
    CANCEL: (orderId: number) => `/orders/${orderId}/cancel`,
  },

  REVIEWS: {
    CREATE: `/reviews/`,
    BY_PRODUCT: (productId: number) => `/reviews/product/${productId}`,
  },

  ADMIN: {
    SELLERS_PENDING: `/admin/sellers/pending`,
    SELLER_DETAIL: (sellerId: number) => `/admin/sellers/${sellerId}`,
    APPROVE_SELLER: (sellerId: number) => `/admin/sellers/${sellerId}/approve`,
    REJECT_SELLER: (sellerId: number) => `/admin/sellers/${sellerId}/reject`,
  },

  SELLER: {
    PRODUCTS: `/seller/products`,
    PRODUCT_DETAIL: (productId: number) => `/seller/products/${productId}`,
    PRODUCT_VARIANTS: (productId: number) => `/seller/products/${productId}/variants`,
    ADD_VARIANT: (productId: number) => `/seller/products/${productId}/variants`,
    VARIANT_DETAIL: (variantId: number) => `/seller/variants/${variantId}`,
    ORDERS: `/seller/orders`,
    UPDATE_ORDER_STATUS: (orderId: number) => `/seller/orders/${orderId}/status`,
  },

  UPLOAD: {
    IMAGE: `/upload/image`,
  },
};