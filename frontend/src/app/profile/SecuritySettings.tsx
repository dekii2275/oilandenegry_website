// frontend/src/app/profile/SecuritySettings.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Monitor, LogOut, Shield } from "lucide-react";
import { MOCK_DEVICES } from "./constants/mockData";
import PasswordForm from "./components/Security/PasswordForm";
import DeviceItem from "./components/Security/DeviceItem";
import TwoFactorAuth from "./components/Security/TwoFactorAuth";

export default function SecuritySettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === "http://localhost:8000") {
      setUseMockData(true);
    }
  }, []);

  const handleChangePassword = async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<boolean> => {
    // Thêm return type Promise<boolean>
    try {
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert("Đổi mật khẩu thành công (Mock Data)");
        return true; // Trả về true
      }
      // Thêm logic gọi API thực tế ở đây nếu cần
      return false;
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi đổi mật khẩu");
      return false; // Trả về false khi có lỗi
    }
  };

  const handleToggle2FA = async () => {
    if (!is2FAEnabled) {
      // Will be handled by TwoFactorAuth component
    } else {
      if (confirm("Bạn có chắc chắn muốn tắt xác thực 2 lớp?")) {
        try {
          if (useMockData) {
            setIs2FAEnabled(false);
            alert("Đã tắt xác thực 2 lớp (Mock Data)");
          }
        } catch (err) {
          console.error("Lỗi disable 2FA:", err);
        }
      }
    }
  };

  const handleEnable2FA = async (code: string): Promise<boolean> => {
    // Thêm return type Promise<boolean>
    try {
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIs2FAEnabled(true);
        alert("Đã bật xác thực 2 lớp (Mock Data)");
        return true; // Trả về true
      }
      // Thêm logic gọi API thực tế ở đây nếu cần
      return false;
    } catch (err: any) {
      alert(err.message || "Kích hoạt thất bại");
      return false; // Trả về false khi có lỗi
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất thiết bị này?")) return;
    try {
      if (useMockData) {
        setDevices((prev) => prev.filter((device) => device.id !== deviceId));
        alert("Đã đăng xuất thiết bị (Mock Data)");
      }
    } catch (err) {
      console.error("Lỗi logout device:", err);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị khác?"))
      return;
    try {
      if (useMockData) {
        setDevices((prev) => prev.filter((device) => device.is_current));
        alert("Đã đăng xuất tất cả thiết bị khác (Mock Data)");
      }
    } catch (err) {
      console.error("Lỗi logout all devices:", err);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-800">Bảo mật tài khoản</h1>

      {useMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Đang hiển thị dữ liệu mẫu. Kết nối backend để xem dữ liệu thực.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm border-t-2 border-black/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield size={20} /> Mật khẩu đăng nhập
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật mật khẩu thường xuyên để tăng cường bảo mật
            </p>
          </div>
        </div>
        <PasswordForm
          useMockData={useMockData}
          onChangePassword={handleChangePassword}
        />
      </div>

      <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm border-t-2 border-black/5">
        <TwoFactorAuth
          isEnabled={is2FAEnabled}
          useMockData={useMockData}
          onToggle={handleToggle2FA}
          onEnable={handleEnable2FA}
        />
      </div>

      <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm border-t-2 border-black/5">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Monitor size={20} /> Thiết bị đã đăng nhập
        </h2>

        {devices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Monitor size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 font-medium">Không có thiết bị nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <DeviceItem
                key={device.id}
                device={device}
                onLogout={handleLogoutDevice}
                formatTimeAgo={formatTimeAgo}
                useMockData={useMockData}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleLogoutAllDevices}
          className="mt-6 text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-2"
        >
          <LogOut size={16} />
          Đăng xuất khỏi tất cả thiết bị khác
        </button>
      </div>
    </div>
  );
}
