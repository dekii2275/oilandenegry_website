"use client";

import { Bell, Plus, Search, Filter } from "lucide-react";

/**
 * ====================================
 * ADMIN - QUẢN LÝ NHÀ BÁN HÀNG
 * ====================================
 *
 * 🔹 Frontend only
 * 🔹 Không mock logic xử lý
 * 🔹 Backend sẽ gắn:
 *    - danh sách seller
 *    - trạng thái duyệt
 *    - tìm kiếm / filter
 *    - approve / reject
 */

export default function AdminSellersPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg">Quản lý Nhà bán hàng</h1>
          <p className="text-sm text-gray-500">
            Quản lý đối tác và phê duyệt đăng ký mới
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
            <Plus size={16} />
            Thêm mới
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 space-y-6">
        {/* ================= PENDING SELLERS ================= */}
        <section className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <span className="bg-orange-100 p-2 rounded-lg">📦</span>
                Hàng chờ duyệt Nhà bán hàng
              </h2>
              <p className="text-sm text-gray-500">
                3 hồ sơ đang chờ phê duyệt
                {/* TODO: backend -> số hồ sơ pending */}
              </p>
            </div>

            <span className="text-sm text-orange-600 cursor-pointer">
              Xem tất cả
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <PendingSellerCard
              name="SolarTech VN"
              gpkd="0101234567"
              email="contact@solartech.vn"
            />
            <PendingSellerCard
              name="Green Petro"
              gpkd="0309876543"
              email="info@greenpetro.com"
            />
            <PendingSellerCard
              name="Eco Light Solutions"
              gpkd="0456123789"
              email="sales@ecolight.vn"
            />
          </div>
        </section>

        {/* ================= SELLER LIST ================= */}
        <section className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Danh sách Nhà bán hàng</h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  placeholder="Tìm tên, email..."
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
                {/* TODO: backend -> search */}
              </div>

              {/* Filter */}
              <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm">
                Tất cả trạng thái
              </button>

              <button className="border p-2 rounded-lg">
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-3">Tên nhà bán hàng</th>
                <th className="text-left py-3">Thông tin liên hệ</th>
                <th className="text-left py-3">Sản phẩm đang bán</th>
                <th className="text-left py-3">Ngày tham gia</th>
                <th className="text-left py-3">Trạng thái</th>
                <th className="text-left py-3">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <SellerRow
                name="Công ty Năng lượng Việt"
                email="contact@nlv.vn"
                phone="0987 654 321"
                products="12 sản phẩm"
                date="12/05/2023"
                status="active"
              />
              <SellerRow
                name="Mặt Trời Xanh Corp"
                email="info@mattroixanh.com"
                phone="0912 345 678"
                products="45 sản phẩm"
                date="20/08/2023"
                status="active"
              />
              <SellerRow
                name="Đại lý Xăng dầu Hùng Cường"
                email="hungcuong@petro.vn"
                phone="0909 000 111"
                products="0 sản phẩm"
                date="01/01/2023"
                status="blocked"
              />
              <SellerRow
                name="EVN Services Miền Nam"
                email="service@evn-mn.vn"
                phone="028 3822 4567"
                products="8 sản phẩm"
                date="15/11/2023"
                status="active"
              />
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function PendingSellerCard({
  name,
  gpkd,
  email,
}: {
  name: string;
  gpkd: string;
  email: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
            {name[0]}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-gray-500">Đăng ký: 2 giờ trước</p>
            {/* TODO: backend -> time */}
          </div>
        </div>

        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
          Chờ duyệt
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>GPKD: {gpkd}</p>
        <p>Email: {email}</p>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm">
          Chấp thuận
          {/* TODO: backend -> approve */}
        </button>
        <button className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-sm">
          Từ chối
          {/* TODO: backend -> reject */}
        </button>
      </div>
    </div>
  );
}

function SellerRow({
  name,
  email,
  phone,
  products,
  date,
  status,
}: {
  name: string;
  email: string;
  phone: string;
  products: string;
  date: string;
  status: "active" | "blocked";
}) {
  return (
    <tr className="border-t">
      <td className="py-4">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500">ID: #SL-1001</p>
        {/* TODO: backend -> seller ID */}
      </td>

      <td>
        <p>{email}</p>
        <p className="text-xs text-gray-500">{phone}</p>
      </td>

      <td>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {products}
        </span>
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

      <td>
        <button className="text-gray-400 hover:text-gray-600">
          •••
          {/* TODO: backend -> dropdown action */}
        </button>
      </td>
    </tr>
  );
}
