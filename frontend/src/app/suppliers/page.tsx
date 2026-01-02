"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  CheckCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
} from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { Supplier } from "@/types/supplier";
import { toast } from "react-hot-toast";

export default function SuppliersPage() {
  const { suppliers, loading, error } = useSuppliers({ verified: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");

  useEffect(() => {
    let result = [...suppliers];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchLower) ||
          supplier.company_name?.toLowerCase().includes(searchLower) ||
          supplier.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by verified status
    if (showVerifiedOnly) {
      result = result.filter((supplier) => supplier.is_verified);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rating") {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      } else {
        return a.name.localeCompare(b.name, "vi");
      }
    });

    setFilteredSuppliers(result);
  }, [suppliers, searchTerm, showVerifiedOnly, sortBy]);

  const getSupplierSlug = (supplier: Supplier) => {
    return supplier.name.toLowerCase().replace(/\s+/g, "-");
  };

  const formatRating = (rating?: number) => {
    if (!rating) return "0.0";
    return rating.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">
                Đang tải danh sách nhà cung cấp...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-green-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-green-600 font-semibold">Nhà cung cấp</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-4">
            Nhà cung cấp
          </h1>
          <p className="text-gray-600">
            Khám phá danh sách các nhà cung cấp uy tín và đã được xác minh
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  showVerifiedOnly
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CheckCircle size={18} />
                Đã xác minh
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "rating")}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="rating">Sắp xếp theo đánh giá</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy{" "}
            <span className="font-bold text-gray-800">
              {filteredSuppliers.length}
            </span>{" "}
            nhà cung cấp
          </p>
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">
              Không tìm thấy nhà cung cấp
            </p>
            <p className="text-gray-500 text-sm">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${getSupplierSlug(supplier)}`}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] group"
              >
                {/* Supplier Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    {supplier.logo_url || supplier.logo ? (
                      <img
                        src={supplier.logo_url || supplier.logo}
                        alt={supplier.name}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                        {supplier.name}
                      </h3>
                      {supplier.is_verified && (
                        <CheckCircle
                          className="w-5 h-5 text-green-600 flex-shrink-0"
                          fill="currentColor"
                        />
                      )}
                    </div>
                    {supplier.company_name && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {supplier.company_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {supplier.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                      />
                      <span className="font-bold text-gray-800">
                        {formatRating(supplier.rating)}
                      </span>
                    </div>
                    {supplier.reviews_count && (
                      <span className="text-sm text-gray-500">
                        ({supplier.reviews_count} đánh giá)
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {supplier.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{supplier.address}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{supplier.email}</span>
                    </div>
                  )}
                </div>

                {/* View More */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                    Xem chi tiết
                  </span>
                  <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
