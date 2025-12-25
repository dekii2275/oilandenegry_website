// frontend/src/app/profile/components/Security/TwoFactorAuth.tsx
"use client";

import React, { useState } from "react";
import { Key } from "lucide-react";

interface TwoFactorAuthProps {
  isEnabled: boolean;
  useMockData: boolean;
  onToggle: () => void;
  onEnable: (code: string) => Promise<boolean> | void;
}

export default function TwoFactorAuth({
  isEnabled,
  useMockData,
  onToggle,
  onEnable,
}: TwoFactorAuthProps) {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");

  const handleEnable2FA = async () => {
    if (!code || code.length !== 6) {
      alert("Vui lòng nhập mã xác thực 6 số");
      return;
    }
    await onEnable(code);
    setShowModal(false);
    setCode("");
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#88D0B5] to-[#66B16A] rounded-2xl flex items-center justify-center text-white">
            <div className="text-xl">🔒</div>
          </div>
          <div>
            <h2 className="text-lg font-bold">Xác thực 2 lớp (2FA)</h2>
            <p className="text-sm text-gray-500">
              Thêm một lớp bảo mật bằng mã OTP gửi về điện thoại
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isEnabled
                ? "Đang bật - Tài khoản của bạn được bảo vệ tốt hơn"
                : "Chưa bật - Khuyến nghị bật để tăng cường bảo mật"}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={() => {
              if (!isEnabled) {
                setShowModal(true);
              } else {
                onToggle();
              }
            }}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#66B16A]"></div>
        </label>
      </div>

      {isEnabled && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-500 shrink-0 mt-0.5">✅</div>
            <div>
              <p className="text-sm font-medium text-green-800">
                2FA đang hoạt động
              </p>
              <p className="text-xs text-green-600 mt-1">
                Mỗi khi đăng nhập từ thiết bị mới, bạn sẽ nhận được mã xác thực
                qua SMS.
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-6 text-center">
              Thiết lập xác thực 2 lớp
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Key className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  {useMockData
                    ? "Mock: Quét mã QR bằng ứng dụng Google Authenticator"
                    : "Quét mã QR bằng ứng dụng Google Authenticator hoặc nhập mã bí mật"}
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {useMockData ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-xs text-gray-500">Mock QR Code</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Mã bí mật: ABC123XYZ
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-xs text-gray-500">
                        QR Code sẽ hiển thị ở đây
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-center">
                  Nhập mã xác thực 6 số từ ứng dụng
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Nhập mã 6 số từ ứng dụng xác thực của bạn
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEnable2FA}
                  className="flex-1 bg-[#88D0B5] text-white py-3 rounded-lg font-bold hover:bg-[#76b9a1] transition"
                >
                  {useMockData ? "Kích hoạt (Mock)" : "Kích hoạt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
