"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ProductDetail } from "./types";
import ChatWithSeller from "./ChatWithSeller";

interface ProductInfoProps {
  product: ProductDetail;
  quantity: number;
  isInWishlist: boolean;
  isLoading?: boolean;
  onQuantityChange: (type: "increase" | "decrease") => void;
  onRequestQuote: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void; // (giữ lại để khỏi lỗi parent, nhưng button này giờ dùng để mở chat)
  onViewSupplierProfile: () => void;
}

const formatVND = (value: any) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function getTokenFromLocalStorage() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("zenergy_token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

// decode JWT payload (base64url) -> lấy field "id"
function getUserIdFromJwt(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const json = atob(padded);
    const payload = JSON.parse(json);
    const id = Number(payload?.id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  isLoading = false,
  onQuantityChange,
  onRequestQuote,
  onAddToCart,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const storeName = product?.supplier?.name || "Nhà cung cấp";

  // cố gắng lấy store_id từ nhiều field khác nhau để không phụ thuộc type
  const storeId = useMemo(() => {
    const p: any = product as any;
    const v =
      p?.store_id ??
      p?.storeId ??
      p?.supplier?.id ??
      p?.supplier_id ??
      p?.seller_id ??
      null;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, [product]);

  const getSupplierSlug = () => {
    return (product.supplier?.name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const openChat = () => {
    const token = getTokenFromLocalStorage();
    const uid = token ? getUserIdFromJwt(token) : null;

    if (!uid) {
      toast.error("Bạn cần đăng nhập để nhắn tin với seller");
      // bạn muốn auto chuyển trang login thì bật dòng dưới:
      // window.location.href = "/login";
      return;
    }
    if (!storeId) {
      toast.error("Thiếu store_id (không mở được chat)");
      return;
    }

    setCustomerId(uid);
    setChatOpen(true);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Status & Rating */}
      <div className="flex items-center gap-4 mb-4">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {product.status}
        </span>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            ({product.rating} từ {product.totalReviews} đánh giá)
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold" style={{ color: "#10B981" }}>
            {formatVND(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xl text-gray-400 line-through">{formatVND(product.oldPrice)}</span>
          )}
          <span className="ml-12 text-sm text-gray-500">Đơn vị: {product.unit}</span>
        </div>
      </div>

      {/* Specifications */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Danh mục</p>
          <p className="font-semibold text-gray-900">{product.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Thương hiệu</p>
          <p className="font-semibold text-gray-900">{product.brand}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Bảo hành</p>
          <p className="font-semibold text-gray-900">{product.technicalDetails.warranty}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Công suất</p>
          <p className="font-semibold text-gray-900">{product.technicalDetails.power}</p>
        </div>
      </div>

      {/* Supplier */}
      <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: "#F0FDF4" }}>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-sm font-bold text-gray-700">
            {(storeName || "GT")
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Nhà cung cấp</p>
          <p className="font-semibold">{storeName}</p>
        </div>

        <Link
          href={`/suppliers/${getSupplierSlug()}`}
          className="ml-auto font-semibold hover:underline"
          style={{ color: "#10B981" }}
        >
          Xem hồ sơ
        </Link>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
            <button onClick={() => onQuantityChange("decrease")} className="px-4 py-2 hover:bg-gray-100">
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-6 py-2 font-semibold">{quantity}</span>
            <button onClick={() => onQuantityChange("increase")} className="px-4 py-2 hover:bg-gray-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-600">50 sản phẩm có sẵn</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={onRequestQuote}
          disabled={isLoading}
          className="flex-1 py-4 font-semibold text-white hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#10B981", borderRadius: "9999px" }}
        >
          <ShoppingCart className="w-5 h-5" />
          Yêu cầu báo giá
        </button>

        <button
          onClick={onAddToCart}
          disabled={isLoading}
          className="flex-1 py-4 font-semibold border-2 hover:bg-green-50 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ borderColor: "#10B981", color: "#10B981", borderRadius: "9999px" }}
        >
          <ShoppingCart className="w-5 h-5" />
          Thêm vào giỏ hàng
        </button>

        {/* ✅ Nút Chat (thay Heart) */}
        <button
          onClick={openChat}
          disabled={isLoading}
          className="w-14 h-14 border-2 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:border-green-600 hover:bg-green-50"
          style={{ borderRadius: "9999px" }}
          aria-label="Chat with seller"
          title="Nhắn tin với seller"
        >
          <MessageCircle size={18} />
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <Truck className="w-6 h-6 mx-auto mb-2" style={{ color: "#10B981" }} />
          <p className="text-xs text-gray-600">Giao hàng toàn quốc</p>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: "#10B981" }} />
          <p className="text-xs text-gray-600">Bảo vệ quyền lợi mua</p>
        </div>
        <div className="text-center">
          <RotateCcw className="w-6 h-6 mx-auto mb-2" style={{ color: "#10B981" }} />
          <p className="text-xs text-gray-600">Hỗ trợ kỹ thuật 24/7</p>
        </div>
      </div>

      {/* ✅ Chat modal */}
      {chatOpen && customerId ? (
        <ChatWithSeller
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          storeId={storeId}
          storeName={storeName}
          customerId={customerId}
          productId={Number((product as any)?.id) || null}
        />
      ) : null}
    </div>
  );
};

export default ProductInfo;
