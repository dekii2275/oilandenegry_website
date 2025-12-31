"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ShoppingBag,
  ChevronRight,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

interface OrderData {
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    taxCode: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  status: string;
}

// 1. Tách logic chính ra Component con
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      toast.error("Không tìm thấy thông tin đơn hàng!", {
        duration: 4000,
      });
      router.push("/cart");
      return;
    }

    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem("zenergy_orders") || "[]");
    const foundOrder = orders.find((o: OrderData) => o.orderId === orderId);

    if (!foundOrder) {
      toast.error("Đơn hàng không tồn tại!", {
        duration: 4000,
      });
      router.push("/cart");
      return;
    }

    setOrder(foundOrder);
    setIsLoading(false);
  }, [searchParams, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    toast.success("Hóa đơn đang được tải xuống...", {
      icon: "📄",
      duration: 3000,
    });
    // In thực tế, bạn sẽ tạo và tải xuống file PDF
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

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
          <Link href="/cart" className="hover:text-green-600 transition-colors">
            Giỏ hàng
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-green-600 font-semibold">
            Xác nhận đơn hàng
          </span>
        </nav>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 mb-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎉 Đặt hàng thành công!
            </h1>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Cảm ơn bạn đã đặt hàng tại ZEnergy. Đơn hàng của bạn đã được tiếp
              nhận và đang được xử lý.
            </p>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-6">
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="text-2xl font-black text-green-600">
                {order.orderId}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>
            <p className="text-gray-600">
              Chúng tôi sẽ gửi email xác nhận đến{" "}
              <span className="font-bold text-gray-800">
                {order.customer.email}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Trạng thái đơn hàng
              </h2>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Đã đặt hàng</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      Hoàn thành
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Đang xử lý</p>
                      <p className="text-sm text-gray-500">
                        Đang chuẩn bị hàng
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">
                      Tiếp theo
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Đang vận chuyển</p>
                      <p className="text-sm text-gray-500">Dự kiến 3-7 ngày</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                      Chờ xử lý
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Đã giao hàng</p>
                      <p className="text-sm text-gray-500">
                        Giao hàng thành công
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                      Chờ xử lý
                    </span>
                  </div>
                </div>

                {/* Timeline connector lines */}
                <div className="absolute left-5 top-10 h-24 w-0.5 bg-green-200"></div>
                <div className="absolute left-5 top-34 h-24 w-0.5 bg-blue-100"></div>
                <div className="absolute left-5 top-58 h-24 w-0.5 bg-gray-200"></div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Chi tiết đơn hàng
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Package className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                      <p className="text-lg font-black text-green-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Thông tin khách hàng
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">U</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {order.customer.name}
                    </p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Điện thoại</p>
                      <p className="font-medium text-gray-800">
                        {order.customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                      <p className="font-medium text-gray-800">
                        {order.customer.address}
                      </p>
                    </div>
                  </div>

                  {order.customer.company && (
                    <div className="flex items-center gap-3">
                      <Home size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Công ty</p>
                        <p className="font-medium text-gray-800">
                          {order.customer.company}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-bold text-gray-800">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-bold text-gray-800">
                    ${order.shippingFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">
                    ${order.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-green-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-3">
                  <p className="text-sm text-gray-500">
                    Phương thức thanh toán:{" "}
                    <span className="font-medium text-gray-800">
                      {order.paymentMethod === "bank_transfer"
                        ? "Chuyển khoản ngân hàng"
                        : order.paymentMethod === "credit_card"
                        ? "Thẻ tín dụng"
                        : "Tiền mặt khi nhận hàng"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tiếp theo bạn muốn làm gì?
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center gap-3 bg-green-50 text-green-700 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <Download size={18} />
                  Tải hóa đơn (PDF)
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-3 bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Printer size={18} />
                  In đơn hàng
                </button>

                <Link
                  href="/market"
                  className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Tiếp tục mua sắm
                </Link>

                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Home size={18} />
                  Về trang chủ
                </Link>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
              <h3 className="font-bold text-gray-800 mb-3">
                📞 Cần hỗ trợ thêm?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  📧 Email:{" "}
                  <a
                    href="mailto:support@zenergy.com"
                    className="text-green-600 font-medium"
                  >
                    support@zenergy.com
                  </a>
                </p>
                <p className="text-sm">
                  📱 Hotline:{" "}
                  <a
                    href="tel:+842471234567"
                    className="text-green-600 font-medium"
                  >
                    0247 123 4567
                  </a>
                </p>
                <p className="text-sm">🕒 Thời gian: 8:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// 2. Component chính bọc Suspense
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}