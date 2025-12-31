"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface CartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    slug: string;
    category: string;
    location?: string;
  };
  variant?: "default" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CartButton({
  product,
  variant = "default",
  size = "md",
  className = "",
}: CartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      // Tạo cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        price:
          typeof product.price === "number"
            ? product.price
            : parseFloat(product.price as string),
        quantity: 1,
        image: product.category?.includes("Dầu") ? "/oil.png" : "/energy.png",
        slug: product.slug,
        unit: product.unit,
        category: product.category,
        location: product.location || "Toàn cầu",
      };

      // Lấy giỏ hàng hiện tại
      const currentCart = JSON.parse(
        localStorage.getItem("zenergy_cart") || "[]"
      );

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItemIndex = currentCart.findIndex(
        (item: any) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Tăng số lượng nếu đã có
        currentCart[existingItemIndex].quantity += 1;
        toast.success(`Đã tăng số lượng "${product.name}" trong giỏ hàng!`, {
          icon: "➕",
          duration: 3000,
        });
      } else {
        // Thêm mới nếu chưa có
        currentCart.push(cartItem);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
          icon: "✅",
          duration: 3000,
        });
      }

      // Lưu vào localStorage
      localStorage.setItem("zenergy_cart", JSON.stringify(currentCart));

      // Dispatch event để cập nhật badge
      const totalCount = currentCart.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      const event = new CustomEvent("cart-updated", {
        detail: {
          count: totalCount,
          items: currentCart,
        },
      });
      window.dispatchEvent(event);

      // Hiệu ứng success
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!", {
        duration: 4000,
        icon: "❌",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Kích thước nút
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Kiểu nút
  const variantClasses = {
    default:
      "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200",
    outline:
      "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50",
    icon: "p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-600",
  };

  // Kích thước icon
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        font-bold rounded-xl transition-all
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSuccess ? "bg-green-500 !text-white" : ""}
      `}
      aria-label={`Thêm ${product.name} vào giỏ hàng`}
    >
      {isLoading ? (
        <>
          <Loader2 size={iconSize[size]} className="animate-spin" />
          {variant !== "icon" && "Đang thêm..."}
        </>
      ) : isSuccess ? (
        <>
          <Check size={iconSize[size]} />
          {variant !== "icon" && "Đã thêm!"}
        </>
      ) : (
        <>
          <ShoppingCart size={iconSize[size]} />
          {variant !== "icon" && "Thêm vào giỏ"}
        </>
      )}
    </button>
  );
}
