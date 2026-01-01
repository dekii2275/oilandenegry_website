"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

/* =======================
   CONSTANTS & CONFIG
   ======================= */
const API_BASE_URL = "https://zenergy.cloud/api";

/* =======================
   TYPES
   ======================= */
interface CreateProductFormState {
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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State riêng để quản lý việc checkbox kho hàng có được bật hay không
  const [isStockManaged, setIsStockManaged] = useState(false);

  const [form, setForm] = useState<CreateProductFormState>({
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

  /* =======================
     HANDLERS
     ======================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Xử lý riêng cho input số để tránh lỗi số 0 ở đầu
    let newValue: any = value;
    if (type === "number") {
      // Nếu xóa hết thì để 0, ngược lại parse sang số
      newValue = value === "" ? 0 : Number(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleStockCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsStockManaged(checked);
    // Nếu bật quản lý kho -> set mặc định 10, tắt -> set về 0
    setForm(prev => ({ ...prev, stock: checked ? 10 : 0 }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(files)],
    }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* =======================
     CORE LOGIC
     ======================= */

  const uploadImageToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.detail || "Lỗi upload ảnh (Server Error)");
    }
    const data = await res.json();
    
    let imageUrl = data.url;
    if (imageUrl && imageUrl.startsWith("/")) {
        imageUrl = `https://zenergy.cloud${imageUrl}`;
    }
    return imageUrl;
  };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!form.name.trim()) return alert("Vui lòng nhập tên sản phẩm!");
    if (!form.categoryId) return alert("Vui lòng chọn danh mục!");
    if (form.price <= 0) return alert("Vui lòng nhập giá bán hợp lệ!");
    if (!form.unit.trim()) return alert("Vui lòng nhập đơn vị tính!");
    if (form.images.length === 0) return alert("Vui lòng chọn ít nhất 1 ảnh!");

    try {
      setLoading(true);

      // BƯỚC 1: UPLOAD ẢNH
      const imageUrls = await Promise.all(form.images.map(uploadImageToBackend));

      // BƯỚC 2: TẠO PRODUCT
      const productPayload = {
        name: form.name,
        description: form.description,
        category: form.categoryId,
        brand: form.brand,
        origin: "Vietnam",
        warranty: "12 Tháng",
        unit: form.unit,
        image_url: imageUrls[0],
        images: imageUrls,
        is_active: true,
        tags: ["NEW"],
        specifications: {}
      };

      const productRes = await fetch(`${API_BASE_URL}/seller/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productPayload),
      });

      if (!productRes.ok) {
        const errorData = await productRes.json().catch(() => ({}));
        throw new Error(errorData.detail || `Lỗi tạo sản phẩm: ${productRes.status}`);
      }
      
      const newProduct = await productRes.json();

      // BƯỚC 3: TẠO VARIANT (GIÁ & KHO)
      const variantPayload = {
        name: "Tiêu chuẩn",
        price: form.price,
        market_price: form.salePrice > 0 ? form.salePrice : null,
        stock: form.stock,
        sku: `PROD-${newProduct.id}-${Date.now()}`,
        is_active: true
      };

      const variantRes = await fetch(`${API_BASE_URL}/seller/products/${newProduct.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(variantPayload),
      });

      if (!variantRes.ok) {
         const errorData = await variantRes.json().catch(() => ({}));
         throw new Error(errorData.detail || "Lỗi cập nhật giá/kho");
      }

      // THÀNH CÔNG
      alert(`🎉 Đăng sản phẩm "${newProduct.name}" thành công!`);
      router.push("/seller/products");

    } catch (error: any) {
      console.error(error);
      // Hiển thị lỗi chi tiết ra màn hình
      alert(`❌ Đăng thất bại: ${error.message}`);
    } finally {
      setLoading(false); // Luôn tắt loading dù thành công hay thất bại
    }
  };

  /* =======================
     UI RENDER
     ======================= */
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="p-6 bg-[#F3FFF7] min-h-screen"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Đăng sản phẩm mới</h1>
          <p className="text-sm text-gray-500">Điền đầy đủ thông tin để đăng bán sản phẩm.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                </>
            ) : "Đăng ngay"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-gray-800">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Dầu ăn hướng dương 5L"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-32 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-gray-800">Hình ảnh sản phẩm</h2>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {form.images.map((file, idx) => (
                  <div key={idx} className="relative group border rounded-lg overflow-hidden h-24">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-500 cursor-pointer transition-all">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm font-medium">Kéo thả hoặc click để tải ảnh lên</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* CATEGORY */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-gray-800">Phân loại</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Danh mục <span className="text-red-500">*</span></label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
              >
                <option value="">- Chọn danh mục -</option>
                <option value="Dau-Mo">Dầu mỏ & Khí đốt</option>
                <option value="Nang-Luong">Năng lượng tái tạo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thương hiệu</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* PRICE */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-gray-800">Giá & Đơn vị</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Giá bán (VND) <span className="text-red-500">*</span></label>
              <input
                name="price"
                type="number"
                value={form.price === 0 ? "" : form.price} // Fix lỗi số 0 ở đầu
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-medium"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Giá niêm yết (Gốc)</label>
              <input
                name="salePrice"
                type="number"
                value={form.salePrice === 0 ? "" : form.salePrice} // Fix lỗi số 0 ở đầu
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Ví dụ: Cái, Hộp..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* STOCK */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Kho hàng</h2>
              <div className="flex items-center gap-2 cursor-pointer">
                 <input
                  type="checkbox"
                  id="stockCheck"
                  checked={isStockManaged}
                  onChange={handleStockCheckbox}
                  className="accent-green-600 w-4 h-4 cursor-pointer"
                 />
                 <label htmlFor="stockCheck" className="text-xs text-gray-500 cursor-pointer select-none">Quản lý kho</label>
              </div>
            </div>

            <input
              name="stock"
              type="number"
              value={form.stock === 0 ? "" : form.stock} // Fix lỗi số 0
              onChange={handleChange}
              placeholder={isStockManaged ? "Nhập số lượng..." : "Không giới hạn"}
              className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors ${
                  !isStockManaged 
                    ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed" 
                    : "bg-white border-gray-200 focus:outline-none focus:border-green-500"
              }`}
              disabled={!isStockManaged} // Chỉ disable khi checkbox tắt
            />
          </div>
        </div>
      </div>
    </form>
  );
}