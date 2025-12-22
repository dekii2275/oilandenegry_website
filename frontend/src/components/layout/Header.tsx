"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ShoppingCart } from "lucide-react";
import { FaUser } from "react-icons/fa";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center">
              <Image
                src="/assets/images/logo.png"
                alt="Z-Energy Logo"
                width={48}
                height={48}
                className="object-cover scale-150"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Z-ENERGY</h1>
          </Link>

          {/* Navbar */}
          <Navbar />

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Icon chuông */}
            <Link href="/notifications">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer border border-gray-300">
                <Bell className="w-5 h-5 text-gray-700" />
              </div>
            </Link>

            {/* Giỏ hàng */}
            <Link href="/cart">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer border border-gray-300">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </div>
            </Link>

            {/* User icon */}
            <Link href="/login">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition cursor-pointer border-2 border-gray-900 shadow-md">
                <FaUser className="text-gray-800 text-2xl" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
