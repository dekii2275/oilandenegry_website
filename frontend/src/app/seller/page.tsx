"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  Search,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

/* =======================
   CONSTANTS
   ======================= */
// Đảm bảo URL này đúng với backend của bạn
const API_BASE_URL = "https://zenergy.cloud/api"; 
// Hoặc nếu chạy local backend: "http://localhost:8000/api"

/* =======================
   PAGE COMPONENT
   ======================= */

export default function SellerDashboardPage() {
  // State lưu dữ liệu thật
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Gọi API lấy danh sách đơn hàng
        const ordersRes = await fetch(`${API_BASE_URL}/seller/orders`);
        // Nếu API lỗi (401/403) thì cần xử lý đăng nhập lại, ở đây ta tạm bỏ qua check lỗi sâu
        const ordersData = await ordersRes.json();

        // 2. Gọi API lấy danh sách sản phẩm
        const productsRes = await fetch(`${API_BASE_URL}/seller/products`);
        const productsData = await productsRes.json();

        if (Array.isArray(ordersData) && Array.isArray(productsData)) {
          // Tính toán số liệu thống kê
          const totalRevenue = ordersData.reduce(
            (acc: number, order: any) => acc + (order.total || 0),
            0
          );

          setStats({
            revenue: totalRevenue,
            ordersCount: ordersData.length,
            productsCount: productsData.length,
          });

          // Lấy 5 đơn mới nhất
          setRecentOrders(ordersData.slice(0, 5));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tổng quan kinh doanh
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật tình hình bán hàng của cửa hàng bạn.
          </p>
        </div>
        <Link 
          href="/seller/products/new" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + Đăng sản phẩm
        </Link>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={loading ? "..." : stats.revenue}
          icon={<DollarSign size={24} />}
          color="bg-blue-50 text-blue-600"
          suffix="₫"
        />
        <StatCard
          title="Đơn hàng"
          value={loading ? "..." : stats.ordersCount}
          icon={<ShoppingCart size={24} />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Sản phẩm"
          value={loading ? "..." : stats.productsCount}
          icon={<Package size={24} />}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Đơn hàng gần đây</h2>
          <Link href="/seller/orders" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            Xem tất cả <ArrowUpRight size={14}/>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Ngày đặt</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Đang tải dữ liệu...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chưa có đơn hàng nào</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">#{order.order_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.customer_name || "Khách lẻ"}</div>
                      <div className="text-xs text-gray-400">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {order.total?.toLocaleString()}₫
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =======================
   SUB COMPONENTS
   ======================= */

function StatCard({ title, value, icon, color, suffix = "" }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PLACED: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPING: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const labels: any = {
    PLACED: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}