"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { ProductDetail } from "./types";

interface ProductInfoProps {
  product: ProductDetail;
  quantity: number;
  isInWishlist: boolean;
  onQuantityChange: (type: "increase" | "decrease") => void;
  onRequestQuote: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onViewSupplierProfile: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  isInWishlist,
  onQuantityChange,
  onRequestQuote,
  onAddToCart,
  onToggleWishlist,
  onViewSupplierProfile,
}) => {
  const getSupplierSlug = () => {
    return product.supplier.name.toLowerCase().replace(/\s+/g, "-");
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
                i < Math.floor(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
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
      <p className="text-gray-600 mb-6 leading-relaxed">
        {product.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold" style={{ color: "#10B981" }}>
            ${product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-xl text-gray-400 line-through">
              ${product.oldPrice.toLocaleString()}
            </span>
          )}
          <span className="ml-12 text-sm text-gray-500">
            Đơn vị: {product.unit}
          </span>
        </div>
      </div>

      {/* Specifications - 4 items */}
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
          <p className="font-semibold text-gray-900">
            {product.technicalDetails.warranty}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Công suất</p>
          <p className="font-semibold text-gray-900">
            {product.technicalDetails.power}
          </p>
        </div>
      </div>

      {/* Supplier */}
      <div
        className="mb-6 p-4 rounded-lg flex items-center gap-3"
        style={{ backgroundColor: "#F0FDF4" }}
      >
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-sm font-bold text-gray-700">GT</span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Nhà cung cấp</p>
          <p className="font-semibold">{product.supplier.name}</p>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng:
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
            <button
              onClick={() => onQuantityChange("decrease")}
              className="px-4 py-2 hover:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-6 py-2 font-semibold">{quantity}</span>
            <button
              onClick={() => onQuantityChange("increase")}
              className="px-4 py-2 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-600">50 sản phẩm có sẵn</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        {/* Nút Yêu cầu báo giá */}
        <button
          onClick={onRequestQuote}
          className="flex-1 py-4 font-semibold text-white hover:opacity-90 transition flex items-center justify-center gap-2"
          style={{ backgroundColor: "#10B981", borderRadius: "9999px" }}
        >
          <ShoppingCart className="w-5 h-5" />
          Yêu cầu báo giá
        </button>

        {/* Nút Thêm vào giỏ hàng */}
        <button
          onClick={onAddToCart}
          className="flex-1 py-4 font-semibold border-2 hover:bg-opacity-10 transition flex items-center justify-center gap-2"
          style={{
            borderColor: "#10B981",
            color: "#10B981",
            borderRadius: "9999px",
          }}
        >
          <ShoppingCart className="w-5 h-5" />
          Thêm vào giỏ hàng
        </button>

        {/* Nút Yêu thích */}
        <button
          onClick={onToggleWishlist}
          className={`w-14 h-14 border-2 flex items-center justify-center transition ${
            isInWishlist
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-green-600 hover:bg-green-50"
          }`}
          style={{ borderRadius: "9999px" }}
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <Truck
            className="w-6 h-6 mx-auto mb-2"
            style={{ color: "#10B981" }}
          />
          <p className="text-xs text-gray-600">Giao hàng toàn quốc</p>
        </div>
        <div className="text-center">
          <Shield
            className="w-6 h-6 mx-auto mb-2"
            style={{ color: "#10B981" }}
          />
          <p className="text-xs text-gray-600">Bảo vệ quyền lợi mua</p>
        </div>
        <div className="text-center">
          <RotateCcw
            className="w-6 h-6 mx-auto mb-2"
            style={{ color: "#10B981" }}
          />
          <p className="text-xs text-gray-600">Hỗ trợ kỹ thuật 24/7</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
