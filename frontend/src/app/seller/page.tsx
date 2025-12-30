"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  Search,
} from "lucide-react";

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

// Tổng quan dashboard
interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  rating: number;
}

// Sản phẩm bán chạy
interface TopProduct {
  id: string;
  name: string;
  price: number;
  sold: number;
  image?: string;
}

// Đơn hàng gần đây
interface Order {
  id: string;
  customerName: string;
  productName: string;
  date: string;
  total: number;
  status: "PENDING" | "PAID" | "SHIPPING" | "CANCELLED";
}

/* =======================
   PAGE
   ======================= */

export default function SellerDashboardPage() {
  /* ===== STATE (EMPTY – WAIT BACKEND) ===== */
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH DATA (BACKEND)
     ======================= */
  useEffect(() => {
    // TODO: Kết nối backend tại đây
    // Ví dụ:
    // GET /api/seller/dashboard/overview
    // GET /api/seller/dashboard/top-products
    // GET /api/seller/dashboard/orders

    setLoading(true);

    /*
    Promise.all([
      getDashboardOverview(),
      getTopProducts(),
      getRecentOrders(),
    ])
      .then(([overviewRes, topProductsRes, ordersRes]) => {
        setOverview(overviewRes);
        setTopProducts(topProductsRes);
        setOrders(ordersRes);
      })
      .finally(() => setLoading(false));
    */

    setLoading(false);
  }, []);

  /* =======================
     UI
     ======================= */

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Xin chào, <span className="text-green-600">GreenTech Solutions 👋</span>
        </h1>
        <p className="text-sm text-gray-500">
          Đây là báo cáo hoạt động kinh doanh của bạn hôm nay.
        </p>
      </div>

      {/* ===== OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tổng doanh thu"
          value={overview?.totalRevenue}
          icon={<DollarSign />}
          suffix="₫"
        />
        <StatCard
          title="Đơn hàng mới"
          value={overview?.totalOrders}
          icon={<ShoppingCart />}
        />
        <StatCard
          title="Sản phẩm đang bán"
          value={overview?.totalProducts}
          icon={<Package />}
        />
        <StatCard
          title="Đánh giá trung bình"
          value={overview?.rating}
          icon={<Star />}
        />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== CHART ===== */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5">
          <h2 className="font-semibold mb-4">Biểu đồ Doanh thu</h2>

          {/* TODO:
              - Tích hợp chart library (Recharts / Chart.js)
              - Backend trả về dữ liệu theo ngày / tuần
          */}
          <div className="h-[220px] flex items-center justify-center text-gray-400 border rounded-lg">
            Chưa có dữ liệu biểu đồ
          </div>
        </div>

        {/* ===== TOP PRODUCTS ===== */}
        <div className="bg-white rounded-xl p-5">
          <h2 className="font-semibold mb-4">Sản phẩm bán chạy</h2>

          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">
              Chưa có dữ liệu sản phẩm
            </p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{p.name}</span>
                  <span className="text-green-600 font-medium">
                    {p.price.toLocaleString()}₫
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ===== ORDERS TABLE ===== */}
      <div className="bg-white rounded-xl p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Đơn hàng gần đây</h2>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Tìm đơn hàng..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Ngày</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-400"
                >
                  Chưa có đơn hàng
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2">{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.productName}</td>
                  <td>{o.date}</td>
                  <td>{o.total.toLocaleString()}₫</td>
                  <td>
                    <StatusBadge status={o.status} />
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
  suffix,
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-semibold">
          {value !== undefined ? value.toLocaleString() : "--"}
          {suffix}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    SHIPPING: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${map[status]}`}
    >
      {status}
    </span>
  );
}
