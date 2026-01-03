"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

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
      // Backend cart cần variant_id -> lấy default variant từ /products/{id}
      const res = await apiClient.get<any>(`/products/${product.id}`);
      
      // 👇 SỬA Ở ĐÂY: Ép kiểu sang 'any' để TypeScript không báo lỗi .variants
      const prodData = res as any;

      const variantId =
        prodData?.variants?.[0]?.id ??
        prodData?.variants?.[0]?.variant_id ??
        prodData?.default_variant_id ??
        prodData?.data?.variants?.[0]?.id; // Fallback phòng khi data nằm trong .data

      if (!variantId) {
        toast.error("Sản phẩm chưa có biến thể để thêm vào giỏ hàng!", {
          duration: 4000,
          icon: "❌",
        });
        return;
      }

      await apiClient.post("/cart/items", { variant_id: variantId, quantity: 1 });

      // Badge/Icon đã được chuyển sang fetch DB cart => chỉ cần bắn event cho nó reload
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }

      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        icon: "✅",
        duration: 2500,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);

      const status = error?.response?.status;
      if (status === 401) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!", {
          duration: 3500,
          icon: "🔒",
        });
        router.push("/login");
        return;
      }

      toast.error(error?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!", {
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
  } as const;

  // Kiểu nút
  const variantClasses = {
    default:
      "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200",
    outline: "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50",
    icon: "p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-600",
  } as const;

  // Kích thước icon
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 18,
  } as const;

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