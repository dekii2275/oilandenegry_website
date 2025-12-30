"use client";

import {
  Bell,
  Search,
  Download,
  Filter,
  Calendar,
} from "lucide-react";

/**
 * =====================================
 * ADMIN - QUẢN LÝ ĐƠN HÀNG
 * =====================================
 *
 * 🔹 Frontend only
 * 🔹 Không xử lý logic
 * 🔹 Backend gắn:
 *    - danh sách đơn hàng
 *    - filter (status, date, seller, region)
 *    - xuất excel
 *    - phân trang
 */

export default function AdminOrdersPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Quản lý Đơn hàng</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Tìm đơn hàng..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 space-y-6">
        {/* ================= FILTER BAR ================= */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  placeholder="Tìm theo ID, khách hàng..."
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <button className="border px-3 py-2 rounded-lg text-sm">
                Tất cả trạng thái
              </button>

              <button className="border px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                <Filter size={14} />
                Bộ lọc nâng cao
              </button>
            </div>

            <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm">
              <Download size={16} />
              Xuất Excel
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500">Khoảng thời gian</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="date"
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Nhà bán hàng</label>
              <select className="w-full border px-3 py-2 rounded-lg text-sm">
                <option>Tất cả nhà bán hàng</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Khu vực</label>
              <select className="w-full border px-3 py-2 rounded-lg text-sm">
                <option>Toàn quốc</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm">
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* ================= ORDER LIST ================= */}
        <div className="bg-white rounded-xl">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold">
              Danh sách đơn hàng tổng
              <span className="text-sm text-gray-500 ml-2">
                1,482
                {/* TODO: backend -> total orders */}
              </span>
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="text-gray-500 bg-gray-50">
              <tr>
                <th className="py-3 px-4">
                  <input type="checkbox" />
                </th>
                <th className="text-left py-3">ID Đơn hàng</th>
                <th className="text-left py-3">Khách hàng</th>
                <th className="text-left py-3">Nhà bán hàng</th>
                <th className="text-left py-3">Ngày đặt</th>
                <th className="text-left py-3">Tổng tiền</th>
                <th className="text-left py-3">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <OrderRow
                id="#ORD-2849"
                customer="PetroVietnam"
                seller="Energy Source Co."
                date="24/10/2023"
                time="14:30"
                total="125.000.000 đ"
                status="pending"
              />
              <OrderRow
                id="#ORD-2848"
                customer="Green Energy Corp"
                seller="SolarTech Vietnam"
                date="23/10/2023"
                time="09:15"
                total="84.500.000 đ"
                status="completed"
              />
              <OrderRow
                id="#ORD-2847"
                customer="Logistic Fast"
                seller="Dầu Khí Miền Đông"
                date="22/10/2023"
                time="11:00"
                total="12.200.000 đ"
                status="processing"
              />
              <OrderRow
                id="#ORD-2846"
                customer="Eco Farm"
                seller="WindPower Solutions"
                date="21/10/2023"
                time="16:45"
                total="450.000.000 đ"
                status="cancelled"
              />
              <OrderRow
                id="#ORD-2845"
                customer="Hưng Phát Steel"
                seller="Coal Mining Group"
                date="20/10/2023"
                time="08:00"
                total="62.100.000 đ"
                status="pending"
              />
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 text-sm text-gray-500">
            <span>
              Hiển thị 1 đến 5 trong tổng số <b>1,482</b> đơn hàng
            </span>

            <div className="flex gap-2">
              <button className="border px-3 py-1 rounded-lg">‹</button>
              <button className="bg-green-500 text-white px-3 py-1 rounded-lg">
                1
              </button>
              <button className="border px-3 py-1 rounded-lg">2</button>
              <button className="border px-3 py-1 rounded-lg">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function OrderRow({
  id,
  customer,
  seller,
  date,
  time,
  total,
  status,
}: {
  id: string;
  customer: string;
  seller: string;
  date: string;
  time: string;
  total: string;
  status: "pending" | "completed" | "processing" | "cancelled";
}) {
  const statusMap = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-600",
    processing: "bg-blue-100 text-blue-600",
    cancelled: "bg-red-100 text-red-500",
  };

  const statusLabel = {
    pending: "Chờ xử lý",
    completed: "Hoàn thành",
    processing: "Đang giao",
    cancelled: "Đã huỷ",
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="px-4">
        <input type="checkbox" />
      </td>

      <td className="font-medium text-green-600">{id}</td>

      <td>
        <p>{customer}</p>
      </td>

      <td>{seller}</td>

      <td>
        <p>{date}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </td>

      <td className="font-medium">{total}</td>

      <td>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            statusMap[status]
          }`}
        >
          {statusLabel[status]}
        </span>
      </td>
    </tr>
  );
}
