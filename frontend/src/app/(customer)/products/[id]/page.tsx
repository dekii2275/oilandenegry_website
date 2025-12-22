// app/(customer)/products/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface ProductDetail {
  id: number;
  name: string;
  brand: string;
  status: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  rating: number;
  totalReviews: number;
  images: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  features: string[];
  technicalDetails: {
    capacity: string;
    efficiency: string;
    warranty: string;
    power: string;
  };
  benefits: string[];
  supplier: {
    name: string;
    logo?: string;
  };
}

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "shipping"
  >("description");

  // Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

        const response = await fetch(`${baseUrl}/api/products/${productId}`);

        if (!response.ok) {
          throw new Error("Không thể tải thông tin sản phẩm");
        }

        const data = await response.json();
        setProduct(data.data || data);

        // Fetch reviews
        const reviewsRes = await fetch(
          `${baseUrl}/products/${productId}/reviews`
        );
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data || reviewsData);
        }

        // Fetch related products
        const relatedRes = await fetch(
          `${baseUrl}/products/${productId}/related`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.data || relatedData);
        }
      } catch (err) {
        console.error("Lỗi:", err);
        setError("Không thể kết nối backend");
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // Mock data fallback
  const loadMockData = () => {
    const mockProduct: ProductDetail = {
      id: parseInt(productId),
      name: "Hệ thống Điện mặt trời Công nghiệp (50kW)",
      brand: "SunPower Maxeon",
      status: "CÓ HÀNG",
      category: "Năng lượng tái tạo",
      description:
        "Giải pháp năng lượng cao cấp cho nhà xưởng và Năng lượng mặt trời hiệu suất cao, biến đổi quả biến hóa lợi ích thô thành năng lượng sạch bền vững.",
      price: 12450,
      oldPrice: 15850,
      unit: "Bộ trọn gói",
      rating: 4.8,
      totalReviews: 24,
      images: [
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1508818180500-f06dd38d8c21?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
      ],
      specifications: [
        { label: "Năng lượng tái tạo", value: "25 Năm Hiệu suất" },
        { label: "Công suất", value: "50,000 Watt (Peak)" },
      ],
      features: [
        "Tiết kiệm chi phí điện năng: Giảm đến 80% hóa đơn tiền điện hàng tháng cho doanh nghiệp",
        "Hoàn vốn nhanh: Thời gian hoàn vốn dự kiến từ 5-6 năm",
        "Bền bỉ: Tuổi thọ hệ thống lên đến 30 năm với công nghệ thấp",
        "Giảm sát thông minh: Ứng dụng module giám sát qua WiFi/4G, cho phép theo dõi sử dụng điện của hệ thống 24/7 từ xa",
        "Thân thiện môi trường: Giảm phát thải hàng tấn CO2 mỗi năm, góp phần xây dựng tương lai xanh",
      ],
      technicalDetails: {
        capacity: "50kW",
        efficiency: "21-22%",
        warranty: "25 năm",
        power: "50,000W Peak",
      },
      benefits: [
        "Giảm hàng chi phí quốc",
        "Bảo vệ môi trường",
        "Hỗ trợ kỹ thuật 24/7",
      ],
      supplier: {
        name: "GreenTech Solutions",
      },
    };

    const mockReviews: Review[] = [
      {
        id: 1,
        userName: "Hoàng Tùng",
        userAvatar: "HT",
        rating: 5,
        date: "15/12/2024",
        title: "Hiệu suất tuyệt vời, dịch vụ tốt",
        comment:
          "Sản phẩm hoạt động rất ổn định. Sau 3 tháng sử dụng đặt, hóa đơn giảm đáng kể. Thư thầy tôi giới thiệu lại công ty bạn mà cũ giảm nghi đất. Đội ngũ hỗ trợ của GreenTech rất nhiệt tình và chuyên môn nghiệp.",
      },
      {
        id: 2,
        userName: "Minh Anh Corp",
        userAvatar: "MA",
        rating: 5,
        date: "05/01/2025",
        title: "Đáng đầu tư cho nhà xưởng",
        comment:
          "Hệ thống rất ổn định. Không gặp chi phí lượng dừng. Tuy nhiên thời gian lắp đặt hơi dài do yêu cầu kỹ thuật cao.",
      },
      {
        id: 3,
        userName: "Trần Văn Nam",
        userAvatar: "TV",
        rating: 5,
        date: "20/01/2025",
        title: "Giá cả cạnh tranh nhất thị trường",
        comment:
          "Tô đã thâm khảo giá ở nhiều nơi và thấy EnergyMarket cung cấp mức giá tốt nhất cùng chất lượng sản phẩm cao. Máy hoạt động tốt.",
      },
      {
        id: 4,
        userName: "Nguyễn Văn A",
        userAvatar: "NA",
        rating: 4,
        date: "10/01/2025",
        title: "Chất lượng tốt",
        comment:
          "Sản phẩm đúng như mô tả, chất lượng tốt. Nhân viên tư vấn nhiệt tình.",
      },
      {
        id: 5,
        userName: "Lê Thị B",
        userAvatar: "LB",
        rating: 5,
        date: "25/12/2024",
        title: "Rất hài lòng",
        comment:
          "Sau 6 tháng sử dụng, hệ thống hoạt động ổn định, tiết kiệm điện đáng kể.",
      },
    ];

    const mockRelated: RelatedProduct[] = [
      {
        id: 1,
        name: "Panels Solar Inverter 100kw - 3 Phase",
        brand: "GreenTech Solutions",
        price: 1250,
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
      },
      {
        id: 2,
        name: "Máy phát điện dự phòng 100kVA",
        brand: "Heavy Duty Power",
        price: 8500,
        image:
          "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
      },
      {
        id: 3,
        name: "Đầu nạp Công nghiệp (Thông phụ)",
        brand: "Global Petroleum",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1508818180500-f06dd38d8c21?w=400&h=300&fit=crop",
      },
      {
        id: 4,
        name: "Pin lưu trữ Lithium ion 48V-100Ah",
        brand: "Apex Energy",
        price: 1850,
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
      },
    ];

    setProduct(mockProduct);
    setReviews(mockReviews);
    setRelatedProducts(mockRelated);
  };

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
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
            <Link href="/products" className="hover:text-green-600">
              Năng lượng tái tạo
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
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden mb-4 relative">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Giảm 15%
                </span>
              </div>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx
                      ? "border-green-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            {/* Status & Rating */}
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                {product.status}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.rating} từ {product.totalReviews} đánh giá)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-4xl font-bold"
                  style={{ color: "#10B981" }}
                >
                  ${product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${product.oldPrice.toLocaleString()}
                  </span>
                )}
                {/* Sửa: Đơn vị lùi sang phải 3 tab */}
                <span className="ml-12 text-sm text-gray-500">
                  Đơn vị: {product.unit}
                </span>
              </div>
            </div>

            {/* Specifications - 4 items */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Danh mục</p>
                <p className="font-semibold text-gray-900">
                  {product.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Thương hiệu</p>
                <p className="font-semibold text-gray-900">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Bảo hành</p>
                <p className="font-semibold text-gray-900">
                  {product.technicalDetails.warranty}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Công suất</p>
                <p className="font-semibold text-gray-900">
                  {product.technicalDetails.power}
                </p>
              </div>
            </div>

            {/* Supplier */}
            <div
              className="mb-6 p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-gray-700">GT</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhà cung cấp</p>
                <p className="font-semibold">{product.supplier.name}</p>
              </div>
              <button
                className="ml-auto font-semibold hover:underline"
                style={{ color: "#10B981" }}
              >
                Xem hồ sơ
              </button>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  50 sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                className="flex-1 py-4 font-semibold text-white hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ backgroundColor: "#10B981", borderRadius: "9999px" }}
              >
                <ShoppingCart className="w-5 h-5" />
                Yêu cầu báo giá
              </button>
              <button
                className="flex-1 py-4 font-semibold border-2 hover:bg-opacity-10 transition flex items-center justify-center gap-2"
                style={{
                  borderColor: "#10B981",
                  color: "#10B981",
                  borderRadius: "9999px",
                }}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="w-14 h-14 border-2 border-gray-300 flex items-center justify-center hover:border-green-600 hover:bg-green-50 transition"
                style={{ borderRadius: "9999px" }}
              >
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: "#10B981" }}
                />
                <p className="text-xs text-gray-600">Giao hàng toàn quốc</p>
              </div>
              <div className="text-center">
                <Shield
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: "#10B981" }}
                />
                <p className="text-xs text-gray-600">Bảo vệ quyền lợi mua</p>
              </div>
              <div className="text-center">
                <RotateCcw
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: "#10B981" }}
                />
                <p className="text-xs text-gray-600">Hỗ trợ kỹ thuật 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg p-6 mb-12">
          {/* Tab Headers */}
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button
                className={`pb-4 font-semibold transition ${
                  activeTab === "description"
                    ? "border-b-2 text-white"
                    : "text-gray-600 hover:text-white"
                }`}
                style={
                  activeTab === "description"
                    ? { borderColor: "#10B981", color: "#10B981" }
                    : {}
                }
                onClick={() => setActiveTab("description")}
              >
                Mô tả sản phẩm
              </button>
              <button
                className={`pb-4 font-semibold transition ${
                  activeTab === "specs"
                    ? "border-b-2 text-white"
                    : "text-gray-600 hover:text-white"
                }`}
                style={
                  activeTab === "specs"
                    ? { borderColor: "#10B981", color: "#10B981" }
                    : {}
                }
                onClick={() => setActiveTab("specs")}
              >
                Thông số kỹ thuật
              </button>
              <button
                className={`pb-4 font-semibold transition ${
                  activeTab === "reviews"
                    ? "border-b-2 text-white"
                    : "text-gray-600 hover:text-white"
                }`}
                style={
                  activeTab === "reviews"
                    ? { borderColor: "#10B981", color: "#10B981" }
                    : {}
                }
                onClick={() => setActiveTab("reviews")}
              >
                Hồ sơ năng lực nhà cung cấp
              </button>
              <button
                className={`pb-4 font-semibold transition ${
                  activeTab === "shipping"
                    ? "border-b-2 text-white"
                    : "text-gray-600 hover:text-white"
                }`}
                style={
                  activeTab === "shipping"
                    ? { borderColor: "#10B981", color: "#10B981" }
                    : {}
                }
                onClick={() => setActiveTab("shipping")}
              >
                Chính sách vận chuyển
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Tổng quan về Hệ thống</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              <h3 className="text-xl font-bold mb-4">Lợi ích chính</h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700 flex-1">{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-6 p-4 border rounded-lg"
                style={{ backgroundColor: "#F0FDF4", borderColor: "#10B981" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#10B981" }}
                  >
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm" style={{ color: "#065F46" }}>
                    <strong>Lưu ý lắp đặt:</strong>
                    <br />
                    GreenTech sẽ bao gồm tất cả dịch vụ tư vấn kỹ thuật, khảo
                    sát địa điểm, lắp đặt và vận hành hệ thống. Đội ngũ kỹ sư
                    chuyên môn cao với hơn 10 năm kinh nghiệm trong lĩnh vực
                    năng lượng mặt trời cho doanh nghiệp và hộ gia đình.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Thông số kỹ thuật chi tiết
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">{spec.label}:</span>
                    <span className="font-semibold text-gray-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h3 className="text-xl font-bold mb-6">
                Hồ sơ năng lực nhà cung cấp
              </h3>
              <p className="text-gray-600 mb-8">
                Thông tin về nhà cung cấp sẽ được hiển thị tại đây...
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div>
              <h3 className="text-xl font-bold mb-6">Chính sách vận chuyển</h3>

              <div className="space-y-6">
                {/* Shipping Methods */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Phương thức vận chuyển
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Truck
                        className="w-5 h-5 mt-1"
                        style={{ color: "#10B981" }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          Giao hàng tiêu chuẩn
                        </p>
                        <p className="text-sm text-gray-600">
                          Thời gian: 5-7 ngày làm việc
                        </p>
                        <p className="text-sm text-gray-600">
                          Phí: MIỄN PHÍ cho đơn hàng trên $200
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Truck
                        className="w-5 h-5 mt-1"
                        style={{ color: "#10B981" }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          Giao hàng nhanh
                        </p>
                        <p className="text-sm text-gray-600">
                          Thời gian: 2-3 ngày làm việc
                        </p>
                        <p className="text-sm text-gray-600">
                          Phí: $50 - $100 tùy khu vực
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Truck
                        className="w-5 h-5 mt-1"
                        style={{ color: "#10B981" }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          Vận chuyển hàng cồng kềnh
                        </p>
                        <p className="text-sm text-gray-600">
                          Thời gian: 7-10 ngày làm việc
                        </p>
                        <p className="text-sm text-gray-600">
                          Phí: Liên hệ để được báo giá chi tiết
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Areas */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Khu vực giao hàng
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#10B981" }}>✓</span>
                      <span className="text-gray-700">
                        Toàn quốc 63 tỉnh thành
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#10B981" }}>✓</span>
                      <span className="text-gray-700">
                        Ưu tiên giao hàng tại các khu công nghiệp
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#10B981" }}>✓</span>
                      <span className="text-gray-700">
                        Hỗ trợ giao hàng quốc tế (liên hệ để biết thêm chi tiết)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Installation */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Dịch vụ lắp đặt
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Đối với sản phẩm hệ thống năng lượng, chúng tôi cung cấp
                    dịch vụ lắp đặt chuyên nghiệp:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">
                        Khảo sát địa điểm miễn phí
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">
                        Lắp đặt bởi kỹ sư có chứng chỉ
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">
                        Hướng dẫn vận hành và bảo trì
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">
                        Bảo hành dịch vụ lắp đặt 12 tháng
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Return Policy */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Chính sách đổi trả
                  </h4>
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "#F0FDF4" }}
                  >
                    <p className="text-gray-700 mb-2">
                      <strong>Đổi trả trong vòng 30 ngày</strong> nếu sản phẩm:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Lỗi do nhà sản xuất</li>
                      <li>• Không đúng như mô tả</li>
                      <li>• Bị hư hỏng trong quá trình vận chuyển</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-3">
                      Lưu ý: Sản phẩm phải còn nguyên tem, bao bì và chưa qua sử
                      dụng
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-6">
                  <p className="text-gray-600">
                    <strong>Cần hỗ trợ?</strong> Liên hệ hotline:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "#10B981" }}
                    >
                      1900-xxxx
                    </span>{" "}
                    hoặc email:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "#10B981" }}
                    >
                      support@zenergy.com
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews Section - Separate */}
        <div className="bg-white rounded-lg p-6 mb-12">
          {/* Main Title */}
          <h3 className="text-xl font-bold mb-6">Đánh giá của khách hàng</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 1/3 width */}
            <div className="lg:col-span-1">
              {/* Rating Card */}
              <div className="border rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-gray-900 mb-1">
                    {product.rating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Dựa trên {product.totalReviews} đánh giá
                  </p>
                </div>

                {/* Rating Bars */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-6">{star} ★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">
                        {star === 5 ? "80%" : star === 4 ? "15%" : "5%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Button */}
              <button className="w-full py-3 border-2 border-gray-300 rounded-full text-gray-700 font-semibold hover:border-green-600 hover:bg-green-50 transition my-6">
                Viết đánh giá
              </button>

              {/* Note Card with 'i' icon in bordered circle */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: "#10B981" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#10B981" }}
                    >
                      i
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Lưu ý khi đánh giá
                    </p>
                    <p className="text-xs text-gray-600">
                      Để đảm bảo tính minh bạch, tất cả đánh giá đều được kiểm
                      duyệt trước khi hiển thị. Vui lòng chia sẻ trải nghiệm
                      thực tế của bạn về sản phẩm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Reviews List (2/3 width) */}
            <div className="lg:col-span-2">
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b pb-6 last:border-b-0"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: "#10B981" }}
                      >
                        {review.userAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.userName}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {/* HIỂN THỊ NGÀY CỤ THỂ */}
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {review.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {reviews.length > 3 && (
                <div className="mt-8 text-center">
                  <button className="text-green-600 font-semibold hover:text-green-700 px-4 py-2 border border-green-600 rounded-full hover:bg-green-50 transition">
                    Xem thêm đánh giá
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sản phẩm tương tự
            </h2>
            <Link href="/products">
              <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2">
                Xem thêm
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link key={relProduct.id} href={`/products/${relProduct.id}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2">
                      {relProduct.brand}
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {relProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${relProduct.price.toLocaleString()}
                      </span>
                      <button
                        className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Add to cart:", relProduct.name);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
