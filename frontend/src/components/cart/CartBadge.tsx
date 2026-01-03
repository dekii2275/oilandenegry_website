"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface CartBadgeProps {
  showText?: boolean;
  className?: string;
}

export default function CartBadge({
  showText = false,
  className = "",
}: CartBadgeProps) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const res = await apiClient.get<any>("/cart");
        
        // 👇 SỬA Ở ĐÂY: Ép kiểu 'res' sang 'any' để TypeScript không báo lỗi
        const data = res as any;
        const items = data?.items || data?.data?.items || [];

        const count = items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        );
        setCartCount(count);
      } catch (error) {
        // Thường là chưa login hoặc lỗi mạng -> Reset về 0
        setCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Gọi hàm (dùng void để ignore promise floating)
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
      <div
        className={`flex items-center gap-2 p-2 rounded-xl bg-gray-100 ${className}`}
      >
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        {showText && (
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/cart"
      className={`
        group flex items-center gap-2 p-2 rounded-xl 
        bg-gray-100 hover:bg-gray-200 transition-colors
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
    >
      <div className="relative">
        <ShoppingCart
          size={20}
          className={`transition-colors ${
            isHovered ? "text-green-600" : "text-gray-600"
          }`}
        />
        {cartCount > 0 && (
          <span
            className={`
              absolute -top-2 -right-2 
              bg-red-500 text-white text-xs font-bold 
              rounded-full min-w-[18px] h-[18px] 
              flex items-center justify-center px-1
              transition-transform duration-300
              ${isHovered ? "scale-110" : "scale-100"}
              ${cartCount > 99 ? "text-[9px]" : "text-xs"}
            `}
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Giỏ hàng</span>
          <span className="text-sm font-bold text-gray-700">
            {cartCount} sản phẩm
          </span>
        </div>
      )}

      {/* Tooltip on hover */}
      {!showText && isHovered && cartCount > 0 && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
          {cartCount} sản phẩm trong giỏ
        </div>
      )}
    </Link>
  );
}