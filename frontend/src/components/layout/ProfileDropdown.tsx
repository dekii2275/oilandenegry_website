"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  CreditCard,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function ProfileDropdown({ isOpen, onClose }: any) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        onClose();
    };
    if (isOpen) document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menu = [
    {
      title: "Thông tin cá nhân",
      icon: <User size={16} />,
      href: "/profile?tab=info",
    },
    {
      title: "Đơn hàng của tôi",
      icon: <Package size={16} />,
      href: "/profile?tab=orders",
    },
    {
      title: "Thiết lập thanh toán",
      icon: <CreditCard size={16} />,
      href: "/profile?tab=payment",
    },
    {
      title: "Bảo mật tài khoản",
      icon: <Shield size={16} />,
      href: "/profile?tab=security",
    },
  ];

  // Avatar hiển thị trong dropdown
  const getUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
        {user?.name?.charAt(0) || "👤"}
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border p-4 z-50 animate-fadeIn"
    >
      <div className="flex items-center space-x-3 mb-4 border-b pb-3">
        {getUserAvatar()}
        <div className="overflow-hidden">
          <h3 className="text-sm font-bold truncate">{user?.name}</h3>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      <div className="space-y-1">
        {menu.map((m) => (
          <Link
            key={m.title}
            href={m.href}
            onClick={onClose}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition"
          >
            <div className="flex items-center space-x-3">
              {m.icon}
              <span className="text-sm font-medium">{m.title}</span>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-300 group-hover:text-blue-500"
            />
          </Link>
        ))}
      </div>
      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full mt-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex justify-center items-center gap-2"
      >
        <LogOut size={16} /> Đăng xuất
      </button>
    </div>
  );
}
