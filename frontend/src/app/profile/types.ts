// frontend/src/app/profile/types.ts
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  birthday: string;
  avatar_url: string;
  addresses: string[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  total_amount: number;
  items: string;
  payment_status: string;
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "momo" | "zalopay" | "bank_transfer";
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  is_active: boolean;
  phone_number?: string;
  bank_name?: string;
  card_holder_name?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: "momo" | "zalopay" | "vnpay";
  phone_number?: string;
  is_linked: boolean;
  linked_at?: string;
  balance?: number;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  last_active: string;
  is_current: boolean;
  os: string;
  browser: string;
  ip_address?: string;
}

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  minAmount: string;
  maxAmount: string;
  paymentStatus: string;
  sortBy: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
