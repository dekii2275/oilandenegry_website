"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  TrendingUp,
  Users,
  Award,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useSuppliers } from "@/hooks/use-suppliers";
import { suppliersService } from "@/services/suppliers.service";
import type { Supplier } from "@/types/supplier";
import { toast } from "react-hot-toast";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedSuppliers, setRelatedSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!slug) {
        router.push("/suppliers");
        return;
      }

      try {
        setIsLoading(true);

        // Get all suppliers to find by slug
        const allSuppliers = await suppliersService.getSuppliers();
        const foundSupplier = allSuppliers.find(
          (s) => s.name.toLowerCase().replace(/\s+/g, "-") === slug
        );

        if (!foundSupplier) {
          toast.error("Không tìm thấy nhà cung cấp!", {
            duration: 4000,
          });
          router.push("/suppliers");
          return;
        }

        setSupplier(foundSupplier);

        // Get related suppliers (exclude current)
        const related = allSuppliers
          .filter((s) => s.id !== foundSupplier.id && s.is_verified)
          .slice(0, 6);
        setRelatedSuppliers(related);
      } catch (error) {
        console.error("Error fetching supplier:", error);
        toast.error("Có lỗi xảy ra khi tải thông tin nhà cung cấp!", {
          duration: 4000,
        });
        router.push("/suppliers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [slug, router]);

  const getSupplierSlug = (supplier: Supplier) => {
    return supplier.name.toLowerCase().replace(/\s+/g, "-");
  };

  const formatRating = (rating?: number) => {
    if (!rating) return "0.0";
    return rating.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">
                Đang tải thông tin nhà cung cấp...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!supplier) return null;

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
          <Link
            href="/suppliers"
            className="hover:text-green-600 transition-colors"
          >
            Nhà cung cấp
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-green-600 font-semibold truncate max-w-[200px]">
            {supplier.name}
          </span>
        </nav>

        {/* Back Button */}
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        {/* Supplier Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
              {supplier.logo_url || supplier.logo ? (
                <img
                  src={supplier.logo_url || supplier.logo}
                  alt={supplier.name}
                  className="w-full h-full object-contain rounded-3xl"
                />
              ) : (
                <Building2 className="w-16 h-16 text-green-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-gray-800">
                      {supplier.name}
                    </h1>
                    {supplier.is_verified && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                        <CheckCircle className="w-4 h-4" fill="currentColor" />
                        <span className="text-xs font-bold">Đã xác minh</span>
                      </div>
                    )}
                  </div>
                  {supplier.company_name && (
                    <p className="text-lg text-gray-600">
                      {supplier.company_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              {supplier.rating && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(supplier.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-black text-gray-800">
                      {formatRating(supplier.rating)}
                    </span>
                  </div>
                  {supplier.reviews_count && (
                    <span className="text-gray-600">
                      ({supplier.reviews_count} đánh giá)
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {supplier.description && (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {supplier.description}
                </p>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplier.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Địa chỉ
                      </p>
                      <p className="text-gray-800">{supplier.address}</p>
                    </div>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Điện thoại
                      </p>
                      <a
                        href={`tel:${supplier.phone}`}
                        className="text-gray-800 hover:text-green-600 transition-colors"
                      >
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${supplier.email}`}
                        className="text-gray-800 hover:text-green-600 transition-colors"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.created_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Thành lập
                      </p>
                      <p className="text-gray-800">
                        {new Date(supplier.created_at).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Sản phẩm</p>
                <p className="text-2xl font-black text-gray-800">N/A</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                <p className="text-2xl font-black text-gray-800">N/A</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Đánh giá</p>
                <p className="text-2xl font-black text-gray-800">
                  {formatRating(supplier.rating)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Suppliers */}
        {relatedSuppliers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Nhà cung cấp liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedSuppliers.map((relatedSupplier) => (
                <Link
                  key={relatedSupplier.id}
                  href={`/suppliers/${getSupplierSlug(relatedSupplier)}`}
                  className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                      {relatedSupplier.logo_url || relatedSupplier.logo ? (
                        <img
                          src={relatedSupplier.logo_url || relatedSupplier.logo}
                          alt={relatedSupplier.name}
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                        {relatedSupplier.name}
                      </h3>
                      {relatedSupplier.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {formatRating(relatedSupplier.rating)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                      Xem chi tiết
                    </span>
                    <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
