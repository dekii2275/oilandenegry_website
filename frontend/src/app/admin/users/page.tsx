"use client";

import {
  Bell,
  Search,
  Plus,
  Download,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

/**
 * =====================================
 * ADMIN - QUẢN LÝ NGƯỜI DÙNG
 * =====================================
 *
 * 🔹 Frontend only
 * 🔹 Không mock logic
 * 🔹 Backend gắn:
 *    - thống kê user
 *    - danh sách user
 *    - tìm kiếm, filter, phân trang
 *    - duyệt / cấm / xuất excel
 */

export default function AdminUsersPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Quản lý Người dùng</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Tìm kiếm nhanh..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 grid grid-cols-12 gap-6">
        {/* ================= MAIN ================= */}
        <div className="col-span-9 space-y-6">
          {/* ===== STATS ===== */}
          <div className="grid grid-cols-4 gap-4">
            <StatBox title="Tổng người dùng" value="12,450" />
            <StatBox title="Khách hàng" value="11,820" highlight="green" />
            <StatBox title="Nhà bán hàng" value="630" highlight="blue" />
            <StatBox title="Bị cấm" value="42" highlight="red" />
          </div>

          {/* ===== TABLE CARD ===== */}
          <div className="bg-white rounded-xl p-5">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Tab active>Khách hàng</Tab>
                <Tab>Nhà bán hàng</Tab>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                  <Plus size={16} />
                  Thêm mới
                </button>

                <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm">
                  <Download size={16} />
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  placeholder="Tìm kiếm theo tên, email..."
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full"
                />
              </div>

              <button className="border px-3 py-2 rounded-lg text-sm">
                Tất cả trạng thái
              </button>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left py-2">Tên người dùng</th>
                  <th className="text-left py-2">Email / SĐT</th>
                  <th className="text-left py-2">Ngày tham gia</th>
                  <th className="text-left py-2">Trạng thái</th>
                  <th className="text-left py-2"></th>
                </tr>
              </thead>

              <tbody>
                <UserRow
                  name="Nguyễn Văn An"
                  email="an.nguyen@gmail.com"
                  phone="0912 345 678"
                  date="12/05/2023"
                  status="active"
                />
                <UserRow
                  name="Trần Thị Mai"
                  email="mai.tran@company.vn"
                  phone="0988 112 233"
                  date="15/05/2023"
                  status="active"
                />
                <UserRow
                  name="Lê Văn Hùng"
                  email="hung.le@spam.net"
                  phone="0909 000 111"
                  date="01/02/2023"
                  status="banned"
                />
                <UserRow
                  name="Phạm Thị Dung"
                  email="dung.pham@energy.com"
                  phone="0945 678 910"
                  date="20/05/2023"
                  status="active"
                />
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Hiển thị 1-4 trong 12,450 kết quả</span>

              <div className="flex gap-2">
                <button className="border px-3 py-1 rounded-lg">Trước</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded-lg">
                  1
                </button>
                <button className="border px-3 py-1 rounded-lg">2</button>
                <button className="border px-3 py-1 rounded-lg">Sau</button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="col-span-3 bg-white rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Hàng chờ duyệt
            <span className="text-xs bg-orange-100 text-orange-600 px-2 rounded-full">
              3 đơn
            </span>
          </h2>

          <PendingUserCard
            name="Cty Năng lượng Sông Đà"
            reason="Mở rộng thị trường Bắc, đã nộp đủ hồ sơ"
          />
          <PendingUserCard
            name="Petro Mekong Ltd"
            reason="Đăng ký bán xăng dầu"
          />
          <PendingUserCard
            name="WindTech Solution"
            reason="Thiếu giấy phép môi trường"
            warning
          />

          <button className="w-full border px-3 py-2 rounded-lg text-sm text-gray-600">
            Xem tất cả yêu cầu →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatBox({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: "green" | "blue" | "red";
}) {
  const color = {
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-500",
  }[highlight || ""];

  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
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
      className={`px-4 py-2 rounded-lg text-sm ${
        active
          ? "bg-green-100 text-green-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function UserRow({
  name,
  email,
  phone,
  date,
  status,
}: {
  name: string;
  email: string;
  phone: string;
  date: string;
  status: "active" | "banned";
}) {
  return (
    <tr className="border-t">
      <td className="py-3">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500">ID: #CUS-9812</p>
      </td>

      <td>
        <p>{email}</p>
        <p className="text-xs text-gray-500">{phone}</p>
      </td>

      <td>{date}</td>

      <td>
        {status === "active" ? (
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            Hoạt động
          </span>
        ) : (
          <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">
            Bị cấm
          </span>
        )}
      </td>

      <td className="text-right">
        <button className="text-gray-400 hover:text-gray-600">•••</button>
      </td>
    </tr>
  );
}

function PendingUserCard({
  name,
  reason,
  warning,
}: {
  name: string;
  reason: string;
  warning?: boolean;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <p className="font-medium">{name}</p>
      <p
        className={`text-xs ${
          warning ? "text-orange-600" : "text-gray-500"
        }`}
      >
        {reason}
      </p>

      <div className="flex gap-2">
        <button className="flex-1 bg-green-50 text-green-600 py-1 rounded text-xs">
          <Check size={14} className="inline mr-1" />
          Chấp thuận
        </button>
        <button className="flex-1 bg-red-50 text-red-500 py-1 rounded text-xs">
          <X size={14} className="inline mr-1" />
          Từ chối
        </button>
      </div>
    </div>
  );
}
