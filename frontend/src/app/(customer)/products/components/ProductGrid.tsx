// frontend/src/app/(customer)/products/components/ProductGrid.tsx
"use client";

import React from "react";
import { Info } from "lucide-react";
import ProductCard from "./ProductCard";
import type { UIProduct } from "../utils/productUtils";

interface ProductGridProps {
  products: UIProduct[];
  onAddToCart: (product: UIProduct) => void;
  onClearFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onClearFilters,
}) => {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-white rounded-[25px] p-8 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-500 mb-4">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn.
          </p>
          <button
            className="text-green-600 hover:text-green-700 font-medium"
            onClick={onClearFilters}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
