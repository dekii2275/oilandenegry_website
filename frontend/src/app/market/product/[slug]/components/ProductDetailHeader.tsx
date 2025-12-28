// frontend/src/app/market/product/[slug]/components/ProductDetailHeader.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  RefreshCw,
  Bell,
  Share2,
  Download,
  FileText,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProductDetailHeaderProps {
  productName?: string;
  category?: string;
  lastPriceUpdate?: string;
  productId?: string;
  productSlug?: string;
}

export default function ProductDetailHeader({
  productName,
  category,
  lastPriceUpdate,
  productId,
  productSlug,
}: ProductDetailHeaderProps) {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const fetchLastUpdated = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const now = new Date();
      const formatted = now.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastUpdated(formatted);
    } catch (error) {
      console.error("Lỗi khi lấy thời gian cập nhật:", error);
      setLastUpdated(new Date().toLocaleString("vi-VN"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLastUpdated();
    toast.success("Đã làm mới dữ liệu!", {
      duration: 2000,
    });
  };

  // Kiểm tra xem sản phẩm đã được theo dõi chưa
  useEffect(() => {
    if (mounted && productId && isAuthenticated) {
      const watchedProducts = JSON.parse(
        localStorage.getItem("zenergy_watched_products") || "[]"
      );
      const isProductWatched = watchedProducts.some(
        (p: any) => p.id === productId
      );
      setIsWatching(isProductWatched);
    }
  }, [mounted, productId, isAuthenticated]);

  const handleWatchProduct = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi sản phẩm!", {
        duration: 3000,
      });
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    try {
      const watchedProducts = JSON.parse(
        localStorage.getItem("zenergy_watched_products") || "[]"
      );

      if (isWatching) {
        // Bỏ theo dõi
        const newWatchedProducts = watchedProducts.filter(
          (p: any) => p.id !== productId
        );
        localStorage.setItem(
          "zenergy_watched_products",
          JSON.stringify(newWatchedProducts)
        );
        setIsWatching(false);
        toast.success("Đã bỏ theo dõi sản phẩm!", {
          duration: 3000,
          icon: "🔕",
        });
      } else {
        // Theo dõi
        const productToWatch = {
          id: productId,
          name: productName,
          slug: productSlug,
          category: category,
          addedAt: new Date().toISOString(),
        };

        watchedProducts.push(productToWatch);
        localStorage.setItem(
          "zenergy_watched_products",
          JSON.stringify(watchedProducts)
        );
        setIsWatching(true);
        toast.success("Đang theo dõi sản phẩm!", {
          duration: 3000,
          icon: "🔔",
        });
      }

      // Dispatch event để cập nhật UI ở các component khác nếu cần
      const event = new CustomEvent("watchlist-updated");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Lỗi khi xử lý theo dõi sản phẩm:", error);
      toast.error("Có lỗi xảy ra!", {
        duration: 4000,
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: productName || "Chi tiết sản phẩm",
          text: `Xem chi tiết ${productName} trên Z-Energy`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Đã chia sẻ!", {
            duration: 3000,
          });
        })
        .catch((error) => {
          console.log("Lỗi chia sẻ:", error);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link vào clipboard!", {
        duration: 3000,
      });
    }
  };

  const handleDownloadReport = () => {
    if (!productId || !productSlug) {
      toast.error("Không thể tải báo cáo!", {
        duration: 3000,
      });
      return;
    }

    // Lưu thông tin sản phẩm vào sessionStorage để sử dụng ở trang báo cáo
    sessionStorage.setItem(
      "reportProduct",
      JSON.stringify({
        id: productId,
        name: productName,
        slug: productSlug,
        category: category,
        lastPriceUpdate: lastPriceUpdate,
      })
    );

    // Chuyển đến trang báo cáo
    router.push(`/market/report/${productSlug}`);
  };

  useEffect(() => {
    setMounted(true);
    fetchLastUpdated();

    const interval = setInterval(fetchLastUpdated, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      {/* Left Section - Breadcrumb & Product Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Link
            href="/"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            <Home size={12} />
            Trang chủ
          </Link>
          <span>&gt;</span>
          <Link
            href="/market"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            Thị trường
          </Link>
          <span>&gt;</span>
          <span className="text-green-600 font-medium truncate max-w-[200px]">
            {productName || "Chi tiết sản phẩm"}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <Link
            href="/market"
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mt-1"
            title="Quay lại thị trường"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
              {productName || "Đang tải..."}
            </h1>
            {category && (
              <p className="text-sm text-gray-500 mt-2">
                Phân loại:{" "}
                <span className="font-medium text-green-600">{category}</span>
                {lastPriceUpdate && (
                  <>
                    <span className="mx-2">•</span>
                    Cập nhật giá:{" "}
                    <span className="font-medium">{lastPriceUpdate}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Actions & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Last Updated & Refresh */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              Dữ liệu cập nhật
            </p>
            <div className="text-sm font-bold text-gray-700 min-h-[20px]">
              {!mounted ? (
                <span className="text-gray-300">--:--:--</span>
              ) : isLoading ? (
                <span className="text-gray-400 animate-pulse">Đang tải...</span>
              ) : (
                lastUpdated
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading || !mounted}
            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cập nhật dữ liệu mới nhất"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleWatchProduct}
            className={`p-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              isWatching
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
            } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              isWatching
                ? "Đang theo dõi"
                : isAuthenticated
                ? "Theo dõi sản phẩm"
                : "Đăng nhập để theo dõi"
            }
          >
            <Bell size={16} fill={isWatching ? "currentColor" : "none"} />
            <span className="hidden sm:inline">
              {isWatching ? "Đang theo dõi" : "Theo dõi"}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
            title="Chia sẻ sản phẩm"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          <Link
            href="/market/report/slug"
            className="p-2.5 bg-[#71C291] hover:bg-[#5da97b] text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-100"
            title="Tạo báo cáo PDF chuyên sâu"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Báo cáo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
