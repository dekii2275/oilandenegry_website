"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Store,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * =====================================
 * ADMIN SIDEBAR (DÙNG CHUNG)
 * =====================================
 *
 * ✔ Active menu theo route
 * ✔ Có user info + logout
 * ✔ Frontend only
 * ✔ Backend gắn:
 *    - user info
 *    - badge count
 *    - logout logic
 */

const menuItems = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Nhà bán hàng",
    href: "/admin/sellers",
    icon: Store,
    badge: 3, // TODO: backend -> pending sellers
  },
  {
    label: "Phân tích",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* ================= LOGO ================= */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <Image
          src="/assets/images/logo.png"
          alt="EnergyAdmin"
          width={36}
          height={36}
        />
        <span className="font-semibold text-green-600 text-lg">
          EnergyAdmin
        </span>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" &&
              pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2 rounded-lg transition
                ${
                  isActive
                    ? "bg-green-100 text-green-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-xs bg-red-500 text-white px-2 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ================= USER INFO ================= */}
      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            👤
            {/* TODO: backend -> avatar */}
          </div>

          <div className="text-sm">
            <p className="font-medium leading-tight">Admin System</p>
            <p className="text-xs text-gray-500">admin@energy.vn</p>
            {/* TODO: backend -> email */}
          </div>
        </div>

        {/* Logout */}
        <button
          title="Đăng xuất"
          className="text-gray-400 hover:text-red-500"
        >
          <LogOut size={18} />
          {/* TODO: backend -> logout */}
        </button>
      </div>
    </aside>
  );
}
