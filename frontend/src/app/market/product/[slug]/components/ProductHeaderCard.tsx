// frontend/src/app/market/product/[slug]/components/ProductHeaderCard.tsx

"use client";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Droplets,
  Sparkles,
  Package,
  Globe,
  Database,
  Heart,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { Product } from "../types";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-hot-toast";

interface ProductHeaderCardProps {
  product: Product;
}

export default function ProductHeaderCard({ product }: ProductHeaderCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const getProductIcon = () => {
    if (product.category?.includes("Dầu")) {
      return Droplets;
    } else if (product.category?.includes("Điện")) {
      return Sparkles;
    }
    return Package;
  };

  const Icon = getProductIcon();

  // Hàm kiểm tra đăng nhập
  const checkAuthAndRedirect = (actionType: "buy-now" | "add-to-cart") => {
    if (!isAuthenticated) {
      // Lưu thông tin sản phẩm và hành động vào sessionStorage để sau khi login có thể tiếp tục
      sessionStorage.setItem(
        "pendingAction",
        JSON.stringify({
          type: actionType,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            slug: product.slug,
            quantity: 1,
          },
          redirectUrl: window.location.href,
        })
      );

      // Hiển thị thông báo yêu cầu đăng nhập
      if (typeof window !== "undefined") {
        toast.error("Vui lòng đăng nhập để tiếp tục mua hàng!", {
          duration: 4000,
          icon: "🔒",
        });
      }

      // Redirect đến trang đăng nhập với callback URL
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.href)}`
      );
      return false;
    }
    return true;
  };

  // Xử lý click Mua Ngay
  const handleBuyNow = async () => {
    if (authLoading) return;
    if (!checkAuthAndRedirect("buy-now")) return;

    setIsLoading(true);
    try {
      // Mock: Thêm vào giỏ hàng (trong thực tế sẽ gọi API)
      console.log("Mua ngay sản phẩm:", product);

      // Tạo mock cart item
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
      };

      // Lấy giỏ hàng hiện tại từ localStorage
      const currentCart = JSON.parse(
        localStorage.getItem("zenergy_cart") || "[]"
      );

      // Thêm sản phẩm vào giỏ hàng
      const existingItemIndex = currentCart.findIndex(
        (item: any) => item.id === product.id
      );
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push(cartItem);
      }

      // Lưu lại vào localStorage
      localStorage.setItem("zenergy_cart", JSON.stringify(currentCart));

      // Dispatch event để cập nhật UI
      const event = new CustomEvent("cart-updated", {
        detail: { count: currentCart.length },
      });
      window.dispatchEvent(event);

      // Hiển thị thông báo
      toast.success("Đã thêm vào giỏ hàng!", {
        duration: 3000,
        icon: "🛒",
      });

      // Chờ một chút rồi chuyển đến trang thanh toán
      setTimeout(() => {
        router.push("/cart/checkout");
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error);
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng!", {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý click Thêm Giỏ
const handleAddToCart = async () => {
  if (!product || !selectedVariant) return;

  // Nếu chưa đăng nhập -> giữ nguyên luồng cũ
  if (!user) {
    const pending = {
      action: "addToCart",
      productId: product.product_id,
      variantId: selectedVariant.id,
      quantity,
    };
    sessionStorage.setItem("pendingAction", JSON.stringify(pending));
    router.push("/login");
    return;
  }

  // ✅ Gọi API backend thật
  await apiClient.post("/api/cart/items", {
    variant_id: selectedVariant.id,
    quantity,
  });

  // Bắn event để Header / UI update số lượng
  window.dispatchEvent(new Event("cart-updated"));
};


  // Xử lý yêu thích
  const handleToggleFavorite = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích!", {
        duration: 3000,
      });
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    try {
      // Mock: Lưu vào localStorage
      const currentFavorites = JSON.parse(
        localStorage.getItem("zenergy_favorites") || "[]"
      );

      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        const newFavorites = currentFavorites.filter(
          (fav: any) => fav.id !== product.id
        );
        localStorage.setItem("zenergy_favorites", JSON.stringify(newFavorites));
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích!", {
          duration: 3000,
          icon: "💔",
        });
      } else {
        // Thêm vào danh sách yêu thích
        const favoriteItem = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          category: product.category,
          addedAt: new Date().toISOString(),
        };
        currentFavorites.push(favoriteItem);
        localStorage.setItem(
          "zenergy_favorites",
          JSON.stringify(currentFavorites)
        );
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích!", {
          duration: 3000,
          icon: "❤️",
        });
      }

      // Dispatch event để cập nhật UI nếu cần
      const event = new CustomEvent("favorites-updated");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Lỗi khi xử lý yêu thích:", error);
      toast.error("Có lỗi xảy ra!", {
        duration: 4000,
      });
    }
  };

  // Kiểm tra xem sản phẩm đã được yêu thích chưa
  useState(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      const currentFavorites = JSON.parse(
        localStorage.getItem("zenergy_favorites") || "[]"
      );
      const isProductFavorite = currentFavorites.some(
        (fav: any) => fav.id === product.id
      );
      setIsFavorite(isProductFavorite);
    }
  });

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left side - Product Info */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl">
              <Icon className="text-green-600" size={32} />
            </div>
            {!product.fromAPI && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                DEMO
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {product.name}
              </h1>
              <button
                onClick={handleToggleFavorite}
                disabled={isLoading || authLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-100 text-gray-400 hover:text-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">
                {product.category}
              </span>
              <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                <Globe size={10} />
                {product.location}
              </span>
              <span className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                {product.unit}
              </span>
              {product.fromAPI ? (
                <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full font-bold flex items-center gap-1">
                  <Database size={10} />
                  REAL-TIME
                </span>
              ) : (
                <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                  DỮ LIỆU MẪU
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Price & Actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-4xl font-black text-gray-800 mb-1">
              $
              {typeof product.price === "number"
                ? product.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : product.price}
            </div>
            <div
              className={`flex items-center justify-end gap-2 ${
                product.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {product.isUp ? (
                <TrendingUp size={18} className="animate-pulse" />
              ) : (
                <TrendingDown size={18} />
              )}
              <span className="text-lg font-bold">
                {product.changeFormatted}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={isLoading || authLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </span>
              ) : (
                "Mua Ngay"
              )}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isLoading || authLoading}
              className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  Đang thêm...
                </span>
              ) : (
                "Thêm Giỏ"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Mô tả sản phẩm
          </h3>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  );
}
