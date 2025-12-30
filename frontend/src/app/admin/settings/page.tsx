"use client";

import { Bell, Save, Lock, Mail, Globe, Database, Shield } from "lucide-react";

/**
 * =====================================
 * ADMIN - CÀI ĐẶT HỆ THỐNG
 * =====================================
 *
 * 🔹 Frontend only
 * 🔹 Backend sẽ gắn:
 *    - system settings
 *    - email config
 *    - payment gateway
 *    - backup/restore
 *    - security settings
 */

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Cài đặt hệ thống</h1>

        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* ================= GENERAL SETTINGS ================= */}
          <section className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold">Cài đặt chung</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên ứng dụng
                </label>
                <input
                  type="text"
                  defaultValue="Energy Admin"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả trang web
                </label>
                <textarea
                  defaultValue="Nền tảng quản lý bán hàng dầu khí, năng lượng tái tạo"
                  className="w-full border px-3 py-2 rounded-lg text-sm h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  defaultValue="/assets/images/logo.png"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>

              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                <Save size={16} />
                Lưu
              </button>
            </div>
          </section>

          {/* ================= EMAIL SETTINGS ================= */}
          <section className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Email SMTP</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    placeholder="587"
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email gửi đi
                  </label>
                  <input
                    type="email"
                    placeholder="noreply@energy.vn"
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                </div>
              </div>

              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                <Save size={16} />
                Lưu
              </button>
            </div>
          </section>

          {/* ================= SECURITY ================= */}
          <section className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold">Bảo mật</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xác thực hai yếu tố (2FA)</p>
                  <p className="text-xs text-gray-500">
                    Bảo vệ tài khoản admin
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Khóa IP</p>
                  <p className="text-xs text-gray-500">
                    Chỉ cho phép admin truy cập từ IP được phép
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thay đổi mật khẩu</p>
                  <p className="text-xs text-gray-500">
                    Cập nhật mật khẩu admin hệ thống
                  </p>
                </div>
                <button className="border px-4 py-2 rounded-lg text-sm">
                  Thay đổi
                </button>
              </div>

              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                <Save size={16} />
                Lưu
              </button>
            </div>
          </section>

          {/* ================= BACKUP ================= */}
          <section className="bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold">Sao lưu dữ liệu</h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Lần sao lưu cuối cùng: 2 giờ trước
              </p>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                  Sao lưu ngay
                </button>

                <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm">
                  Lịch sử sao lưu
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
