import { useState, useEffect } from "react";

// Interface (Giữ nguyên)
interface Product {
  id: number;
  name: string;
  brand: string;
  status: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  image: string;
}

interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedSuppliers: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
}

export function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);
  // Tạm thời hardcode danh mục để không bị lỗi 404
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: "Điện mặt trời" },
    { id: 2, name: "Máy phát điện" }
  ]);
  const [suppliers, setSuppliers] = useState<any[]>([
    { id: 1, name: "GreenTech Solutions" }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State filter
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    selectedCategories: [],
    selectedSuppliers: [],
    minPrice: null,
    maxPrice: null,
    sortBy: "default",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // --- HÀM GỌI API (ĐÃ SỬA) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "/api";

        // CHỈ GỌI API PRODUCTS (Bỏ categories/stores tạm thời để tránh 404)
        const prodRes = await fetch(`${baseUrl}/products/`);

        if (!prodRes.ok) {
          throw new Error(`Lỗi Server: ${prodRes.status}`);
        }

        const prodData = await prodRes.json();

        // Map Products
        const mappedProducts = (Array.isArray(prodData) ? prodData : []).map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand || "No Brand", // Backend trả về store_name
            status: p.is_active ? "CÓ SẴN" : "HẾT HÀNG", 
            category: p.category, 
            description: p.description,
            price: Number(p.price || 0), 
            oldPrice: Number(p.market_price || 0),
            unit: p.unit || "cái",
            // Xử lý ảnh: Nếu null thì dùng placeholder
            image: p.image_url ? p.image_url : "https://via.placeholder.com/300"
        }));

        setProducts(mappedProducts);
        setError(null); // Xóa lỗi nếu thành công

      } catch (err) {
        console.error("Lỗi fetch data:", err);
        setError("Không thể kết nối Server. Vui lòng thử lại sau.");
        // QUAN TRỌNG: KHÔNG GỌI loadMockData() NỮA
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Chạy 1 lần khi mount

  // --- LOGIC FILTER CLIENT-SIDE ---
  // (Giữ nguyên logic lọc ở máy client)
  const filteredProducts = products.filter(p => {
      // 1. Search
      const matchesSearch = p.name.toLowerCase().includes(filterState.searchQuery.toLowerCase());
      // 2. Category
      const matchesCategory = filterState.selectedCategories.length === 0 || 
                              filterState.selectedCategories.includes(p.category);
      // 3. Supplier (Brand)
      const matchesSupplier = filterState.selectedSuppliers.length === 0 || 
                              filterState.selectedSuppliers.includes(p.brand);
      
      return matchesSearch && matchesCategory && matchesSupplier;
  });

  // --- SORTING ---
  const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (filterState.sortBy === "price-asc") return a.price - b.price;
      if (filterState.sortBy === "price-desc") return b.price - a.price;
      return 0;
  });

  // --- PAGINATION ---
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage;
  const endItem = Math.min(startItem + itemsPerPage, totalProducts);
  const currentProducts = sortedProducts.slice(startItem, endItem);

  // Helper update filter
  const updateFilter = (type: string, value: any) => {
     setFilterState(prev => {
        if (type === "search") return { ...prev, searchQuery: value };
        if (type === "category") {
            const newCats = prev.selectedCategories.includes(value) 
                ? prev.selectedCategories.filter(c => c !== value)
                : [...prev.selectedCategories, value];
            return { ...prev, selectedCategories: newCats };
        }
        // ... Thêm các case khác nếu cần
        return prev;
     });
     setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterState({
        searchQuery: "",
        selectedCategories: [],
        selectedSuppliers: [],
        minPrice: null,
        maxPrice: null,
        sortBy: "default",
    });
    setCurrentPage(1);
  };

  return {
    products: currentProducts,
    categories,
    suppliers,
    error,
    loading,
    currentPage,
    totalPages,
    totalProducts,
    startItem,
    endItem,
    filterState,
    sortOptions: [
        { value: "default", label: "Mặc định" },
        { value: "price-asc", label: "Giá tăng dần" },
        { value: "price-desc", label: "Giá giảm dần" }
    ], 
    sortLabel: "Sắp xếp",
    isSortOpen: false, 
    updateFilter,
    clearAllFilters,
    handleSort: (val: string) => setFilterState(prev => ({...prev, sortBy: val})),
    handlePageChange: setCurrentPage,
    setIsSortOpen: () => {},
    addToCart: () => alert("Đã thêm vào giỏ"),
    handleSearch: (val: string) => updateFilter("search", val)
  };
}