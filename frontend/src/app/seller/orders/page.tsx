"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  FileDown,
} from "lucide-react";

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
  /* ===== STATE (EMPTY) ===== */
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");

  /* =======================
     FETCH DATA – BACKEND
     ======================= */
  useEffect(() => {
    setLoading(true);

    /*
      TODO: BACKEND APIs

      - GET /api/seller/orders
        Params:
          - keyword
          - status
          - page
          - pageSize

      - GET /api/seller/orders/stats
    */

    setLoading(false);
  }, [keyword, status]);

  /* =======================
     UI
     ======================= */

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
        <StatCard title="Đơn mới" value={stats?.new} />
        <StatCard title="Đang xử lý" value={stats?.processing} />
        <StatCard title="Đang giao" value={stats?.shipping} />
        <StatCard title="Hoàn thành" value={stats?.completed} />
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
                <td
                  colSpan={6}
                  className="py-6 text-center text-gray-400"
                >
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
                  <td className="text-right space-x-2">
                    {/* TODO:
                        - Xác nhận đơn
                        - In phiếu
                        - Giao hàng
                        - Hoàn tất
                        - Xem chi tiết
                    */}
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
}: {
  title: string;
  value?: number;
}) {
  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-semibold">
        {value !== undefined ? value.toLocaleString() : "--"}
      </p>
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
