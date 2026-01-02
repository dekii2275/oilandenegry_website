// app/(customer)/products/[id]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Components
import Header from "@/components/layout/Header";
import Footer from "@/components/home/Footer";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductTabs from "./components/ProductTabs";
import CustomerReviews from "./components/CustomerReviews";
import RelatedProducts from "./components/RelatedProducts";
import WriteReviewModal from "./components/WriteReviewModal";

// Custom hook
import { useProductDetail } from "./hooks/useProductDetail";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const {
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
    sortedReviewsLength,
  } = useProductDetail(productId);

  // Xử lý view supplier profile
  const handleViewSupplierProfile = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      document.getElementById("reviews-section")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F0FDF4]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy sản phẩm
          </h1>
          <Link href="/products">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Quay lại danh sách
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/products" className="hover:text-green-600">
              Sản phẩm nổi bật
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images Gallery */}
          <ProductGallery
            images={product.images}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />

          {/* Product Info */}
          <ProductInfo
            product={product}
            quantity={quantity}
            isInWishlist={isInWishlist}
            isLoading={isLoading}
            onQuantityChange={handleQuantityChange}
            onRequestQuote={handleRequestQuote}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onViewSupplierProfile={handleViewSupplierProfile}
          />
        </div>

        {/* Tabs Section */}
        <ProductTabs
          activeTab={activeTab}
          product={product}
          onTabChange={setActiveTab}
        />

        {/* Customer Reviews Section */}
        <CustomerReviews
          reviews={reviews}
          productRating={product.rating}
          totalReviews={product.totalReviews}
          reviewFilter={reviewFilter}
          loadingMoreReviews={loadingMoreReviews}
          displayedReviews={displayedReviews}
          sortedReviewsLength={sortedReviewsLength}
          reviewsRef={reviewsRef}
          onFilterChange={setReviewFilter}
          onLoadMoreReviews={loadMoreReviews}
          onWriteReview={() => setShowWriteReview(true)}
          onReviewScroll={handleReviewScroll}
        />

        {/* Related Products */}
        <RelatedProducts relatedProducts={relatedProducts} />
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteReview}
        product={product}
        newReview={newReview}
        onClose={() => setShowWriteReview(false)}
        onReviewChange={setNewReview}
        onSubmit={handleSubmitReview}
      />

      <Footer />
    </div>
  );
}
