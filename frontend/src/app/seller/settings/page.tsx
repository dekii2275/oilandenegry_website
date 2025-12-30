"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

/* =======================
   TYPES
   ======================= */

interface SellerSettings {
  storeName: string;
  storeDescription: string;
  email: string;
  phone: string;
  address: string;
  returnPolicy: string;
  shippingInfo: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
}

/* =======================
   PAGE
   ======================= */

export default function SellerSettingsPage() {
  const [settings, setSettings] = useState<SellerSettings>({
    storeName: "Z-Energy Store",
    storeDescription: "Cửa hàng bán lẻ năng lượng tái tạo",
    email: "contact@zenergystore.com",
    phone: "0123456789",
    address: "123 Đường XYZ, Thành phố ABC",
    returnPolicy: "Chấp nhận hoàn trả trong 30 ngày",
    shippingInfo: "Miễn phí vận chuyển cho đơn hàng trên 500k",
    bankAccount: "1234567890",
    bankName: "Ngân hàng ABC",
    accountHolder: "Tên chủ tài khoản",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Gửi dữ liệu tới backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage({
        type: "success",
        text: "Cài đặt đã được lưu thành công!",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi lưu cài đặt.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt cửa hàng</h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin cửa hàng và cài đặt kinh doanh của bạn
        </p>
      </div>

      {/* ===== MESSAGE ===== */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      {/* ===== FORM ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Thông tin cửa hàng */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin cửa hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên cửa hàng
              </label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email liên hệ
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả cửa hàng
              </label>
              <textarea
                name="storeDescription"
                value={settings.storeDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Chính sách kinh doanh */}
        <section className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chính sách kinh doanh
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chính sách hoàn trả
              </label>
              <textarea
                name="returnPolicy"
                value={settings.returnPolicy}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin vận chuyển
              </label>
              <textarea
                name="shippingInfo"
                value={settings.shippingInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Thông tin tài khoản ngân hàng */}
        <section className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin ngân hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên ngân hàng
              </label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                name="accountHolder"
                value={settings.accountHolder}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tài khoản
              </label>
              <input
                type="text"
                name="bankAccount"
                value={settings.bankAccount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* ===== BUTTON ===== */}
        <div className="border-t pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
