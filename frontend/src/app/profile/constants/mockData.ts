// frontend/src/app/profile/constants/mockData.ts
import { Order, PaymentMethod, Wallet, Device } from "../types";

export const MOCK_ORDERS: Order[] = [
  {
    id: "order_1",
    order_number: "#ORD-2024-001",
    created_at: "20/12/2024",
    status: "completed",
    total_amount: 1250000,
    items: "Xăng RON 95 (100 lít), Dầu nhớt Total 5W-30",
    payment_status: "paid",
  },
  {
    id: "order_2",
    order_number: "#ORD-2024-002",
    created_at: "21/12/2024",
    status: "shipping",
    total_amount: 850000,
    items: "Dầu Diesel (50 lít), Lọc gió ô tô",
    payment_status: "paid",
  },
  {
    id: "order_3",
    order_number: "#ORD-2024-003",
    created_at: "22/12/2024",
    status: "pending",
    total_amount: 500000,
    items: "Pin Lithium 48V-100Ah, Bộ sạc nhanh",
    payment_status: "pending",
  },
  {
    id: "order_4",
    order_number: "#ORD-2024-004",
    created_at: "23/12/2024",
    status: "confirmed",
    total_amount: 3200000,
    items: "Tấm pin năng lượng mặt trời 450W, Inverter 5KW",
    payment_status: "paid",
  },
  {
    id: "order_5",
    order_number: "#ORD-2024-005",
    created_at: "24/12/2024",
    status: "cancelled",
    total_amount: 750000,
    items: "Bình gas công nghiệp 45kg",
    payment_status: "refunded",
  },
];

export const generateMoreMockOrders = (): Order[] => {
  const statuses: Array<Order["status"]> = [
    "pending",
    "confirmed",
    "shipping",
    "completed",
    "cancelled",
  ];
  const items = [
    "Xăng RON 95",
    "Dầu nhớt Total 5W-30",
    "Dầu Diesel",
    "Lọc gió ô tô",
    "Pin Lithium",
    "Bộ sạc nhanh",
    "Tấm pin năng lượng mặt trời",
    "Inverter",
    "Bình gas công nghiệp",
    "Ắc quy xe điện",
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `order_${i + 6}`,
    order_number: `#ORD-2024-${String(i + 6).padStart(3, "0")}`,
    created_at: `${25 + Math.floor(i / 5)}/12/2024`,
    status: statuses[i % statuses.length],
    total_amount: 500000 + i * 100000,
    items: `${items[i % items.length]} (${10 + i * 2} ${
      i % 3 === 0 ? "lít" : "cái"
    })`,
    payment_status: i % 4 === 0 ? "pending" : "paid",
  }));
};

export const ALL_MOCK_ORDERS = [...MOCK_ORDERS, ...generateMoreMockOrders()];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card_1",
    type: "visa",
    last_four: "1234",
    expiry_month: 12,
    expiry_year: 26,
    is_default: true,
    is_active: true,
    card_holder_name: "NGUYEN VAN A",
    bank_name: "Vietcombank",
  },
  {
    id: "card_2",
    type: "mastercard",
    last_four: "5678",
    expiry_month: 8,
    expiry_year: 25,
    is_default: false,
    is_active: true,
    card_holder_name: "NGUYEN VAN A",
    bank_name: "Techcombank",
  },
  {
    id: "card_3",
    type: "visa",
    last_four: "9012",
    expiry_month: 5,
    expiry_year: 24,
    is_default: false,
    is_active: false,
    card_holder_name: "NGUYEN VAN A",
    bank_name: "TPBank",
  },
];

export const MOCK_WALLETS: Wallet[] = [
  {
    id: "wallet_1",
    name: "Ví MoMo",
    type: "momo",
    phone_number: "0912***678",
    is_linked: true,
    linked_at: "2024-11-15",
    balance: 2500000,
  },
  {
    id: "wallet_2",
    name: "ZaloPay",
    type: "zalopay",
    phone_number: "Chưa kết nối",
    is_linked: false,
  },
  {
    id: "wallet_3",
    name: "VNPay",
    type: "vnpay",
    phone_number: "0934***123",
    is_linked: true,
    linked_at: "2024-10-20",
    balance: 1800000,
  },
];

export const MOCK_DEVICES: Device[] = [
  {
    id: "device_1",
    name: "Windows 11 - Chrome",
    location: "Hà Nội, Việt Nam",
    last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    is_current: true,
    os: "Windows 11",
    browser: "Chrome 120",
    ip_address: "192.168.1.100",
  },
  {
    id: "device_2",
    name: "iPhone 13 - Safari",
    location: "TP. Hồ Chí Minh, Việt Nam",
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_current: false,
    os: "iOS 17",
    browser: "Safari",
    ip_address: "192.168.1.101",
  },
  {
    id: "device_3",
    name: "MacBook Pro - Firefox",
    location: "Đà Nẵng, Việt Nam",
    last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_current: false,
    os: "macOS Ventura",
    browser: "Firefox 121",
    ip_address: "192.168.1.102",
  },
];

export const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
] as const;

export const PROFILE_TABS = [
  { id: "info" as const, label: "Thông tin cá nhân", icon: "User" },
  { id: "orders" as const, label: "Đơn hàng của tôi", icon: "Package" },
  { id: "payment" as const, label: "Thiết lập thanh toán", icon: "CreditCard" },
  { id: "security" as const, label: "Bảo mật", icon: "Shield" },
] as const;

export const DEFAULT_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=user";

export const MOCK_USER_DATA = {
  full_name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone_number: "0912 345 678",
  birthday: "01/01/1995",
  addresses: [
    "123 Đường ABC, Quận 1, TP.HCM",
    "456 Đường XYZ, Quận 7, TP.HCM",
    "Chưa cập nhật",
  ],
};
