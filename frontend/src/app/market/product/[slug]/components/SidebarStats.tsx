// frontend/src/app/market/product/[slug]/components/SidebarStats.tsx

"use client";

import {
  BarChart3,
  Clock,
  Download,
  Share2,
  Bell,
  AlertCircle,
  Package,
  ChevronRight,
  Droplets,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "../types";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SidebarStatsProps {
  product: Product;
}

export default function SidebarStats({ product }: SidebarStatsProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState({
    watch: false,
    share: false,
    report: false,
    error: false,
  });
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Kiểm tra xem sản phẩm đã được theo dõi chưa
  useEffect(() => {
    if (product.id && isAuthenticated) {
      const watchedProducts = JSON.parse(
        localStorage.getItem("zenergy_watched_products") || "[]"
      );
      const isProductWatched = watchedProducts.some(
        (p: any) => p.id === product.id
      );
      setIsWatching(isProductWatched);
    }
  }, [product.id, isAuthenticated]);

  if (!product.marketDetails || !product.relatedProducts) return null;

  // Hàm theo dõi/bỏ theo dõi sản phẩm
  const handleToggleWatch = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi sản phẩm!", {
        duration: 3000,
      });
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    setIsLoading((prev) => ({ ...prev, watch: true }));

    try {
      const watchedProducts = JSON.parse(
        localStorage.getItem("zenergy_watched_products") || "[]"
      );

      if (isWatching) {
        // Bỏ theo dõi
        const newWatchedProducts = watchedProducts.filter(
          (p: any) => p.id !== product.id
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
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: product.price,
          isUp: product.isUp,
          change: product.change,
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

      // Dispatch event để cập nhật UI ở các component khác
      const event = new CustomEvent("watchlist-updated");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Lỗi khi xử lý theo dõi sản phẩm:", error);
      toast.error("Có lỗi xảy ra!", {
        duration: 4000,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, watch: false }));
    }
  };

  // Hàm chia sẻ sản phẩm
  const handleShare = () => {
    setIsLoading((prev) => ({ ...prev, share: true }));

    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Xem chi tiết ${product.name} trên Z-Energy`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Đã chia sẻ!", {
            duration: 3000,
          });
        })
        .catch((error) => {
          console.log("Lỗi chia sẻ:", error);
        })
        .finally(() => {
          setIsLoading((prev) => ({ ...prev, share: false }));
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link vào clipboard!", {
        duration: 3000,
      });
      setIsLoading((prev) => ({ ...prev, share: false }));
    }
  };

  // Hàm tải báo cáo
  const handleDownloadReport = () => {
    setIsLoading((prev) => ({ ...prev, report: true }));

    // Lưu thông tin sản phẩm vào sessionStorage để sử dụng ở trang báo cáo
    sessionStorage.setItem(
      "reportProduct",
      JSON.stringify({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        marketDetails: product.marketDetails,
        lastUpdated: product.marketDetails?.lastUpdated,
      })
    );

    try {
      const reportContent = `
Z-Energy Market Report
==============================

Sản phẩm: ${product.name}
Phân loại: ${product.category}
Giá hiện tại: $${
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : product.price
      }
Thay đổi: ${product.changeFormatted}

Thống kê thị trường:
- Cao nhất 24h: $${product.marketDetails?.high24h || 0}
- Thấp nhất 24h: $${product.marketDetails?.low24h || 0}
- Khối lượng giao dịch: ${product.marketDetails?.volume || "N/A"}
- Vốn hóa thị trường: ${product.marketDetails?.marketCap || "N/A"}

Thời gian cập nhật: ${
        product.marketDetails?.lastUpdated || new Date().toLocaleString()
      }

Báo cáo được tạo: ${new Date().toLocaleString()}

==============================
Z-Energy Market Analytics
      `.trim();

      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${product.slug}-${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Đã tải báo cáo thành công!", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      toast.error("Có lỗi khi tải báo cáo!", {
        duration: 4000,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, report: false }));
    }
  };

  // Hàm báo lỗi
  const handleReportError = () => {
    setIsLoading((prev) => ({ ...prev, error: true }));

    // Lưu thông tin lỗi vào sessionStorage
    sessionStorage.setItem(
      "errorReport",
      JSON.stringify({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        reportedAt: new Date().toISOString(),
        url: window.location.href,
      })
    );

    // Redirect đến trang báo lỗi
    router.push(`/report-error?product=${product.slug}`);

    toast("Chuyển đến trang báo lỗi...", {
      duration: 2000,
    });

    setIsLoading((prev) => ({ ...prev, error: false }));
  };

  return (
    <>
      {/* Market Stats Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          Thống kê thời gian thực
        </h3>
        <div className="space-y-4">
          {[
            {
              label: "Giá mở cửa",
              value: `$${
                typeof product.marketDetails.open === "number"
                  ? product.marketDetails.open.toFixed(2)
                  : product.marketDetails.open
              }`,
              icon: TrendingUp,
              change: "+0.5%",
              changeColor: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Giá đóng cửa",
              value: `$${
                typeof product.marketDetails.close === "number"
                  ? product.marketDetails.close.toFixed(2)
                  : product.marketDetails.close
              }`,
              icon: TrendingDown,
              change: "+0.8%",
              changeColor: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Thay đổi giá",
              value: product.marketDetails.changeValue,
              icon: product.isUp ? TrendingUp : TrendingDown,
              change: product.marketDetails.changePercent,
              changeColor: product.isUp ? "text-green-600" : "text-red-600",
              bgColor: product.isUp ? "bg-green-50" : "bg-red-50",
            },
            {
              label: "KL giao dịch TB",
              value: product.marketDetails.avgVolume,
              icon: BarChart3,
              change: "+12.5%",
              changeColor: "text-green-600",
              bgColor: "bg-green-50",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={16} className={stat.changeColor} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${stat.bgColor} ${stat.changeColor}`}
              >
                {stat.change}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Clock size={12} />
            Cập nhật lúc: {product.marketDetails.lastUpdated}
          </p>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-purple-500" />
            Sản phẩm liên quan
          </h3>
          <span className="text-xs text-gray-500">
            {product.relatedProducts.length} sản phẩm
          </span>
        </div>
        <div className="space-y-3">
          {product.relatedProducts.map((related, index) => (
            <Link
              key={index}
              href={`/market/product/${related.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-green-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-white rounded-lg flex items-center justify-center group-hover:from-green-50 group-hover:to-emerald-50 transition-all">
                {related.category?.includes("Dầu") ? (
                  <Droplets
                    size={18}
                    className="text-gray-400 group-hover:text-green-600"
                  />
                ) : (
                  <Package
                    size={18}
                    className="text-gray-400 group-hover:text-green-600"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-green-600 truncate">
                  {related.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-gray-800">
                    $
                    {typeof related.price === "number"
                      ? related.price.toFixed(2)
                      : related.price}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      related.isUp
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {related.isUp ? "↗" : "↘"} {related.change}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-green-600 ml-2"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadReport}
            disabled={isLoading.report}
            className="p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading.report ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download size={20} />
            )}
            <span className="text-xs font-bold mt-1">
              {isLoading.report ? "Đang tải..." : "Tải báo cáo"}
            </span>
          </button>

          <button
            onClick={handleShare}
            disabled={isLoading.share}
            className="p-4 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading.share ? (
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Share2 size={20} />
            )}
            <span className="text-xs font-bold mt-1">
              {isLoading.share ? "Đang xử lý..." : "Chia sẻ"}
            </span>
          </button>

          <button
            onClick={handleToggleWatch}
            disabled={isLoading.watch || !isAuthenticated}
            className={`p-4 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              isWatching
                ? "bg-green-50 text-green-600 hover:bg-green-100"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100"
            }`}
          >
            {isLoading.watch ? (
              <div
                className={`w-5 h-5 border-2 ${
                  isWatching ? "border-green-600" : "border-amber-600"
                } border-t-transparent rounded-full animate-spin`}
              ></div>
            ) : (
              <Bell size={20} fill={isWatching ? "currentColor" : "none"} />
            )}
            <span className="text-xs font-bold mt-1">
              {isLoading.watch
                ? "Đang xử lý..."
                : isWatching
                ? "Đang theo dõi"
                : "Theo dõi"}
            </span>
          </button>

          <button
            onClick={handleReportError}
            disabled={isLoading.error}
            className="p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading.error ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="text-xs font-bold mt-1">
              {isLoading.error ? "Đang xử lý..." : "Báo lỗi"}
            </span>
          </button>
        </div>

        {/* Link to PDF Report */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link
            href={`/market/report/${product.slug}`}
            className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
          >
            <FileText size={16} />
            <span>Báo cáo PDF chuyên sâu</span>
          </Link>
          <p className="text-xs text-gray-500 text-center mt-2">
            Phân tích chi tiết với biểu đồ và dự báo
          </p>
        </div>
      </div>
    </>
  );
}
