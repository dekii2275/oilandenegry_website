// app/products/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import CircleCheckbox from "@/components/ui/CircleCheckbox";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

// Interface cho Category
interface Category {
  id: number;
  name: string;
  slug?: string;
}

// Interface cho Supplier
interface Supplier {
  id: number;
  name: string;
  logo?: string;
}

// Interface cho Product
interface Product {
  id: number;
  name: string;
  brand: string;
  status?: "CÓ SẴN" | "ĐẶT TRƯỚC" | "BÁN SỈ" | "HOT" | "MỚI";
  category?: string;
  description?: string;
  price: number;
  oldPrice?: number;
  unit?: string;
  image: string;
}

// Các option sắp xếp
const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
  { value: "name-desc", label: "Tên: Z-A" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "status", label: "Trạng thái" },
  { value: "category", label: "Danh mục" },
  { value: "brand", label: "Thương hiệu" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "discount", label: "Giảm giá nhiều nhất" },
];

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState<string>("Mặc định");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm xử lý sắp xếp
  const handleSort = (optionValue: string) => {
    const selectedOption = sortOptions.find((opt) => opt.value === optionValue);
    if (selectedOption) {
      setSortBy(selectedOption.label);
    }
    setIsSortOpen(false);
    console.log("Sắp xếp theo:", optionValue);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSortOpen && !target.closest(".sort-dropdown-container")) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  // Fetch data từ backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

        const [categoriesRes, suppliersRes, productsRes] = await Promise.all([
          fetch(`${baseUrl}/categories`),
          fetch(`${baseUrl}/suppliers`),
          fetch(`${baseUrl}/products`),
        ]);

        if (!categoriesRes.ok || !suppliersRes.ok || !productsRes.ok) {
          throw new Error("Không thể kết nối đến backend");
        }

        const categoriesData = await categoriesRes.json();
        const suppliersData = await suppliersRes.json();
        const productsData = await productsRes.json();

        setCategories(categoriesData.data || categoriesData);
        setSuppliers(suppliersData.data || suppliersData);
        setProducts(productsData.data || productsData);
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

  // Mock data fallback
  const loadMockData = () => {
    const mockCategories: Category[] = [
      { id: 1, name: "Điện mặt trời", slug: "dien-mat-troi" },
      { id: 2, name: "Máy phát điện", slug: "may-phat-dien" },
      { id: 3, name: "Dầu thô & Nhiên liệu", slug: "dau-tho-nhien-lieu" },
      { id: 4, name: "Dầu nhớt công nghiệp", slug: "dau-nhot-cong-nghiep" },
      { id: 5, name: "Vận tải & Logistics", slug: "van-tai-logistics" },
      { id: 6, name: "Năng lượng tái tạo", slug: "nang-luong-tai-tao" },
    ];

    const mockSuppliers: Supplier[] = [
      { id: 1, name: "GreenTech Solutions" },
      { id: 2, name: "Global Petroleum" },
      { id: 3, name: "Heavy Duty Power" },
      { id: 4, name: "SolarWorld" },
      { id: 5, name: "Energy Plus" },
      { id: 6, name: "PowerGen International" },
    ];

    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Pin năng lượng mặt trời cao cấp",
        brand: "SolarMax",
        status: "CÓ SẴN",
        category: "Điện mặt trời",
        description: "Công suất cao, hiệu suất lên đến 22%",
        price: 1200,
        oldPrice: 1500,
        unit: "tấm",
        image: "/api/placeholder/400/300",
      },
      {
        id: 2,
        name: "Máy phát điện diesel công nghiệp",
        brand: "PowerGen",
        status: "BÁN SỈ",
        category: "Máy phát điện",
        description: "Công suất 500KVA, vận hành êm ái",
        price: 25000,
        unit: "chiếc",
        image: "/api/placeholder/400/300",
      },
      {
        id: 3,
        name: "Dầu thô WTI",
        brand: "GlobalPetro",
        status: "HOT",
        category: "Dầu thô & Nhiên liệu",
        description: "Dầu thô chất lượng cao, API 40",
        price: 75,
        unit: "thùng",
        image: "/api/placeholder/400/300",
      },
    ];

    setCategories(mockCategories);
    setSuppliers(mockSuppliers);
    setProducts(mockProducts);
  };

  // Trạng thái loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu từ server...</p>
        </div>
      </div>
    );
  }

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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              {error} (Đang sử dụng dữ liệu mẫu)
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
              {categories.length > 0 ? (
                <>
                  <ul className="space-y-3">
                    <li>
                      <CircleCheckbox label="Tất cả" />
                    </li>
                    {categories.map((cat: Category) => (
                      <li key={cat.id}>
                        <CircleCheckbox label={cat.name} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-4">
                    Tổng cộng: {categories.length} danh mục
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải danh mục...</p>
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg p-6 shadow space-y-4">
              <h3 className="font-semibold">Khoảng giá</h3>
              <div className="flex gap-2">
                <input
                  placeholder="$Min"
                  className="w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input
                  placeholder="$Max"
                  className="w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-200 transition">
                Áp dụng
              </button>
            </div>

            {/* Suppliers */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Nhà cung cấp</h3>
              {suppliers.length > 0 ? (
                <>
                  <ul className="space-y-3">
                    {suppliers.map((supplier: Supplier) => (
                      <li key={supplier.id}>
                        <CircleCheckbox label={supplier.name} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-4">
                    Tổng cộng: {suppliers.length} nhà cung cấp
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải nhà cung cấp...</p>
                </div>
              )}
            </div>

            {/* Promotion Banner */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white">
              <div className="text-sm font-medium text-green-400 mb-2">
                ƯU ĐÃI ĐẶC BIỆT
              </div>
              <h3 className="text-lg font-bold mb-3 leading-tight">
                Giảm 20% phí vận chuyển cho đơn hàng đầu tiên
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Áp dụng cho tất cả khách hàng mới
              </p>
              <button className="text-green-400 text-sm font-semibold hover:text-green-300 flex items-center">
                Tìm hiểu ngay →
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {products.length > 0
                    ? `1-${Math.min(6, products.length)}`
                    : "0"}
                </span>{" "}
                trên{" "}
                <span className="font-semibold text-gray-900">
                  {products.length}
                </span>{" "}
                sản phẩm
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>

                {/* Dropdown sắp xếp */}
                <div className="relative sort-dropdown-container">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-green-500 transition bg-white min-w-[180px] justify-between"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                  >
                    <span className="text-sm text-gray-700">{sortBy}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isSortOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {isSortOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                            sortBy === option.label
                              ? "text-green-600 bg-green-50 font-medium"
                              : "text-gray-700"
                          } ${
                            option.value === "default"
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                          onClick={() => handleSort(option.value)}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.label && (
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product: Product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      {/* Ảnh sản phẩm */}
                      <div className="relative overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Status badge */}
                        {product.status && (
                          <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                              product.status === "CÓ SẴN"
                                ? "bg-green-600"
                                : product.status === "ĐẶT TRƯỚC"
                                ? "bg-blue-600"
                                : product.status === "BÁN SỈ"
                                ? "bg-purple-600"
                                : product.status === "HOT"
                                ? "bg-red-500"
                                : product.status === "MỚI"
                                ? "bg-orange-500"
                                : "bg-gray-600"
                            }`}
                          >
                            {product.status}
                          </div>
                        )}

                        {/* Brand badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white shadow-lg">
                          {product.brand}
                        </div>
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="p-5">
                        {/* Category */}
                        {product.category && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          </div>
                        )}

                        {/* Tên sản phẩm */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Mô tả ngắn */}
                        {product.description && (
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Giá và đơn vị */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-xl font-bold text-green-600">
                                ${product.price.toLocaleString()}
                              </span>
                              {product.oldPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  ${product.oldPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.unit && (
                              <p className="text-xs text-gray-500 mt-1">
                                {product.unit}
                              </p>
                            )}
                          </div>
                          <button
                            className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("Add to cart:", product.name);
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {error ? "Sử dụng dữ liệu mẫu" : "Chưa có sản phẩm"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {error
                        ? "Backend chưa sẵn sàng. Dữ liệu sẽ được hiển thị khi kết nối thành công."
                        : "Sản phẩm sẽ được hiển thị tại đây khi có dữ liệu từ hệ thống"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                onClick={() => console.log("Previous page")}
              >
                <span className="text-gray-600">←</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-lg font-medium shadow-sm">
                1
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                onClick={() => console.log("Page 2")}
              >
                <span className="text-gray-600">2</span>
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                onClick={() => console.log("Next page")}
              >
                <span className="text-gray-600">→</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
