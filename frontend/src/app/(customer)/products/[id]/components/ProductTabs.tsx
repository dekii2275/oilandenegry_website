"use client";

import React from "react";
import Link from "next/link";
import { ProductDetail } from "./types";

interface ProductTabsProps {
  activeTab: "description" | "specs" | "reviews" | "shipping";
  product: ProductDetail;
  onTabChange: (tab: "description" | "specs" | "reviews" | "shipping") => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  product,
  onTabChange,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-12">
      {/* Tab Headers */}
      <div className="border-b mb-6">
        <div className="flex gap-8">
          <button
            className={`pb-4 font-semibold transition ${
              activeTab === "description"
                ? "border-b-2 text-white"
                : "text-gray-600 hover:text-white"
            }`}
            style={
              activeTab === "description"
                ? { borderColor: "#10B981", color: "#10B981" }
                : {}
            }
            onClick={() => onTabChange("description")}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`pb-4 font-semibold transition ${
              activeTab === "specs"
                ? "border-b-2 text-white"
                : "text-gray-600 hover:text-white"
            }`}
            style={
              activeTab === "specs"
                ? { borderColor: "#10B981", color: "#10B981" }
                : {}
            }
            onClick={() => onTabChange("specs")}
          >
            Thông số kỹ thuật
          </button>
          <button
            className={`pb-4 font-semibold transition ${
              activeTab === "reviews"
                ? "border-b-2 text-white"
                : "text-gray-600 hover:text-white"
            }`}
            style={
              activeTab === "reviews"
                ? { borderColor: "#10B981", color: "#10B981" }
                : {}
            }
            onClick={() => onTabChange("reviews")}
          >
            Hồ sơ năng lực nhà cung cấp
          </button>
          <button
            className={`pb-4 font-semibold transition ${
              activeTab === "shipping"
                ? "border-b-2 text-white"
                : "text-gray-600 hover:text-white"
            }`}
            style={
              activeTab === "shipping"
                ? { borderColor: "#10B981", color: "#10B981" }
                : {}
            }
            onClick={() => onTabChange("shipping")}
          >
            Chính sách vận chuyển
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "description" && (
        <div>
          <h3 className="text-xl font-bold mb-4">Tổng quan về Hệ thống</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          <h3 className="text-xl font-bold mb-4">Lợi ích chính</h3>
          <ul className="space-y-3">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700 flex-1">{feature}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-6 p-4 border rounded-lg"
            style={{ backgroundColor: "#F0FDF4", borderColor: "#10B981" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "#10B981" }}
              >
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-sm" style={{ color: "#065F46" }}>
                <strong>Lưu ý lắp đặt:</strong>
                <br />
                GreenTech sẽ bao gồm tất cả dịch vụ tư vấn kỹ thuật, khảo sát
                địa điểm, lắp đặt và vận hành hệ thống. Đội ngũ kỹ sư chuyên môn
                cao với hơn 10 năm kinh nghiệm trong lĩnh vực năng lượng mặt
                trời cho doanh nghiệp và hộ gia đình.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "specs" && (
        <div>
          <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật chi tiết</h3>
          <div className="grid grid-cols-2 gap-4">
            {product.specifications.map((spec, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b">
                <span className="text-gray-600">{spec.label}:</span>
                <span className="font-semibold text-gray-900">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div>
          <h3 className="text-xl font-bold mb-6">
            Hồ sơ năng lực nhà cung cấp
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <h4 className="font-bold text-lg mb-4">Thông tin công ty</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên công ty:</span>
                    <span className="font-semibold">
                      {product.supplier.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Năm thành lập:</span>
                    <span className="font-semibold">2010</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quy mô nhân sự:</span>
                    <span className="font-semibold">50-100 người</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-semibold">Hà Nội, Việt Nam</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số năm kinh nghiệm:</span>
                    <span className="font-semibold">14 năm</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <h4 className="font-bold text-lg mb-4">
                  Chứng chỉ & Giải thưởng
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>ISO 9001:2015 - Quản lý chất lượng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>ISO 14001:2015 - Quản lý môi trường</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>Chứng chỉ Nhà thầu hạng 1 - Lĩnh vực điện</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>Giải thưởng Doanh nghiệp Xanh 2023</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>Top 100 Doanh nghiệp uy tín 2024</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/suppliers/${product.supplier.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}/capability-profile`}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem đầy đủ hồ sơ năng lực
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "shipping" && (
        <div>
          <h3 className="text-xl font-bold mb-6">Chính sách vận chuyển</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold mb-2">Phí vận chuyển</h4>
              <p className="text-gray-600">
                Miễn phí vận chuyển cho đơn hàng từ 10 triệu đồng trở lên. Phí
                vận chuyển từ 100.000đ - 500.000đ tùy khu vực.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold mb-2">Thời gian giao hàng</h4>
              <p className="text-gray-600">
                Khu vực nội thành: 1-3 ngày làm việc
                <br />
                Khu vực ngoại thành: 3-7 ngày làm việc
                <br />
                Vùng sâu vùng xa: 7-14 ngày làm việc
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold mb-2">Lắp đặt & Hỗ trợ</h4>
              <p className="text-gray-600">
                Miễn phí lắp đặt cho đơn hàng từ 20 triệu đồng trở lên. Hỗ trợ
                kỹ thuật 24/7 trong vòng 12 tháng đầu tiên sau lắp đặt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTabs;
