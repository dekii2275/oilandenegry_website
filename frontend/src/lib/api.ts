const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.212.128.129:8001/api';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify`,
  PROFILE: `${API_BASE_URL}/users/me`,
};

export default API_BASE_URL;