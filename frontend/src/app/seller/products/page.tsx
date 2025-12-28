"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  price: number;
  salePrice: number;
  unit: string;
  stock: number;
  images: File[];
}

/* =======================
   PAGE
   ======================= */

export default function NewProductPage() {
  /* ===== FORM STATE ===== */
  const [form, setForm] = useState<CreateProductPayload>({
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    price: 0,
    salePrice: 0,
    unit: "",
    stock: 0,
    images: [],
  });

  const [loading, setLoading] = useState(false);

  /* =======================
     HANDLERS
     ======================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  setForm((prev) => ({
    ...prev,
    images: Array.from(files),
  }));
};

  const handleSubmit = async () => {
    setLoading(true);

    /* =======================
       TODO: BACKEND INTEGRATION
       ======================= */
    /*
      - POST /api/seller/products
      - Content-Type: multipart/form-data
      - Payload:
        - name
        - description
        - categoryId
        - brand
        - price
        - salePrice
        - unit
        - stock
        - images[]
    */

    setLoading(false);
  };

  /* =======================
     UI
     ======================= */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="p-6 bg-[#F3FFF7] min-h-screen"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Đăng sản phẩm mới</h1>
          <p className="text-sm text-gray-500">
            Điền đầy đủ thông tin để đăng bán sản phẩm của bạn.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            {loading ? "Đang đăng..." : "Đăng ngay"}
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== BASIC INFO ===== */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="font-semibold mb-4">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tên sản phẩm"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về thông số kỹ thuật, nguồn gốc và tính năng..."
                className="w-full border rounded-lg px-3 py-2 text-sm h-28"
                required
              />
            </div>
          </div>

          {/* ===== IMAGES ===== */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="font-semibold mb-4">Hình ảnh sản phẩm</h2>

            <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer">
              <Upload className="w-6 h-6 mb-2" />
              <p className="text-sm">Kéo thả hình ảnh vào đây</p>
              <p className="text-xs">hoặc chọn từ thiết bị</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {form.images.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Đã chọn {form.images.length} ảnh
              </p>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">
          {/* ===== CATEGORY ===== */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="font-semibold mb-4">Phân loại</h2>

            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoryId: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              required
            >
              <option value="">-- Chọn danh mục --</option>

              {/* TODO:
                  - GET /api/categories
                  - Map danh mục từ backend
              */}
            </select>

            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Thương hiệu"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* ===== PRICE ===== */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="font-semibold mb-4">Giá bán & Đơn vị</h2>

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Giá bán (VND)"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              required
            />

            <input
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handleChange}
              placeholder="Giá khuyến mãi"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Đơn vị (Cái, Bộ, Kg...)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* ===== STOCK ===== */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="font-semibold mb-4">Kho hàng</h2>

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="Số lượng tồn kho"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
