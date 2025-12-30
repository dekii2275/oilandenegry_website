// app/(customer)/products/[id]/hooks/useProductDetail.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
import { useAuth } from "@/app/providers/AuthProvider";

export const useProductDetail = (productId: string) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
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

  // Hàm kiểm tra đăng nhập
  const checkAuthAndRedirect = (actionType: "buy-now" | "add-to-cart") => {
    if (!isAuthenticated) {
      // Lưu thông tin sản phẩm và hành động vào sessionStorage để sau khi login có thể tiếp tục
      if (typeof window !== "undefined" && product) {
        sessionStorage.setItem(
          "pendingAction",
          JSON.stringify({
            type: actionType,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: quantity,
            },
            redirectUrl: window.location.href,
          })
        );
      }

      // Hiển thị thông báo yêu cầu đăng nhập
      if (typeof window !== "undefined") {
        toast.error("Vui lòng đăng nhập để tiếp tục mua hàng!", {
          duration: 4000,
          icon: "🔒",
        });
      }

      // Redirect đến trang đăng nhập với callback URL
      if (typeof window !== "undefined") {
        router.push(
          `/login?redirect=${encodeURIComponent(window.location.href)}`
        );
      }
      return false;
    }
    return true;
  };

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/quotes/request
  // Xử lý yêu cầu báo giá (hoạt động như Mua Ngay - thêm vào giỏ và chuyển đến checkout)
  // ============================================================================
  const handleRequestQuote = async () => {
    if (authLoading) return;
    if (!checkAuthAndRedirect("buy-now")) return;

    setIsLoading(true);
    try {
      if (!product) {
        toast.error("Không tìm thấy thông tin sản phẩm!", {
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      // Tạo cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0] || "/oil.png",
        unit: product.unit,
        category: product.category,
      };

      // Lấy giỏ hàng hiện tại từ localStorage
      const currentCart = JSON.parse(
        localStorage.getItem("zenergy_cart") || "[]"
      );

      // Thêm sản phẩm vào giỏ hàng
      const existingItemIndex = currentCart.findIndex(
        (item: any) => item.id === product.id
      );
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push(cartItem);
      }

      // Lưu lại vào localStorage
      localStorage.setItem("zenergy_cart", JSON.stringify(currentCart));

      // Dispatch event để cập nhật UI
      const event = new CustomEvent("cart-updated", {
        detail: {
          count: currentCart.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ),
        },
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
      }

      // Hiển thị thông báo
      toast.success("Đã thêm vào giỏ hàng!", {
        duration: 3000,
        icon: "🛒",
      });

      // Chờ một chút rồi chuyển đến trang thanh toán
      setTimeout(() => {
        router.push("/cart/checkout");
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi yêu cầu báo giá:", error);
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng!", {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 🔴 BACKEND API CẦN HỖ TRỢ: POST /api/cart/add
  // Thêm vào giỏ hàng
  // ============================================================================
  const handleAddToCart = async () => {
    if (authLoading) return;
    if (!checkAuthAndRedirect("add-to-cart")) return;

    setIsLoading(true);
    try {
      if (!product) {
        toast.error("Không tìm thấy thông tin sản phẩm!", {
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }

      // Tạo cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0] || "/oil.png",
        unit: product.unit,
        category: product.category,
      };

      // Lấy giỏ hàng hiện tại từ localStorage
      const currentCart = JSON.parse(
        localStorage.getItem("zenergy_cart") || "[]"
      );

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItemIndex = currentCart.findIndex(
        (item: any) => item.id === product.id
      );
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
        toast.success("Đã tăng số lượng sản phẩm trong giỏ hàng!", {
          duration: 3000,
          icon: "➕",
        });
      } else {
        currentCart.push(cartItem);
        toast.success("Đã thêm sản phẩm vào giỏ hàng!", {
          duration: 3000,
          icon: "✅",
        });
      }

      // Lưu lại vào localStorage
      localStorage.setItem("zenergy_cart", JSON.stringify(currentCart));

      // Dispatch event để cập nhật badge giỏ hàng
      const event = new CustomEvent("cart-updated", {
        detail: {
          count: currentCart.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ),
        },
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error(error.message || "Có lỗi xảy ra!", {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
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
    isLoading,
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
