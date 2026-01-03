import { useState, useEffect, useMemo } from "react";

// Interface (Giữ nguyên)
interface Product {
  id: number;
  name: string;
  brand: string; // UI đang dùng brand để hiển thị supplier -> ta map thành store_name
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

const pickStoreName = (p: any): string => {
  return (
    p?.store_name ||
    p?.store?.store_name ||
    p?.store?.name ||
    p?.supplier?.name ||
    ""
  );
};

export function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);

  // Tạm thời hardcode danh mục để không bị lỗi 404
  const [categories] = useState<any[]>([
    { id: 1, name: "Điện mặt trời" },
    { id: 2, name: "Máy phát điện" },
  ]);

  // Supplier list sẽ được build từ data thật (không còn hardcode 1 cái)
  const [suppliers, setSuppliers] = useState<any[]>([]);

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

  // --- HÀM GỌI API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "/api";

        // CHỈ GỌI API PRODUCTS
        const prodRes = await fetch(`${baseUrl}/products/?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!prodRes.ok) {
          throw new Error(`Lỗi Server: ${prodRes.status}`);
        }

        const prodData = await prodRes.json();

        const rawList: any[] = Array.isArray(prodData)
          ? prodData
          : Array.isArray(prodData?.items)
          ? prodData.items
          : [];

        // Map Products
        const mappedProducts: Product[] = rawList.map((p: any) => {
          const storeName = pickStoreName(p);

          return {
            id: p.id,
            name: p.name,
            // ✅ Ưu tiên store_name -> fallback brand -> fallback cố định (không còn "No Brand")
            brand: storeName || p.brand || "ZEnergy Store",
            status: p.is_active ? "CÓ SẴN" : "HẾT HÀNG",
            // category backend có thể là string hoặc object
            category:
              typeof p.category === "string"
                ? p.category
                : p.category?.name || "Khác",
            description: p.description || "",
            price: Number(p.price || 0),
            oldPrice: Number(p.market_price || 0),
            unit: p.unit || "cái",
            image: p.image_url ? p.image_url : "https://via.placeholder.com/300",
          };
        });

        setProducts(mappedProducts);

        // Build suppliers từ mappedProducts (unique theo brand/storeName)
        const uniq = Array.from(
          new Map(
            mappedProducts
              .map((x) => x.brand)
              .filter(Boolean)
              .map((name, idx) => [name, { id: idx + 1, name }])
          ).values()
        );
        setSuppliers(uniq);

        setError(null);
      } catch (err) {
        console.error("Lỗi fetch data:", err);
        setError("Không thể kết nối Server. Vui lòng thử lại sau.");
        setProducts([]);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIC FILTER CLIENT-SIDE ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search
      const matchesSearch = p.name
        .toLowerCase()
        .includes(filterState.searchQuery.toLowerCase());

      // 2. Category
      const matchesCategory =
        filterState.selectedCategories.length === 0 ||
        filterState.selectedCategories.includes(p.category);

      // 3. Supplier (brand/storeName)
      const matchesSupplier =
        filterState.selectedSuppliers.length === 0 ||
        filterState.selectedSuppliers.includes(p.brand);

      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [products, filterState]);

  // --- SORTING ---
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    arr.sort((a, b) => {
      if (filterState.sortBy === "price-asc") return a.price - b.price;
      if (filterState.sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
    return arr;
  }, [filteredProducts, filterState.sortBy]);

  // --- PAGINATION ---
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage;
  const endItem = Math.min(startItem + itemsPerPage, totalProducts);
  const currentProducts = sortedProducts.slice(startItem, endItem);

  // Helper update filter
  const updateFilter = (type: string, value: any) => {
    setFilterState((prev) => {
      if (type === "search") return { ...prev, searchQuery: value };

      if (type === "category") {
        const newCats = prev.selectedCategories.includes(value)
          ? prev.selectedCategories.filter((c) => c !== value)
          : [...prev.selectedCategories, value];
        return { ...prev, selectedCategories: newCats };
      }

      if (type === "supplier") {
        const newSup = prev.selectedSuppliers.includes(value)
          ? prev.selectedSuppliers.filter((s) => s !== value)
          : [...prev.selectedSuppliers, value];
        return { ...prev, selectedSuppliers: newSup };
      }

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
      { value: "price-desc", label: "Giá giảm dần" },
    ],
    sortLabel: "Sắp xếp",
    isSortOpen: false,
    updateFilter,
    clearAllFilters,
    handleSort: (val: string) =>
      setFilterState((prev) => ({ ...prev, sortBy: val })),
    handlePageChange: setCurrentPage,
    setIsSortOpen: () => {},
    addToCart: () => alert("Đã thêm vào giỏ"),
    handleSearch: (val: string) => updateFilter("search", val),
  };
}
