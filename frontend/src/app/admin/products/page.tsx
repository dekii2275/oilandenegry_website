"use client";

import {
  Bell,
  Search,
  Plus,
  Filter,
  EyeOff,
  Trash2,
} from "lucide-react";

/**
 * =========================================
 * ADMIN - QUẢN LÝ SẢN PHẨM & DANH MỤC
 * =========================================
 *
 * 🔹 Frontend only
 * 🔹 Không mock logic xử lý
 * 🔹 Backend gắn:
 *    - danh mục + thứ tự
 *    - danh sách sản phẩm
 *    - filter, search, pagination
 *    - duyệt / ẩn / xoá sản phẩm
 */

export default function AdminProductsPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">
          Quản lý Sản phẩm & Danh mục
        </h1>

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
      <div className="p-6 space-y-6">
        {/* ================= CATEGORY MANAGER ================= */}
        <section className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Quản lý Danh mục</h2>
              <p className="text-sm text-gray-500">
                Kéo thả để sắp xếp thứ tự hiển thị
              </p>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Tìm danh mục..."
                className="border px-3 py-2 rounded-lg text-sm"
              />
              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                <Plus size={16} />
                Thêm mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <CategoryCard name="Xăng & Nhiên liệu" count="42 sản phẩm" />
            <CategoryCard name="Dầu Diesel" count="18 sản phẩm" />
            <CategoryCard name="Năng lượng mặt trời" count="64 sản phẩm" />
            <CategoryCard name="Điện gió" count="12 sản phẩm" />
            <CategoryCard name="Dịch vụ & Bảo trì" count="8 dịch vụ" />

            <div className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 cursor-pointer">
              + Tạo danh mục nhanh
            </div>
          </div>
        </section>

        {/* ================= PRODUCT LIST ================= */}
        <section className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Danh sách sản phẩm tổng</h2>

            <div className="flex gap-2">
              <button className="border px-3 py-2 rounded-lg text-sm">
                Tất cả danh mục
              </button>
              <button className="border px-3 py-2 rounded-lg text-sm">
                Tất cả trạng thái
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  placeholder="Tìm tên sản phẩm, SKU..."
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <button className="border p-2 rounded-lg">
                <Filter size={16} />
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-2">Tên sản phẩm</th>
                <th className="text-left py-2">Nhà bán hàng</th>
                <th className="text-left py-2">Danh mục</th>
                <th className="text-left py-2">Giá bán</th>
                <th className="text-left py-2">Trạng thái</th>
                <th className="text-left py-2">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <ProductRow
                name="Tấm pin năng lượng mặt trời"
                sku="SOL-450-M"
                seller="Green Energy Corp"
                category="Năng lượng mặt trời"
                price="2.850.000 đ"
                status="approved"
              />

              <ProductRow
                name="Dầu Diesel DO 0.05S"
                sku="DIE-200L-05"
                seller="PetroVietnam"
                category="Dầu Diesel"
                price="4.200.000 đ"
                status="pending"
              />

              <ProductRow
                name="Bình khí gas công nghiệp"
                sku="GAS-IND-45"
                seller="Gas Saigon"
                category="Xăng & Nhiên liệu"
                price="1.150.000 đ"
                status="approved"
              />

              <ProductRow
                name="Tua bin gió trục ngang"
                sku="WIND-KW-H"
                seller="Eco Tech Solutions"
                category="Điện gió"
                price="12.500.000 đ"
                status="approved"
              />

              <ProductRow
                name="Gói bảo trì hệ thống"
                sku="SERV-MAINT-1Y"
                seller="Green Energy Corp"
                category="Dịch vụ & Bảo trì"
                price="5.000.000 đ"
                status="pending"
              />
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function CategoryCard({
  name,
  count,
}: {
  name: string;
  count: string;
}) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 cursor-move">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-gray-500">{count}</p>
    </div>
  );
}

function ProductRow({
  name,
  sku,
  seller,
  category,
  price,
  status,
}: {
  name: string;
  sku: string;
  seller: string;
  category: string;
  price: string;
  status: "approved" | "pending";
}) {
  return (
    <tr className="border-t">
      <td className="py-3">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500">SKU: {sku}</p>
      </td>

      <td>{seller}</td>

      <td>
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
          {category}
        </span>
      </td>

      <td className="font-medium">{price}</td>

      <td>
        {status === "approved" ? (
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            Đã duyệt
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            Chờ duyệt
          </span>
        )}
      </td>

      <td className="flex gap-2 py-3">
        {status === "pending" && (
          <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg">
            Duyệt ngay
          </button>
        )}
        <button className="text-gray-400 hover:text-gray-600">
          <EyeOff size={16} />
        </button>
        <button className="text-gray-400 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
