"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const res = await apiClient.get<any>("/cart");
        
        // 👇 SỬA Ở ĐÂY: Ép kiểu 'res' sang 'any'
        const data = res as any;
        const items = data?.items || data?.data?.items || [];

        const count = items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        );
        setCartCount(count);
      } catch (error) {
        // Thường là chưa login hoặc lỗi mạng
        setCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Dùng void để ignore promise floating
    void updateCartCount();

    const handleCartUpdate = () => {
      void updateCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-2 bg-gray-100 rounded-xl">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <Link
      href="/cart"
      className="relative group flex items-center justify-center p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
      aria-label="Giỏ hàng"
    >
      <ShoppingCart
        size={20}
        className="text-gray-600 group-hover:text-green-600 transition-colors"
      />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
      <span className="sr-only">Giỏ hàng ({cartCount} sản phẩm)</span>
    </Link>
  );
}