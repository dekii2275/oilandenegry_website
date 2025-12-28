// frontend/src/app/market/product/[slug]/components/ProductMainContent.tsx

import ProductHeaderCard from "./ProductHeaderCard";
import ChartSection from "./ChartSection";
import MarketDetailsSection from "./MarketDetailsSection";
import SidebarStats from "./SidebarStats";
import CTACard from "./CTACard";
import { AlertCircle } from "lucide-react";
import { Product } from "../types";

interface ProductMainContentProps {
  product: Product;
}

export default function ProductMainContent({
  product,
}: ProductMainContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column - Chart & Info (8/12) */}
      <div className="lg:col-span-8 space-y-6">
        <ProductHeaderCard product={product} />
        <ChartSection product={product} />
        <MarketDetailsSection product={product} />
      </div>

      {/* Right Column - Stats & Actions (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        <SidebarStats product={product} />
        <CTACard product={product} />
      </div>

      {/* Warning for demo data */}
      {!product.fromAPI && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                📢 Đây là trang chi tiết sản phẩm thị trường sử dụng dữ liệu mẫu
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Dữ liệu hiển thị được tạo tự động để minh họa. Khi tích hợp với
                backend thực, dữ liệu sẽ được cập nhật theo thời gian thực từ
                các nguồn thị trường.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
