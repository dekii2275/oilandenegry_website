"use client";

import { useEffect, useState } from "react";
import { FileDown, Calendar } from "lucide-react";

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

type TimeRange = "DAY" | "WEEK" | "MONTH";

interface RevenueStats {
  totalRevenue: number;
  totalRevenueChange: number; // %
  netRevenue: number;
  netRevenueChange: number; // %
  avgOrderValue: number;
  avgOrderValueChange: number; // %
  conversionRate: number;
  conversionRateChange: number; // %
}

interface RevenueChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface RevenueByCategory {
  categoryName: string;
  percent: number;
  color: string;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  percent: number;
}

interface DailyRevenue {
  date: string;
  orders: number;
  revenue: number;
  refund: number;
  netRevenue: number;
}

/* =======================
   PAGE
   ======================= */

export default function RevenueAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("WEEK");

  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [chart, setChart] = useState<RevenueChartPoint[]>([]);
  const [byCategory, setByCategory] = useState<RevenueByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);

  useEffect(() => {
    /*
      TODO BACKEND:
      GET /api/seller/revenue/overview?range=
    */
  }, [range]);

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Phân tích Doanh thu</h1>
          <p className="text-sm text-gray-500">
            Thông tin chi tiết về hiệu quả kinh doanh và dòng tiền của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white border rounded-xl overflow-hidden">
            <RangeTab value="DAY" current={range} onChange={setRange}>
              Theo ngày
            </RangeTab>
            <RangeTab value="WEEK" current={range} onChange={setRange}>
              Theo tuần
            </RangeTab>
            <RangeTab value="MONTH" current={range} onChange={setRange}>
              Theo tháng
            </RangeTab>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-white text-sm">
            <Calendar className="w-4 h-4" />
            01 Th10 - 27 Th10
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm">
            <FileDown className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu"
          value={stats?.totalRevenue}
          suffix="đ"
          change={stats?.totalRevenueChange}
          iconBg="bg-green-100"
          icon="$"
        />
        <StatCard
          title="Doanh thu thuần"
          value={stats?.netRevenue}
          suffix="đ"
          change={stats?.netRevenueChange}
          iconBg="bg-blue-100"
          icon="📦"
        />
        <StatCard
          title="Giá trị đơn TB"
          value={stats?.avgOrderValue}
          suffix="đ"
          change={stats?.avgOrderValueChange}
          iconBg="bg-orange-100"
          icon="🧾"
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={stats?.conversionRate}
          suffix="%"
          change={stats?.conversionRateChange}
          iconBg="bg-purple-100"
          icon="%"
        />
      </div>

      {/* ===== CHART + DONUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART */}
        <div className="bg-white rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-semibold mb-1">Biểu đồ Doanh thu</h2>
          <p className="text-xs text-gray-400 mb-4">
            Tổng quan doanh thu trong 30 ngày qua
          </p>

          {chart.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="h-64 flex items-end gap-3">
              {chart.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex flex-col justify-end h-full">
                    <div
                      className="bg-green-200 rounded"
                      style={{ height: `${c.orders}%` }}
                    />
                    <div
                      className="bg-green-600 rounded mt-1"
                      style={{ height: `${c.revenue}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DONUT */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Doanh thu theo danh mục</h2>

          {byCategory.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="relative w-40 h-40 mx-auto rounded-full border-8 border-green-500 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-semibold">100%</p>
                  <p className="text-xs text-gray-400">TỔNG QUAN</p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {byCategory.map((c) => (
                  <li key={c.categoryName} className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      {c.categoryName}
                    </span>
                    <span>{c.percent}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP PRODUCTS */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Top sản phẩm đóng góp doanh thu</h2>
            <button className="text-green-600 text-sm">Xem tất cả</button>
          </div>

          {topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-4">
              {topProducts.map((p) => (
                <li key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p.name}</span>
                    <span>{p.revenue.toLocaleString()} đ</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded">
                    <div
                      className="h-2 bg-green-500 rounded"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DAILY TABLE */}
        <div className="bg-white rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">
            Chi tiết doanh thu gần đây
          </h2>

          {dailyRevenue.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b">
                <tr>
                  <th className="text-left py-2">Ngày</th>
                  <th>Số đơn</th>
                  <th>Tổng thu</th>
                  <th>Hoàn tiền</th>
                  <th className="text-green-600">Thực thu</th>
                </tr>
              </thead>
              <tbody>
                {dailyRevenue.map((d) => (
                  <tr key={d.date} className="border-b last:border-0">
                    <td className="py-2">{d.date}</td>
                    <td>{d.orders}</td>
                    <td>{d.revenue.toLocaleString()} đ</td>
                    <td className="text-red-500">
                      -{d.refund.toLocaleString()} đ
                    </td>
                    <td className="text-green-600 font-medium">
                      {d.netRevenue.toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================
   COMPONENTS
   ======================= */

function RangeTab({
  value,
  current,
  onChange,
  children,
}: {
  value: TimeRange;
  current: TimeRange;
  onChange: (v: TimeRange) => void;
  children: React.ReactNode;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onChange(value)}
      className={`px-4 py-2 text-sm ${
        active
          ? "bg-green-600 text-white"
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  title,
  value,
  suffix,
  change,
  iconBg,
  icon,
}: {
  title: string;
  value?: number;
  suffix?: string;
  change?: number;
  iconBg: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-2">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <span className="font-semibold">{icon}</span>
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">
        {value !== undefined ? value.toLocaleString() : "--"} {suffix}
      </p>
      {change !== undefined && (
        <p
          className={`text-xs ${
            change >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change}% so với tháng trước
        </p>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
      Chưa có dữ liệu
    </div>
  );
}
