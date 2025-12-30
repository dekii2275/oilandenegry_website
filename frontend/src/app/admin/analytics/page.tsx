"use client";

import {
  Bell,
  Search,
  Download,
  FileText,
  Eye,
  ShoppingCart,
  DollarSign,
  Smile,
} from "lucide-react";

/**
 * ======================================
 * ADMIN - TRUNG TÂM PHÂN TÍCH DỮ LIỆU
 * ======================================
 *
 * 🔹 Frontend only
 * 🔹 Không mock logic
 * 🔹 Backend sẽ gắn:
 *    - KPI data
 *    - chart data
 *    - filter (date, category, user)
 *    - export PDF
 */

export default function AdminAnalyticsPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg">Trung tâm Phân tích Dữ liệu</h1>
          <p className="text-sm text-gray-500">
            Cập nhật lần cuối: 15 phút trước
            {/* TODO: backend -> last updated */}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Tìm kiếm báo cáo..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 space-y-6">
        {/* ================= FILTER BAR ================= */}
        <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <FilterButton label="30 ngày qua" />
            <FilterButton label="Tất cả danh mục" />
            <FilterButton label="Tất cả người dùng" />
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm">
              <Download size={16} />
              Xuất PDF
              {/* TODO: backend -> export */}
            </button>

            <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
              <FileText size={16} />
              Báo cáo chi tiết
            </button>
          </div>
        </div>

        {/* ================= KPI ================= */}
        <div className="grid grid-cols-4 gap-6">
          <KpiCard
            icon={<Eye className="text-blue-500" />}
            title="Lượt truy cập trang"
            value="2.4 triệu"
            sub="Trung bình 80k/ngày"
            change="+12.5%"
            positive
          />

          <KpiCard
            icon={<ShoppingCart className="text-green-500" />}
            title="Tỷ lệ chuyển đổi"
            value="3.85%"
            sub="Tăng 0.45% so với tháng trước"
            change="+8.2%"
            positive
          />

          <KpiCard
            icon={<DollarSign className="text-orange-500" />}
            title="Giá trị đơn trung bình"
            value="15.2 Triệu"
            sub="Doanh thu B2B"
            change="-2.1%"
          />

          <KpiCard
            icon={<Smile className="text-purple-500" />}
            title="Mức độ hài lòng"
            value="4.8/5.0"
            sub="Dựa trên 1,204 đánh giá"
            change="98%"
            positive
          />
        </div>

        {/* ================= CHART: REVENUE ================= */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold">
                Xu hướng Doanh thu & Đơn hàng
              </h2>
              <p className="text-sm text-gray-500">
                So sánh hiệu suất trong 12 tháng qua
              </p>
            </div>

            <div className="flex gap-4 text-sm">
              <Legend color="bg-green-500" label="Doanh thu" />
              <Legend color="bg-blue-400" label="Đơn hàng" />
            </div>
          </div>

          {/* TODO: backend -> chart data */}
          <div className="h-72 flex items-center justify-center text-gray-400">
            (Chart Doanh thu & Đơn hàng)
          </div>
        </div>

        {/* ================= LOWER SECTION ================= */}
        <div className="grid grid-cols-3 gap-6">
          {/* User growth */}
          <div className="col-span-2 bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Tăng trưởng người dùng</h2>
              <div className="flex gap-2">
                <Tab active>Biểu đồ đường</Tab>
                <Tab>Cột</Tab>
              </div>
            </div>

            {/* TODO: backend -> user growth chart */}
            <div className="h-60 flex items-center justify-center text-gray-400">
              (Chart tăng trưởng người dùng)
            </div>
          </div>

          {/* Traffic source */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Nguồn truy cập</h2>

            {/* TODO: backend -> traffic source */}
            <div className="h-60 flex items-center justify-center text-gray-400">
              (Pie chart nguồn truy cập)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FilterButton({ label }: { label: string }) {
  return (
    <button className="border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
      {label}
    </button>
  );
}

function KpiCard({
  icon,
  title,
  value,
  sub,
  change,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        {change && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              positive
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-gray-500">{label}</span>
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
