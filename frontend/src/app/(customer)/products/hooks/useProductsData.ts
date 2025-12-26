// frontend/src/app/(customer)/products/hooks/useProductsData.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { productsService } from "@/services/products.service";
import type { Product, ProductListParams } from "@/types/product";
import {
  adaptProductForUI,
  mockCategories,
  mockSuppliers,
  mockProducts,
  sortOptions,
} from "../utils/productUtils";

interface FilterState {
  selectedCategories: string[];
  selectedSuppliers: string[];
  minPrice: string;
  maxPrice: string;
  searchQuery: string;
  sortBy: string;
}

export const useProductsData = () => {
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortLabel, setSortLabel] = useState<string>("Mặc định");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState(mockCategories);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const itemsPerPage = 9;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Xử lý chọn danh mục
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat) => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
    setCurrentPage(1);
  };

  // Xử lý chọn nhà cung cấp
  const handleSupplierSelect = (supplierName: string) => {
    setSelectedSuppliers((prev) => {
      if (prev.includes(supplierName)) {
        return prev.filter((sup) => sup !== supplierName);
      } else {
        return [...prev, supplierName];
      }
    });
    setCurrentPage(1);
  };

  // Xử lý tìm kiếm
  const handleSearch = (searchText: string) => {
    setSearchQuery(searchText);
    setCurrentPage(1);
  };

  // Xử lý sort
  const handleSort = (optionValue: string, optionLabel: string) => {
    setSortBy(optionValue);
    setSortLabel(optionLabel);
    setIsSortOpen(false);
    setCurrentPage(1);
  };

  // Filter trên mock data
  const filterMockData = useCallback(() => {
    let filteredProducts = [...mockProducts];

    // Filter by category
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        return (
          product.category && selectedCategories.includes(product.category)
        );
      });
    }

    // Filter by supplier
    if (selectedSuppliers.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        return (
          product.store?.name && selectedSuppliers.includes(product.store.name)
        );
      });
    }

    // Filter by price
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filteredProducts = filteredProducts.filter(
          (product) => (product.price || 0) >= min
        );
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filteredProducts = filteredProducts.filter(
          (product) => (product.price || 0) <= max
        );
      }
    }

    // Filter by search
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filteredProducts.sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aName = a.name || "";
      const bName = b.name || "";

      const aId = typeof a.id === "string" ? parseInt(a.id) : a.id;
      const bId = typeof b.id === "string" ? parseInt(b.id) : b.id;

      switch (sortBy) {
        case "price-asc":
          return aPrice - bPrice;
        case "price-desc":
          return bPrice - aPrice;
        case "name-asc":
          return aName.localeCompare(bName);
        case "name-desc":
          return bName.localeCompare(aName);
        case "newest":
          return bId - aId;
        case "oldest":
          return aId - bId;
        case "discount":
          const discountA = a.old_price
            ? ((a.old_price - aPrice) / a.old_price) * 100
            : 0;
          const discountB = b.old_price
            ? ((b.old_price - bPrice) / b.old_price) * 100
            : 0;
          return discountB - discountA;
        default:
          return 0;
      }
    });

    return filteredProducts;
  }, [
    selectedCategories,
    selectedSuppliers,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const filteredProducts = filterMockData();
    setTotalProducts(filteredProducts.length);

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
  }, [filterMockData, currentPage]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSuppliers([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortBy("default");
    setSortLabel("Mặc định");
    setCurrentPage(1);
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load mock data
  const loadMockData = () => {
    setCategories(mockCategories);
    setSuppliers(mockSuppliers);
    setTotalProducts(mockProducts.length);

    // Tính toán phân trang ban đầu
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const initialProducts = mockProducts.slice(startIndex, endIndex);
    setProducts(initialProducts);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/products
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const productsRes = await fetch(`${baseUrl}/api/products?limit=12`);

        if (!productsRes.ok) {
          throw new Error("Không thể kết nối đến backend");
        }

        const backendProducts = await productsRes.json();

        const transformedProducts: Product[] = backendProducts.map(
          (backendProduct: any) => ({
            id: backendProduct.id,
            name: backendProduct.name,
            brand: backendProduct.store_name || "Unknown",
            category: backendProduct.category,
            description: backendProduct.description,
            price: backendProduct.price || 0,
            unit: "chiếc",
            image: backendProduct.image_url || "/api/placeholder/400/300",
            store_name: backendProduct.store_name,
            store: { name: backendProduct.store_name },
          })
        );

        // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/categories
        const categoriesRes = await fetch(`${baseUrl}/api/categories`);
        const categoriesData = categoriesRes.ok
          ? await categoriesRes.json()
          : [];

        // 🔴 BACKEND API CẦN HỖ TRỢ: GET /api/suppliers
        const suppliersRes = await fetch(`${baseUrl}/api/suppliers`);
        const suppliersData = suppliersRes.ok ? await suppliersRes.json() : [];

        setCategories(
          categoriesData.length > 0 ? categoriesData : mockCategories
        );
        setSuppliers(suppliersData.length > 0 ? suppliersData : mockSuppliers);

        if (transformedProducts.length > 0) {
          setTotalProducts(transformedProducts.length);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedProducts = transformedProducts.slice(
            startIndex,
            endIndex
          );
          setProducts(paginatedProducts);
        } else {
          loadMockData();
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu từ server");
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters khi filter thay đổi
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [
    selectedCategories,
    selectedSuppliers,
    sortBy,
    searchQuery,
    currentPage,
    applyFilters,
    loading,
  ]);

  // Tính toán số trang
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  return {
    // Data
    products: products.map(adaptProductForUI),
    categories,
    suppliers,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    startItem,
    endItem,

    // Filter states
    filterState: {
      selectedCategories,
      selectedSuppliers,
      minPrice,
      maxPrice,
      searchQuery,
      sortBy,
    },

    // Sort
    sortOptions,
    sortLabel,
    isSortOpen,

    // Actions
    updateFilter: (updates: any) => {
      if (updates.selectedCategories !== undefined)
        setSelectedCategories(updates.selectedCategories);
      if (updates.selectedSuppliers !== undefined)
        setSelectedSuppliers(updates.selectedSuppliers);
      if (updates.minPrice !== undefined) setMinPrice(updates.minPrice);
      if (updates.maxPrice !== undefined) setMaxPrice(updates.maxPrice);
      if (updates.searchQuery !== undefined)
        setSearchQuery(updates.searchQuery);
      if (updates.sortBy !== undefined) setSortBy(updates.sortBy);
      setCurrentPage(1);
    },
    clearAllFilters,
    handleSort,
    handlePageChange,
    setIsSortOpen,
    handleSearch,
    handleCategorySelect,
    handleSupplierSelect,
    setMinPrice,
    setMaxPrice,

    // Cart
    addToCart: (product: Product) => {
      console.log("Add to cart:", product.name);
    },
  };
};
