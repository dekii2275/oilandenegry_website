// frontend/src/app/(customer)/products/page.tsx
"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react"; // 1. Thêm Suspense
import { Search } from "lucide-react";
import Link from "next/link";
// import { useEffect } from "react"; // (Có thể bỏ nếu không dùng trực tiếp ở đây)
// import { useSearchParams } from "next/navigation"; // (Hook useProductsData đã dùng rồi nên ở đây không cần gọi lại cũng được)

// Components
import Header from "@/components/layout/Header";
import Footer from "@/components/home/Footer";
import FilterSidebar from "./components/FilterSidebar";
import SortBar from "./components/SortBar";
import ProductGrid from "./components/ProductGrid";
import Pagination from "./components/Pagination";

// Custom hook
import { useProductsData } from "./hooks/useProductsData";

// 2. Đổi tên component chính thành ProductsContent và bỏ chữ export default
function ProductsContent() {
  const {
    products,
    categories,
    suppliers,
    error,
    currentPage,
    totalPages,
    totalProducts,
    startItem,
    endItem,
    filterState,
    sortOptions,
    sortLabel,
    isSortOpen,
    updateFilter,
    clearAllFilters,
    handleSort,
    handlePageChange,
    setIsSortOpen,
    addToCart,
  } = useProductsData();

  const hasActiveFilters =
    filterState.selectedCategories.length > 0 ||
    filterState.selectedSuppliers.length > 0 ||
    filterState.minPrice !== null ||
    filterState.maxPrice !== null ||
    filterState.searchQuery.trim() !== "" ||
    filterState.sortBy !== "default";

  const onSidebarFilterChange = (updates: any) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateFilter(key, value);
    });
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              Trang chủ
            </Link>
            {" > "}
            <span className="text-gray-900">Sản phẩm nổi bật</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách Sản phẩm
          </h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              value={filterState.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[25px]">
            <p className="text-yellow-800">
              {error} (Đang sử dụng dữ liệu mẫu)
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <FilterSidebar
            categories={categories}
            suppliers={suppliers}
            filterState={filterState as any}
            onFilterChange={onSidebarFilterChange}
            onClearFilters={clearAllFilters}
          />

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Bar */}
            <SortBar
              sortLabel={sortLabel}
              isSortOpen={isSortOpen}
              sortOptions={sortOptions}
              onSortToggle={setIsSortOpen}
              onSortSelect={handleSort}
              currentSort={filterState.sortBy}
              startItem={startItem}
              endItem={endItem}
              totalProducts={totalProducts}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />

            {/* Product Grid */}
            <ProductGrid
              products={products as any}
              onAddToCart={addToCart}
              onClearFilters={clearAllFilters}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// 3. Tạo component chính export default bọc Suspense
export default function ProductsPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}