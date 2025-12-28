// frontend/src/app/(customer)/products/components/ProductCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Truck,
  Package,
  Fuel,
  Zap,
  Building,
  Calendar,
  Users,
} from "lucide-react";
import type { UIProduct } from "../utils/productUtils";

interface ProductCardProps {
  product: UIProduct;
  onAddToCart: (product: UIProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // 👉 Xác định loại sản phẩm/dịch vụ/dự án
  const isTransportService = product.category === "Vận tải & Logistics";
  const isProject = product.category === "Dự án";
  const isEnergyProduct =
    product.category === "Năng lượng tái tạo" ||
    product.category === "Điện mặt trời";
  const isFuelProduct = product.category === "Dầu thô & Nhiên liệu";

  // 👉 Thiết lập theme cho từng loại
  const getCardTheme = () => {
    if (isTransportService) {
      return {
        borderColor: "border-l-blue-500",
        badgeBg: "bg-blue-600",
        badgeText: "DỊCH VỤ",
        priceColor: "text-blue-600",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
        icon: <Truck className="w-4 h-4" />,
        categoryBg: "bg-blue-50",
        categoryText: "text-blue-700",
        serviceBg: "bg-blue-50",
        serviceBorder: "border-blue-100",
      };
    }

    if (isProject) {
      return {
        borderColor: "border-l-purple-500",
        badgeBg: "bg-purple-600",
        badgeText: "DỰ ÁN",
        priceColor: "text-purple-600",
        buttonBg: "bg-purple-600 hover:bg-purple-700",
        icon: <Building className="w-4 h-4" />,
        categoryBg: "bg-purple-50",
        categoryText: "text-purple-700",
        serviceBg: "bg-purple-50",
        serviceBorder: "border-purple-100",
      };
    }

    if (isEnergyProduct) {
      return {
        borderColor: "",
        badgeBg: "",
        badgeText: "",
        priceColor: "text-green-600",
        buttonBg: "bg-green-600 hover:bg-green-700",
        icon: <Zap className="w-4 h-4" />,
        categoryBg: "bg-green-50",
        categoryText: "text-green-700",
        serviceBg: "",
        serviceBorder: "",
      };
    }

    if (isFuelProduct) {
      return {
        borderColor: "",
        badgeBg: "",
        badgeText: "",
        priceColor: "text-orange-600",
        buttonBg: "bg-orange-600 hover:bg-orange-700",
        icon: <Fuel className="w-4 h-4" />,
        categoryBg: "bg-orange-50",
        categoryText: "text-orange-700",
        serviceBg: "",
        serviceBorder: "",
      };
    }

    // Mặc định cho sản phẩm thông thường
    return {
      borderColor: "",
      badgeBg: "",
      badgeText: "",
      priceColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
      icon: <Package className="w-4 h-4" />,
      categoryBg: "bg-gray-100",
      categoryText: "text-gray-700",
      serviceBg: "",
      serviceBorder: "",
    };
  };

  const theme = getCardTheme();

  const formatPrice = () => {
    if (isTransportService) {
      return `$${product.price?.toLocaleString()}/km`;
    }
    if (isProject) {
      return `$${product.price?.toLocaleString()}`;
    }
    return `$${product.price?.toLocaleString()}`;
  };

  const getUnitDisplay = () => {
    if (isTransportService) {
      return product.unit === "chiếc" ? "xe" : product.unit;
    }
    if (isProject) {
      return product.unit || "dự án";
    }
    return product.unit;
  };

  return (
    <Link key={product.id} href={`/products/${product.id}`}>
      <div
        className={`bg-white rounded-[25px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col ${theme.borderColor}`}
      >
        <div className="relative overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Badge trạng thái cho sản phẩm thông thường */}
          {product.status && !isTransportService && !isProject && (
            <div
              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                product.status === "CÓ SẴN"
                  ? "bg-green-600"
                  : product.status === "ĐẶT TRƯỚC"
                  ? "bg-blue-600"
                  : product.status === "BÁN SỈ"
                  ? "bg-purple-600"
                  : product.status === "HOT"
                  ? "bg-red-500"
                  : product.status === "MỚI"
                  ? "bg-orange-500"
                  : "bg-gray-600"
              }`}
            >
              {product.status}
            </div>
          )}

          {/* Badge loại (DỊCH VỤ/DỰ ÁN) */}
          {(isTransportService || isProject) && (
            <div
              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${theme.badgeBg}`}
            >
              {theme.badgeText}
            </div>
          )}

          {/* Badge thương hiệu */}
          <div
            className={`absolute ${
              isTransportService || isProject ? "top-14" : "top-3"
            } left-3 px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white shadow-lg flex items-center gap-1`}
          >
            {theme.icon}
            <span>{product.brand || "Unknown"}</span>
          </div>
        </div>

        <div className="p-5 flex-grow flex flex-col">
          {/* Category với màu sắc riêng */}
          {product.category && (
            <div className="mb-3">
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full ${theme.categoryBg} ${theme.categoryText}`}
              >
                {product.category}
              </span>
            </div>
          )}

          {/* Tên sản phẩm */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* Mô tả - FIXED HEIGHT */}
          {product.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow-0">
              {product.description}
            </p>
          )}

          {/* Khung đặc điểm riêng - ĐỒNG BỘ KÍCH THƯỚC */}
          {(isTransportService || isProject) && (
            <div
              className={`mb-4 p-3 rounded-lg border ${theme.serviceBg} ${theme.serviceBorder} flex-grow-0`}
            >
              {isTransportService ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Truck className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-blue-700">Vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-blue-700">
                      Hỗ trợ đóng gói & bốc xếp
                    </span>
                  </div>
                </div>
              ) : isProject ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-purple-700">
                      Thời gian: {product.projectDuration || "6-12 tháng"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-purple-700">
                      Quy mô: {product.projectScale || "Trung bình"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Giá và nút hành động - Luôn ở cuối */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-bold ${theme.priceColor}`}>
                  {formatPrice()}
                </span>
                {product.oldPrice && !isTransportService && !isProject && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.unit && (
                <p className="text-xs text-gray-500 mt-1">
                  Đơn vị: {getUnitDisplay()}
                </p>
              )}
            </div>
            <button
              className={`w-9 h-9 ${theme.buttonBg} rounded-lg flex items-center justify-center transition-colors shadow-sm flex-shrink-0`}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              title={
                isTransportService
                  ? "Đặt dịch vụ"
                  : isProject
                  ? "Xem dự án"
                  : "Thêm vào giỏ hàng"
              }
            >
              {isTransportService ? (
                <Truck className="w-4 h-4 text-white" />
              ) : isProject ? (
                <Building className="w-4 h-4 text-white" />
              ) : (
                <ShoppingCart className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
