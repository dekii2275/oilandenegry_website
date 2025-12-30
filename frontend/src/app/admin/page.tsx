"use client";

import { Bell, Search } from "lucide-react";

/**
 * ================================
 * ADMIN DASHBOARD - OVERVIEW PAGE
 * ================================
 *
 * 🔹 Chỉ frontend
 * 🔹 Không dùng dữ liệu ảo
 * 🔹 Backend sẽ gắn API vào:
 *    - số liệu thống kê
 *    - danh sách hoạt động
 *    - đơn hàng
 */

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Tổng quan hệ thống</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Tìm kiếm..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Notification */}
          <button className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {/* TODO: backend -> số thông báo */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 space-y-6">
        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            title="Tổng doanh thu"
            value="34.2 tỷ VND"
            change="+12.5%"
            positive
          />

          <StatCard
            title="Tổng đơn hàng"
            value="1,482"
            change="+8.2%"
            positive
          />

          <StatCard
            title="Số người dùng mới"
            value="328"
            change="-2.1%"
          />

          <StatCard
            title="Nhà bán hàng chờ duyệt"
            value="15"
            linkText="Xem danh sách →"
          />
        </div>

        {/* ===== CHART + ACTIVITY ===== */}
        <div className="grid grid-cols-3 gap-6">
          {/* Chart */}
          <div className="col-span-2 bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Biểu đồ doanh thu</h2>
              <div className="flex gap-2 text-sm">
                <Tab active>Ngày</Tab>
                <Tab>Tuần</Tab>
                <Tab>Tháng</Tab>
              </div>
            </div>

            {/* TODO: backend -> chart data */}
            <div className="h-64 flex items-center justify-center text-gray-400">
              (Chart sẽ gắn backend sau)
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Hoạt động gần đây</h2>
              <span className="text-green-600 text-sm cursor-pointer">
                Xem tất cả
              </span>
            </div>

            {/* TODO: backend -> activity list */}
            <ul className="space-y-4 text-sm">
              <ActivityItem
                color="green"
                title="Đơn hàng mới #ORD-9821"
                desc="Vừa đặt bởi Công ty TNHH Hưng Phát"
              />
              <ActivityItem
                color="blue"
                title="Đăng ký nhà cung cấp mới"
                desc="SolarTech Vietnam đang chờ duyệt"
              />
              <ActivityItem
                color="orange"
                title="Yêu cầu hỗ trợ #TK-112"
                desc="Petro Logistics về vận chuyển"
              />
              <ActivityItem
                color="gray"
                title="Cập nhật hệ thống"
                desc="Bảo trì định kỳ hoàn tất"
              />
            </ul>
          </div>
        </div>

        {/* ===== LATEST ORDERS + REQUEST ===== */}
        <div className="grid grid-cols-3 gap-6">
          {/* Orders */}
          <div className="col-span-2 bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Đơn hàng mới nhất</h2>
              <button className="text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full">
                Quản lý đơn hàng
              </button>
            </div>

            {/* TODO: backend -> order list */}
            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left py-2">Mã đơn</th>
                  <th className="text-left py-2">Khách hàng</th>
                  <th className="text-left py-2">Sản phẩm</th>
                  <th className="text-left py-2">Tổng tiền</th>
                  <th className="text-left py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-3 font-medium">#ORD-2849</td>
                  <td>PetroVietnam</td>
                  <td>Dầu Diesel (5000L)</td>
                  <td>125.000.000 đ</td>
                  <td>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      Đang xử lý
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request */}
          <div className="bg-green-500 text-white rounded-xl p-6">
            <h2 className="font-semibold mb-1">Yêu cầu chờ duyệt</h2>
            <p className="text-sm text-green-100 mb-4">
              Các tác vụ cần xử lý ngay
            </p>

            {/* TODO: backend -> request */}
            <div className="bg-white/10 rounded-lg p-4 space-y-3">
              <div className="text-xs bg-white/20 inline-block px-2 py-1 rounded-full">
                Nhà bán hàng
              </div>

              <div className="font-medium">
                Duyệt hồ sơ công ty năng lượng Sông Đà
              </div>

              <div className="flex gap-2">
                <button className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm">
                  Chấp nhận
                </button>
                <button className="bg-green-600 border border-white/30 px-3 py-1 rounded-lg text-sm">
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  change,
  positive,
  linkText,
}: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  linkText?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>

      {change && (
        <p
          className={`text-sm mt-1 ${
            positive ? "text-green-600" : "text-red-500"
          }`}
        >
          {change} <span className="text-gray-400">so với tháng trước</span>
        </p>
      )}

      {linkText && (
        <p className="text-sm text-green-600 mt-2 cursor-pointer">
          {linkText}
        </p>
      )}
    </div>
  );
}

function Tab({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-3 py-1 rounded-full text-xs ${
        active
          ? "bg-green-100 text-green-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function ActivityItem({
  color,
  title,
  desc,
}: {
  color: "green" | "blue" | "orange" | "gray";
  title: string;
  desc: string;
}) {
  const dotColor = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  }[color];

  return (
    <li className="flex gap-3">
      <span className={`w-2 h-2 mt-2 rounded-full ${dotColor}`} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
    </li>
  );
}
