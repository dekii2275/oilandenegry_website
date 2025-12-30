// frontend/src/app/market/product/[slug]/components/MarketDetailsSection.tsx

"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Database,
  CheckCircle,
  Truck,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { Product } from "../types";

interface MarketDetailsSectionProps {
  product: Product;
}

export default function MarketDetailsSection({
  product,
}: MarketDetailsSectionProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  if (
    !product.marketDetails ||
    !product.specifications ||
    !product.shippingInfo
  )
    return null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">
          Thông tin thị trường chi tiết
        </h3>
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
        >
          {showMoreDetails ? "Thu gọn" : "Xem thêm"}
          <ChevronRight
            size={16}
            className={`transition-transform ${
              showMoreDetails ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Cao nhất 24h",
            value: `$${
              typeof product.marketDetails.high24h === "number"
                ? product.marketDetails.high24h.toFixed(2)
                : product.marketDetails.high24h
            }`,
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "Thấp nhất 24h",
            value: `$${
              typeof product.marketDetails.low24h === "number"
                ? product.marketDetails.low24h.toFixed(2)
                : product.marketDetails.low24h
            }`,
            icon: TrendingDown,
            color: "text-red-500",
          },
          {
            label: "Khối lượng",
            value: product.marketDetails.volume,
            icon: BarChart3,
            color: "text-blue-500",
          },
          {
            label: "Vốn hóa",
            value: product.marketDetails.marketCap,
            icon: Database,
            color: "text-purple-500",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <p className="text-xs text-gray-500 font-semibold">
                {stat.label}
              </p>
            </div>
            <p className="text-xl font-black text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* More Details (Conditional) */}
      {showMoreDetails && (
        <div className="pt-6 border-t border-gray-100 space-y-6">
          {/* Specifications */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Thông số kỹ thuật
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(product.specifications).map(
                ([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {value}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-500" />
              Thông tin giao hàng & Thanh toán
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {Object.entries(product.shippingInfo).map(
                  ([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {key === "deliveryTime"
                          ? "Thời gian giao hàng"
                          : key === "minOrder"
                          ? "Đơn hàng tối thiểu"
                          : key === "shippingMethod"
                          ? "Phương thức vận chuyển"
                          : key === "paymentTerms"
                          ? "Điều khoản thanh toán"
                          : "Điều kiện giao hàng"}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-green-600" />
                  Phương thức thanh toán
                </h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Chuyển khoản ngân hàng (T/T)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Thẻ tín dụng (Visa/Mastercard)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Thanh toán online (PayPal, Stripe)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Letter of Credit (L/C)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
