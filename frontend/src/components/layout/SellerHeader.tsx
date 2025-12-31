"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SellerHeaderProps {
  userName?: string;
  avatarUrl?: string;
}

interface Notification {
  id: number;
  title: string;
  read: boolean;
}

export default function SellerHeader({
  userName,
  avatarUrl,
}: SellerHeaderProps) {
  // TODO: thay bằng auth thật
  const isAuthenticated = true;

  /* ===== NOTIFICATION STATE ===== */
  const [openNoti, setOpenNoti] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // TODO: call API /seller/notifications
      setNotifications([
        { id: 1, title: "Bạn có đơn hàng mới #1023", read: false },
        { id: 2, title: "Đơn hàng #1018 đã hoàn tất", read: true },
        { id: 3, title: "Yêu cầu rút tiền đã được duyệt", read: false },
      ]);
    }
  }, [isAuthenticated]);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setOpenNoti(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
      {/* ===== LEFT ===== */}
      <div className="flex items-center gap-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/images/logo.png"
            alt="Z-ENERGY Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <span className="font-semibold text-sm">Z-ENERGY</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Seller
          </span>
        </Link>

        {/* NAV */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/seller" className="text-gray-600 hover:text-green-600">
              Tổng quan
            </Link>
            <Link
              href="/seller/orders"
              className="text-gray-600 hover:text-green-600"
            >
              Quản lý Đơn hàng
            </Link>
            <Link
              href="/seller/products"
              className="text-gray-600 hover:text-green-600"
            >
              Sản phẩm
            </Link>
            <Link
              href="/seller/wallet"
              className="text-gray-600 hover:text-green-600"
            >
              Ví tiền
            </Link>
          </nav>
        )}
      </div>

      {/* ===== RIGHT ===== */}
      <div className="flex items-center gap-4">
        {/* ========== CHƯA ĐĂNG NHẬP ========== */}
        {!isAuthenticated && (
          <>
            <Link
              href="/seller/login"
              className="text-sm font-medium text-gray-600 hover:text-green-600"
            >
              Đăng nhập
            </Link>

            <Link
              href="/seller/register"
              className="text-sm font-semibold px-4 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
            >
              Đăng ký Seller
            </Link>
          </>
        )}

        {/* ========== ĐÃ ĐĂNG NHẬP ========== */}
        {isAuthenticated && (
          <>
            {/* ===== NOTIFICATION ===== */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setOpenNoti(!openNoti)}
                className="relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1
                    text-[10px] flex items-center justify-center
                    bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNoti && (
                <div className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold text-sm">Thông báo</span>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">
                        Không có thông báo
                      </p>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b last:border-b-0 cursor-pointer
                          ${
                            n.read
                              ? "bg-white text-gray-600"
                              : "bg-green-50 text-gray-800 font-medium"
                          }`}
                      >
                        {n.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SETTINGS */}
            <button>
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* USER */}
            <div className="flex items-center gap-2">
              <Image
                src={
                  avatarUrl ||
                  "https://ui-avatars.com/api/?name=Seller&background=0D8ABC&color=fff"
                }
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-medium hidden sm:block">
                {userName || "Seller"}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
