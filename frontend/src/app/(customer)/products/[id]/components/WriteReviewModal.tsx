// app/(customer)/products/[id]/components/WriteReviewModal.tsx
"use client";

import React from "react";
import { Star, X } from "lucide-react";
import { ProductDetail, NewReview } from "./types";

interface WriteReviewModalProps {
  isOpen: boolean;
  product: ProductDetail;
  newReview: NewReview;
  onClose: () => void;
  onReviewChange: (review: NewReview) => void;
  onSubmit: () => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  product,
  newReview,
  onClose,
  onReviewChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Viết đánh giá</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.brand}</p>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Đánh giá của bạn:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onReviewChange({ ...newReview, rating: star })}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= newReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Tiêu đề đánh giá:</label>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ví dụ: Sản phẩm tuyệt vời!"
              value={newReview.title}
              onChange={(e) =>
                onReviewChange({ ...newReview, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Nội dung đánh giá:</label>
            <textarea
              className="w-full h-40 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={newReview.comment}
              onChange={(e) =>
                onReviewChange({ ...newReview, comment: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;
