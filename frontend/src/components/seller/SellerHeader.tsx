"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Bell, Store, User } from "lucide-react";

// Thay đổi URL này nếu cần
const API_BASE_URL = "https://zenergy.cloud/api";

// 👇 1. SỬA LỖI TYPE Ở ĐÂY
interface SellerProfile {
  id: number;
  email: string;      // 👈 SỬA: 'str' -> 'string'
  full_name: string;
  role: string;
  store_name: string; // 👈 MỚI: Thêm tên cửa hàng
}

export default function SellerHeader() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 👇 2. GỌI API MỚI (/seller/me) THAY VÌ (/users/me)
    fetch(`${API_BASE_URL}/seller/me`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setSeller(data);
        }
      })
      .catch((err) => console.error("Lỗi lấy thông tin seller:", err));
  }, []);

  const handleLogout = () => {
    document.cookie = "access_token=; Max-Age=0; path=/; domain=.zenergy.cloud";
    document.cookie = "access_token=; Max-Age=0; path=/;"; 
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* --- BÊN TRÁI: TIÊU ĐỀ --- */}
      <div className="flex items-center gap-2">
        <Store className="text-green-600" size={24} />
        <h2 className="text-lg font-bold text-gray-700">
          {seller?.store_name || "Kênh Người Bán"} {/* ✅ Hiển thị Tên Shop */}
        </h2>
      </div>

      {/* --- BÊN PHẢI: THÔNG TIN USER --- */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-green-600 transition-colors">
          <Bell size={20} />
          {/* Dot thông báo giả lập */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {seller ? (
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right hidden md:block">
              {/* Hiển thị tên chủ shop nhỏ hơn ở dưới */}
              <p className="text-sm font-semibold text-gray-800">
                {seller.full_name}
              </p>
              <span className="inline-block text-green-600 text-[10px] font-bold uppercase">
                {seller.role}
              </span>
            </div>

            {/* Avatar: Lấy chữ cái đầu của Tên Shop hoặc Tên Người */}
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
              {seller.store_name ? seller.store_name.charAt(0).toUpperCase() : <User size={20}/>}
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          /* Loading State */
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-32 h-4 bg-gray-100 rounded"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        )}
      </div>
    </header>
  );
}