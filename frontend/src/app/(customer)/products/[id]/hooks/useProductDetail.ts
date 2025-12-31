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
  
  // State UI
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews" | "shipping">("description");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState<NewReview>({ title: "", comment: "", rating: 5 });
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>({ rating: 0, sortBy: "newest" });
  const [displayedReviews, setDisplayedReviews] = useState(3);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!baseUrl) {
            console.error("Thiếu biến môi trường NEXT_PUBLIC_API_URL");
            setError("Lỗi cấu hình hệ thống");
            return;
        }

        const response = await fetch(`${baseUrl}/products/${productId}`);
        
        if (!response.ok) {
           throw new Error("Không thể tải thông tin sản phẩm");
        }

        const data = await response.json();
        
        // --- MAP DỮ LIỆU ĐẦY ĐỦ (FULL FIELDS) ---
        // Bổ sung đầy đủ technicalDetails và supplier để tránh lỗi undefined
        const productFromApi: ProductDetail = {
            id: data.id,
            name: data.name,
            brand: data.brand || data.store?.store_name || "No Brand",
            price: Number(data.variants?.[0]?.price || 0),
            oldPrice: Number(data.variants?.[0]?.market_price || 0),
            rating: data.rating_average || 0,
            reviewCount: data.review_count || 0,
            status: data.is_active ? "CÓ SẴN" : "HẾT HÀNG",
            
            // Xử lý ảnh
            images: data.image_url 
                ? [data.image_url] 
                : ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"],
            
            description: data.description || "Đang cập nhật mô tả...",
            
            // --- FIX 1: THÔNG SỐ KỸ THUẬT ---
            technicalDetails: {
                brand: data.brand || "Đang cập nhật",
                model: data.variants?.[0]?.sku || "N/A",
                warranty: data.warranty || "12 tháng",
                origin: data.origin || "Việt Nam",
            },
            
            // --- FIX 2: NHÀ CUNG CẤP (SUPPLIER) ---
            // Thêm trường này để fix lỗi reading 'name' of undefined
            supplier: {
                id: data.store?.id || 1,
                name: data.store?.store_name || "Z-Energy Official",
                logo: "/images/default-store.png", // Logo mặc định
                slug: "z-energy-store" // Slug mặc định
            },

            // Các trường khác
            specifications: data.specifications || {}, 
            features: [
               "Bảo hành chính hãng",
               "Giao hàng toàn quốc",
               "Hỗ trợ kỹ thuật 24/7"
            ],
            sku: data.variants?.[0]?.sku || "N/A",
            category: data.category || "Điện mặt trời"
        };
        
        setProduct(productFromApi);

        // Reset phần chưa có API
        setReviews([]); 
        setRelatedProducts([]);

      } catch (err) {
        console.error("Lỗi fetch detail:", err);
        setError("Không thể kết nối Server AWS");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
        fetchProductDetail();
    }
  }, [productId]);


  // --- CÁC HÀM XỬ LÝ (QUAN TRỌNG: GIỮ NGUYÊN ĐỂ KHÔNG LỖI LOGIC) ---

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

  const handleAddToCart = () => {
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleRequestQuote = () => {
      alert("Yêu cầu báo giá đã được gửi!");
  };

  const handleToggleWishlist = () => {
      setIsInWishlist(!isInWishlist);
  };

  const handleSubmitReview = () => {
      alert("Cảm ơn đánh giá của bạn!");
      setShowWriteReview(false);
  };

  const loadMoreReviews = () => {};
  const handleReviewScroll = () => {};

  return {
    product,
    reviews,
    relatedProducts,
    loading,
    error,
    selectedImage,
    quantity,
    activeTab,
    showWriteReview,
    newReview,
    loadingMoreReviews: false,
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
    sortedReviewsLength: reviews.length,
  };
};