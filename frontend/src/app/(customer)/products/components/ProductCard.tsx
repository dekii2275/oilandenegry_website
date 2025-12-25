// frontend/src/app/(customer)/products/components/ProductCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { UIProduct } from "../utils/productUtils";

interface ProductCardProps {
  product: UIProduct;
  onAddToCart: (product: UIProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Link key={product.id} href={`/products/${product.id}`}>
      <div className="bg-white rounded-[25px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {product.status && (
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

          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white shadow-lg">
            {product.brand || "Unknown"}
          </div>
        </div>

        <div className="p-5">
          {product.category && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
          )}

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-green-600">
                  ${product.price?.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.unit && (
                <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
              )}
            </div>
            <button
              className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
