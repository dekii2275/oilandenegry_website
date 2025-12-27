"use client";

import { useState, useEffect, useRef } from "react";
import {
  ProductDetail,
  Review,
  RelatedProduct,
  ReviewFilter,
  NewReview,
} from "../components/types";

export const useProductDetail = (productId: string) => {
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