// app/(customer)/products/[id]/components/ProductGallery.tsx
"use client";

import React from "react";

interface ProductGalleryProps {
  images: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  selectedImage,
  onImageSelect,
}) => {
  return (
    <div>
      {/* Main Image */}
      <div className="bg-white rounded-lg overflow-hidden mb-4 relative">
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            Giảm 15%
          </span>
        </div>
        <img
          src={images[selectedImage]}
          alt="Main product"
          className="w-full h-96 object-cover"
        />
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => onImageSelect(idx)}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
              selectedImage === idx ? "border-green-600" : "border-gray-200"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-24 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
