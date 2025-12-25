// app/(customer)/products/[id]/components/CustomerReviews.tsx
"use client";

import React, { useRef, WheelEventHandler } from "react";
import { Star, Filter, ChevronDown } from "lucide-react";
import { Review, ReviewFilter } from "./types";

interface CustomerReviewsProps {
  reviews: Review[];
  productRating: number;
  totalReviews: number;
  reviewFilter: ReviewFilter;
  loadingMoreReviews: boolean;
  displayedReviews: number;
  sortedReviewsLength: number;
  reviewsRef: React.RefObject<HTMLDivElement>;
  onFilterChange: (filter: ReviewFilter) => void;
  onLoadMoreReviews: () => void;
  onWriteReview: () => void;
  onReviewScroll: WheelEventHandler<HTMLDivElement>;
}

const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
  productRating,
  totalReviews,
  reviewFilter,
  loadingMoreReviews,
  displayedReviews,
  sortedReviewsLength,
  reviewsRef,
  onFilterChange,
  onLoadMoreReviews,
  onWriteReview,
  onReviewScroll,
}) => {
  return (
    <div id="reviews-section" className="bg-white rounded-lg p-6 mb-12">
      <h3 className="text-xl font-bold mb-6">Đánh giá của khách hàng</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                {productRating}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(productRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Dựa trên {totalReviews} đánh giá
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Lọc theo sao:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={reviewFilter.rating}
                  onChange={(e) =>
                    onFilterChange({
                      ...reviewFilter,
                      rating: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="0">Tất cả</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Sắp xếp:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={reviewFilter.sortBy}
                  onChange={(e) =>
                    onFilterChange({
                      ...reviewFilter,
                      sortBy: e.target.value as "newest" | "highest" | "lowest",
                    })
                  }
                >
                  <option value="newest">Mới nhất</option>
                  <option value="highest">Đánh giá cao nhất</option>
                  <option value="lowest">Đánh giá thấp nhất</option>
                </select>
              </div>
            </div>

            <button
              className="w-full py-3 border-2 border-gray-300 rounded-full text-gray-700 font-semibold hover:border-green-600 hover:bg-green-50 transition my-6"
              onClick={onWriteReview}
            >
              Viết đánh giá
            </button>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: "#10B981" }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#10B981" }}
                  >
                    i
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Lưu ý khi đánh giá
                  </p>
                  <p className="text-xs text-gray-600">
                    Để đảm bảo tính minh bạch, tất cả đánh giá đều được kiểm
                    duyệt trước khi hiển thị. Vui lòng chia sẻ trải nghiệm thực
                    tế của bạn về sản phẩm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            ref={reviewsRef}
            className="space-y-6 max-h-[600px] overflow-y-auto pr-4"
            onWheel={onReviewScroll}
            style={{ scrollbarWidth: "thin" }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "#10B981" }}
                  >
                    {review.userAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayedReviews < sortedReviewsLength && (
            <div className="mt-8 text-center">
              <button
                className="text-green-600 font-semibold hover:text-green-700 px-4 py-2 border border-green-600 rounded-full hover:bg-green-50 transition"
                onClick={onLoadMoreReviews}
                disabled={loadingMoreReviews}
              >
                {loadingMoreReviews ? "Đang tải..." : "Xem thêm đánh giá"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
