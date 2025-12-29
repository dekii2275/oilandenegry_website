export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `/auth/register`,
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    ME: `/auth/me`,
    FORGOT_PASSWORD: `/auth/forgot-password`,
    RESET_PASSWORD: `/auth/reset-password`,
    VERIFY_EMAIL: `/auth/verify`,
  },
  USERS: {
    PROFILE: `/users/me`,
  },
  MARKET: {
    DATA: `/market-data/`,
  },
  PRODUCTS: {
    LIST: `/products`,
    DETAIL: (id: number) => `/products/${id}`,
  },
  CATEGORIES: {
    LIST: `/categories`,
  },
  NEWS: {
    LIST: `/news`,
    DETAIL: (id: number) => `/news/${id}`,
  },
  SUPPLIERS: {
    LIST: `/suppliers`,
  },
}
