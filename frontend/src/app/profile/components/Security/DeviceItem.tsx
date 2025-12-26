// frontend/src/app/profile/components/Security/DeviceItem.tsx
"use client";

import React from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { Device } from "../../types";

interface DeviceItemProps {
  device: Device;
  onLogout: (deviceId: string) => void;
  formatTimeAgo: (timestamp: string) => string;
  useMockData: boolean;
}

export default function DeviceItem({
  device,
  onLogout,
  formatTimeAgo,
  useMockData,
}: DeviceItemProps) {
  const getDeviceIcon = (os: string) => {
    if (os.toLowerCase().includes("windows")) return "💻";
    if (os.toLowerCase().includes("mac") || os.toLowerCase().includes("ios"))
      return "🍎";
    if (os.toLowerCase().includes("android")) return "🤖";
    return "📱";
  };

  const getBrowserIcon = (browser: string) => {
    if (browser.toLowerCase().includes("chrome")) return "🌐";
    if (browser.toLowerCase().includes("firefox")) return "🦊";
    if (browser.toLowerCase().includes("safari")) return "🍎";
    return "🔍";
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-xl border border-gray-300 transition-all hover:shadow-md ${
        device.is_current ? "ring-2 ring-[#88D0B5]" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{getDeviceIcon(device.os)}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">{device.name}</p>
              {useMockData && (
                <span className="text-xs text-gray-400">(Mock)</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {device.location} • {formatTimeAgo(device.last_active)}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {getBrowserIcon(device.browser)} {device.browser}
              </span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {device.os}
              </span>
              {device.ip_address && (
                <span className="text-xs text-gray-500">
                  IP: {device.ip_address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {device.is_current ? (
            <span className="text-[10px] font-bold text-[#66B16A] bg-white px-2 py-1 rounded-md border border-[#66B16A]/20">
              HIỆN TẠI
            </span>
          ) : (
            <>
              <button
                onClick={() => onLogout(device.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                title="Đăng xuất thiết bị"
              >
                <LogOut size={12} />
                Đăng xuất
              </button>
              <ChevronRight size={18} className="text-gray-400" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
