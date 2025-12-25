// app/(customer)/products/[id]/hooks/useProductDetail.ts
"use client";

import { useState, useEffect, useRef } from "react";
import {
  ProductDetail,
  Review,
  RelatedProduct,
  ReviewFilter,
  NewReview,
} from "../components/types";
import {
  mockProductDetail,
  mockReviews,
  mockRelatedProducts,
} from "../utils/productMockData";

export const useProductDetail = (productId: string) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "shipping"
  >("description");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState<NewReview>({
    title: "",
    comment: "",
    rating: 5,
  });
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>({
    rating: 0,
    sortBy: "newest",
  });
  const [displayedReviews, setDisplayedReviews] = useState(3);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/products/{id}
  // Fetch product detail từ API
  // ============================================================================
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // TODO: Bỏ comment khi backend sẵn sàng
        // const response = await fetch(`${baseUrl}/api/products/${productId}`);
        // if (!response.ok) {
        //   throw new Error("Không thể tải thông tin sản phẩm");
        // }
        // const data = await response.json();
        // setProduct(data.data || data);

        // // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/products/{id}/reviews
        // const reviewsRes = await fetch(`${baseUrl}/api/products/${productId}/reviews`);
        // if (reviewsRes.ok) {
        //   const reviewsData = await reviewsRes.json();
        //   setReviews(reviewsData.reviews || reviewsData.data || reviewsData);
        // } else {
        //   loadMockReviews();
        // }

        // // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/products/{id}/related
        // const relatedRes = await fetch(`${baseUrl}/api/products/${productId}/related`);
        // if (relatedRes.ok) {
        //   const relatedData = await relatedRes.json();
        //   setRelatedProducts(relatedData.products || relatedData.data || relatedData);
        // } else {
        //   loadMockRelatedProducts();
        // }

        // 🟢 TẠM THỜI: Dùng mock data
        setProduct(mockProductDetail(parseInt(productId)));
        setReviews(mockReviews);
        setRelatedProducts(mockRelatedProducts);
      } catch (err) {
        console.error("Lỗi:", err);
        setError("Không thể kết nối backend");
        // Fallback to mock data
        setProduct(mockProductDetail(parseInt(productId)));
        setReviews(mockReviews);
        setRelatedProducts(mockRelatedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/quotes/request
  // Xử lý yêu cầu báo giá
  // ============================================================================
  const handleRequestQuote = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vui lòng đăng nhập để yêu cầu báo giá");
        return;
      }

      // TODO: Bỏ comment khi backend sẵn sàng
      // const response = await fetch(`${baseUrl}/api/quotes/request`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     product_id: productId,
      //     product_name: product?.name,
      //     quantity: quantity,
      //     unit_price: product?.price,
      //     total_price: product ? product.price * quantity : 0,
      //     notes: "Yêu cầu báo giá chi tiết",
      //   }),
      // });

      // if (response.ok) {
      //   alert("Yêu cầu báo giá đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.");
      // } else {
      //   throw new Error("Gửi yêu cầu thất bại");
      // }

      // 🟢 TẠM THỜI: Mock success
      alert(
        "Yêu cầu báo giá đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
      );
    } catch (error) {
      console.error("Lỗi yêu cầu báo giá:", error);
      alert("Không thể gửi yêu cầu báo giá. Vui lòng thử lại.");
    }
  };

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/cart/add
  // Thêm vào giỏ hàng
  // ============================================================================
  const handleAddToCart = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
        return;
      }

      // TODO: Bỏ comment khi backend sẵn sàng
      // const response = await fetch(`${baseUrl}/api/cart/add`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     product_id: productId,
      //     product_name: product?.name,
      //     quantity: quantity,
      //     unit_price: product?.price,
      //     image: product?.images[0],
      //   }),
      // });

      // if (response.ok) {
      //   alert("Sản phẩm đã được thêm vào giỏ hàng!");
      // } else {
      //   throw new Error("Thêm vào giỏ hàng thất bại");
      // }

      // 🟢 TẠM THỜI: Mock success
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/wishlist/add và DELETE /api/wishlist/remove
  // Toggle wishlist
  // ============================================================================
  const handleToggleWishlist = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vui lòng đăng nhập để thêm vào yêu thích");
        return;
      }

      if (isInWishlist) {
        // TODO: Bỏ comment khi backend sẵn sàng
        // const response = await fetch(`${baseUrl}/api/wishlist/remove`, {
        //   method: "DELETE",
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     product_id: productId,
        //   }),
        // });

        // if (response.ok) {
        setIsInWishlist(false);
        alert("Đã xóa khỏi danh sách yêu thích");
        // }
      } else {
        // TODO: Bỏ comment khi backend sẵn sàng
        // const response = await fetch(`${baseUrl}/api/wishlist/add`, {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     product_id: productId,
        //     product_name: product?.name,
        //     price: product?.price,
        //     image: product?.images[0],
        //   }),
        // });

        // if (response.ok) {
        setIsInWishlist(true);
        alert("Đã thêm vào danh sách yêu thích");
        // }
      }
    } catch (error) {
      console.error("Lỗi wishlist:", error);
      alert("Không thể thực hiện thao tác. Vui lòng thử lại.");
    }
  };

  // Các hàm helper
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const loadMoreReviews = () => {
    setLoadingMoreReviews(true);
    setTimeout(() => {
      const additionalReviews: Review[] = [
        {
          id: reviews.length + 1,
          userName: "Nguyễn Văn C",
          userAvatar: "NC",
          rating: 5,
          date: "05/02/2025",
          title: "Sản phẩm chất lượng cao",
          comment: "Hệ thống hoạt động rất ổn định, tiết kiệm điện tốt.",
        },
      ];
      setReviews([...reviews, ...additionalReviews]);
      setDisplayedReviews((prev) => prev + 3);
      setLoadingMoreReviews(false);
    }, 1000);
  };

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/products/{id}/reviews
  // Submit review
  // ============================================================================
  const handleSubmitReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung đánh giá");
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      // TODO: Bỏ comment khi backend sẵn sàng
      // const response = await fetch(`${baseUrl}/api/products/${productId}/reviews`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     title: newReview.title,
      //     comment: newReview.comment,
      //     rating: newReview.rating,
      //     user_id: "current_user_id",
      //   }),
      // });

      // if (response.ok) {
      const newReviewData: Review = {
        id: reviews.length + 1,
        userName: "Bạn",
        userAvatar: "B",
        rating: newReview.rating,
        date: new Date().toLocaleDateString("vi-VN"),
        title: newReview.title,
        comment: newReview.comment,
      };

      setReviews([newReviewData, ...reviews]);
      setNewReview({ title: "", comment: "", rating: 5 });
      setShowWriteReview(false);
      alert("Đánh giá đã được gửi thành công!");
      // } else {
      //   throw new Error("Gửi đánh giá thất bại");
      // }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      alert("Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  // Filter và sort reviews
  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter.rating === 0) return true;
    return review.rating === reviewFilter.rating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewFilter.sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (reviewFilter.sortBy === "highest") {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const displayedReviewsList = sortedReviews.slice(0, displayedReviews);

  const handleReviewScroll = (e: React.WheelEvent) => {
    if (reviewsRef.current) {
      e.stopPropagation();
      reviewsRef.current.scrollTop += e.deltaY;
    }
  };

  return {
    product,
    reviews: displayedReviewsList,
    relatedProducts,
    loading,
    error,
    selectedImage,
    quantity,
    activeTab,
    showWriteReview,
    newReview,
    loadingMoreReviews,
    reviewFilter,
    displayedReviews,
    isInWishlist,
    reviewsRef,
    setSelectedImage,
    handleQuantityChange,
    setActiveTab,
    setShowWriteReview,
    setNewReview,
    setReviewFilter,
    handleRequestQuote,
    handleAddToCart,
    handleToggleWishlist,
    loadMoreReviews,
    handleSubmitReview,
    handleReviewScroll,
    sortedReviewsLength: sortedReviews.length,
  };
};
