"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Settings } from "lucide-react";

interface SellerHeaderProps {
  userName?: string;
  avatarUrl?: string;
}

export default function SellerHeader({
  userName,
  avatarUrl,
}: SellerHeaderProps) {
  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
      {/* ===== LEFT ===== */}
      <div className="flex items-center gap-6">
        {/* LOGO */}
        <Link href="/seller" className="flex items-center gap-2">
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
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link
            href="/seller"
            className="text-gray-600 hover:text-green-600"
          >
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
      </div>

      {/* ===== RIGHT ===== */}
      <div className="flex items-center gap-4">
        {/* NOTIFICATION */}
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {/* TODO: unread count */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

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
      </div>
    </header>
  );
}
