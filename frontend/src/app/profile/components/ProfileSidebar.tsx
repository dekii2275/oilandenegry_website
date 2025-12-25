"use client";

import React from "react";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  User,
  Package,
  CreditCard,
  Shield,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";

export type Tab = "info" | "orders" | "payment" | "security";

interface ProfileSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
}

const tabs: {
  id: Tab;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    id: "info",
    label: "Thông tin cá nhân",
    icon: <User size={20} />,
  },
  {
    id: "orders",
    label: "Đơn hàng của tôi",
    icon: <Package size={20} />,
  },
  {
    id: "payment",
    label: "Thiết lập thanh toán",
    icon: <CreditCard size={20} />,
  },
  {
    id: "security",
    label: "Bảo mật",
    icon: <Shield size={20} />,
  },
];

export default function ProfileSidebar({
  activeTab,
  setActiveTab,
  user,
}: ProfileSidebarProps) {
  const {
    avatarPreview,
    selectedFile,
    isUploading,
    uploadStatus,
    handleFileChange,
    handleSaveAvatar,
  } = useProfile();

  return (
    <aside className="w-full md:w-1/4 bg-white rounded-2xl p-6 shadow-sm h-fit">
      {/* ===== Avatar ===== */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group mb-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={64} className="text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border cursor-pointer hover:bg-gray-50 transition z-10">
            <Upload size={16} className="text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <h3 className="font-bold text-lg text-gray-800">
          {user?.name || "Nguyễn Văn A"}
        </h3>
        <p className="text-sm text-gray-600">
          {user?.email || "nguyenvana@gmail.com"}
        </p>
        <p className="text-xs text-gray-500 mt-2">Thành viên từ 01/2024</p>

        {selectedFile && (
          <button
            onClick={handleSaveAvatar}
            disabled={isUploading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#88D0B5] to-[#66B16A] text-white font-bold py-2.5 rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tải lên...
              </>
            ) : (
              "Lưu ảnh mới"
            )}
          </button>
        )}

        {uploadStatus === "success" && (
          <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
            <CheckCircle2 size={14} /> Cập nhật thành công!
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-[#88D0B5] to-[#66B16A] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Tài khoản của bạn</p>
          <div className="flex justify-center gap-6">
            <Stat label="Đơn hàng" value={12} />
            <Stat label="Thẻ" value={3} />
            <Stat label="Ví" value={2} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-[#88D0B5]">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
