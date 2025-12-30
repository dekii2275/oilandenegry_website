"use client";

import { useEffect, useState } from "react";
import { Search, Filter, FileDown } from "lucide-react";

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

type OrderStatus =
  | "NEW"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string;
  productName: string;
  total: number;
  paymentMethod?: string;
  status: OrderStatus;
  createdAt: string;
}

interface OrderStats {
  new: number;
  processing: number;
  shipping: number;
  completed: number;
}

/* =======================
   PAGE
   ======================= */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    setLoading(true);

    /*
      TODO BACKEND:
      - GET /api/seller/orders
      - GET /api/seller/orders/stats
    */

    setLoading(false);
  }, [keyword, status]);

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500">
            Xem và quản lý tất cả các đơn đặt hàng của khách hàng.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
          <FileDown className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Đơn mới" value={stats?.new} icon={<OrderNewIcon />} />
        <StatCard
          title="Đang xử lý"
          value={stats?.processing}
          icon={<OrderProcessingIcon />}
        />
        <StatCard
          title="Đang giao"
          value={stats?.shipping}
          icon={<OrderShippingIcon />}
        />
        <StatCard
          title="Hoàn thành"
          value={stats?.completed}
          icon={<OrderCompletedIcon />}
        />
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="bg-white rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã đơn, tên KH, SĐT..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as OrderStatus | "ALL")
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="NEW">Đơn mới</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm">
          <Filter className="w-4 h-4" />
          Bộ lọc nâng cao
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  Chưa có đơn hàng
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b last:border-b-0">
                  <td className="py-3 font-medium text-green-600">
                    {o.code}
                  </td>
                  <td>
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-gray-400">
                      {o.customerPhone}
                    </div>
                  </td>
                  <td>{o.productName}</td>
                  <td className="font-medium">
                    {o.total.toLocaleString()}₫
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="text-right">
                    <button className="text-xs px-3 py-1 border rounded-lg">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =======================
   COMPONENTS
   ======================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4">
      <div>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold">
          {value !== undefined ? value.toLocaleString() : "--"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    NEW: "bg-blue-100 text-blue-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-orange-100 text-orange-700",
    SHIPPING: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const label: Record<OrderStatus, string> = {
    NEW: "Mới",
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

/* =======================
   SVG ICONS
   ======================= */

function OrderNewIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="20" fill="#EFF6FF"/>
<path d="M16.6 30.5L14.7 27.3L11.1 26.5L11.45 22.8L9 20L11.45 17.2L11.1 13.5L14.7 12.7L16.6 9.5L20 10.95L23.4 9.5L25.3 12.7L28.9 13.5L28.55 17.2L31 20L28.55 22.8L28.9 26.5L25.3 27.3L23.4 30.5L20 29.05L16.6 30.5ZM17.45 27.95L20 26.85L22.6 27.95L24 25.55L26.75 24.9L26.5 22.1L28.35 20L26.5 17.85L26.75 15.05L24 14.45L22.55 12.05L20 13.15L17.4 12.05L16 14.45L13.25 15.05L13.5 17.85L11.65 20L13.5 22.1L13.25 24.95L16 25.55L17.45 27.95ZM18.95 23.55L24.6 17.9L23.2 16.45L18.95 20.7L16.8 18.6L15.4 20L18.95 23.55Z" fill="#2563EB"/>
</svg>

  );
}

function OrderProcessingIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="20" fill="#FEFCE8" />
      <path d="M25 30C23.6167 30 22.4375 29.5125 21.4625 28.5375C20.4875 27.5625 20 26.3833 20 25Z" fill="#CA8A04"/>
    </svg>
  );
}

function OrderShippingIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="20" fill="#FAF5FF"/>
<path d="M14 28C13.1667 28 12.4583 27.7083 11.875 27.125C11.2917 26.5417 11 25.8333 11 25H9V14C9 13.45 9.19583 12.9792 9.5875 12.5875C9.97917 12.1958 10.45 12 11 12H25V16H28L31 20V25H29C29 25.8333 28.7083 26.5417 28.125 27.125C27.5417 27.7083 26.8333 28 26 28C25.1667 28 24.4583 27.7083 23.875 27.125C23.2917 26.5417 23 25.8333 23 25H17C17 25.8333 16.7083 26.5417 16.125 27.125C15.5417 27.7083 14.8333 28 14 28ZM14 26C14.2833 26 14.5208 25.9042 14.7125 25.7125C14.9042 25.5208 15 25.2833 15 25C15 24.7167 14.9042 24.4792 14.7125 24.2875C14.5208 24.0958 14.2833 24 14 24C13.7167 24 13.4792 24.0958 13.2875 24.2875C13.0958 24.4792 13 24.7167 13 25C13 25.2833 13.0958 25.5208 13.2875 25.7125C13.4792 25.9042 13.7167 26 14 26ZM11 23H11.8C12.0833 22.7 12.4083 22.4583 12.775 22.275C13.1417 22.0917 13.55 22 14 22C14.45 22 14.8583 22.0917 15.225 22.275C15.5917 22.4583 15.9167 22.7 16.2 23H23V14H11V23ZM26 26C26.2833 26 26.5208 25.9042 26.7125 25.7125C26.9042 25.5208 27 25.2833 27 25C27 24.7167 26.9042 24.4792 26.7125 24.2875C26.5208 24.0958 26.2833 24 26 24C25.7167 24 25.4792 24.0958 25.2875 24.2875C25.0958 24.4792 25 24.7167 25 25C25 25.2833 25.0958 25.5208 25.2875 25.7125C25.4792 25.9042 25.7167 26 26 26ZM25 21H29.25L27 18H25V21Z" fill="#9333EA"/>
</svg>
  );
}

function OrderCompletedIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="20" fill="#F0FDF4"/>
<path d="M18.6 24.6L25.65 17.55L24.25 16.15L18.6 21.8L15.75 18.95L14.35 20.35L18.6 24.6ZM20 30C18.6167 30 17.3167 29.7375 16.1 29.2125C14.8833 28.6875 13.825 27.975 12.925 27.075C12.025 26.175 11.3125 25.1167 10.7875 23.9C10.2625 22.6833 10 21.3833 10 20C10 18.6167 10.2625 17.3167 10.7875 16.1C11.3125 14.8833 12.025 13.825 12.925 12.925C13.825 12.025 14.8833 11.3125 16.1 10.7875C17.3167 10.2625 18.6167 10 20 10C21.3833 10 22.6833 10.2625 23.9 10.7875C25.1167 11.3125 26.175 12.025 27.075 12.925C27.975 13.825 28.6875 14.8833 29.2125 16.1C29.7375 17.3167 30 18.6167 30 20C30 21.3833 29.7375 22.6833 29.2125 23.9C28.6875 25.1167 27.975 26.175 27.075 27.075C26.175 27.975 25.1167 28.6875 23.9 29.2125C22.6833 29.7375 21.3833 30 20 30ZM20 28C22.2333 28 24.125 27.225 25.675 25.675C27.225 24.125 28 22.2333 28 20C28 17.7667 27.225 15.875 25.675 14.325C24.125 12.775 22.2333 12 20 12C17.7667 12 15.875 12.775 14.325 14.325C12.775 15.875 12 17.7667 12 20C12 22.2333 12.775 24.125 14.325 25.675C15.875 27.225 17.7667 28 20 28Z" fill="#16A34A"/>
</svg>

  );
}
