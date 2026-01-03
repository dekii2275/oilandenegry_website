"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, MapPin, Package, ShoppingBag, QrCode } from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";

export const dynamic = "force-dynamic";

const formatVND = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " đ";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("zenergy_token") ||
  localStorage.getItem("accessToken") ||
  "";

type PaymentMethod = "COD" | "QR";

interface ApiOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: string | number;
  line_total: string | number;
}

interface ApiOrder {
  order_id: number;
  user_id: number;
  status: string;
  payment_method: PaymentMethod;
  shipping_address: string;
  created_at: string;

  subtotal: string | number;
  shipping_fee: string | number;
  tax: string | number;
  total_amount: string | number;

  items: ApiOrderItem[];
}

function toNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function paymentLabel(pm: PaymentMethod) {
  return pm === "QR" ? "Thanh toán mã QR" : "Tiền mặt khi nhận hàng";
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng!", { duration: 4000 });
      router.push("/cart");
      return;
    }

    (async () => {
      try {
        setIsLoading(true);

        const token = getToken();
        if (!token) {
          toast.error("Bạn cần đăng nhập để xem đơn hàng", { duration: 3000 });
          router.push("/login");
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiBase}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const data = (await res.json().catch(() => null)) as ApiOrder | null;

        if (!res.ok) {
          toast.error((data as any)?.detail || "Không lấy được thông tin đơn hàng", { duration: 4000 });
          router.push("/cart");
          return;
        }

        if (!data || !data.order_id) {
          toast.error("Dữ liệu đơn hàng không hợp lệ", { duration: 4000 });
          router.push("/cart");
          return;
        }

        setOrder(data);
      } catch (e) {
        console.error(e);
        toast.error("Có lỗi xảy ra khi tải đơn hàng", { duration: 4000 });
        router.push("/cart");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [searchParams, router]);

  if (isLoading || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = toNumber(order.subtotal);
  const shippingFee = toNumber(order.shipping_fee);
  const tax = toNumber(order.tax);
  const total = toNumber(order.total_amount);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-green-50 border border-green-100 rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">🎉 Đặt hàng thành công!</h1>
            <p className="text-gray-600 max-w-2xl">
              Cảm ơn bạn đã đặt hàng tại ZEnergy. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
            </p>

            <div className="bg-white rounded-2xl border border-green-100 px-6 py-4 mt-2 w-full max-w-xl">
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-lg md:text-xl font-extrabold text-green-700 break-all">{order.order_id}</p>
              <p className="text-sm text-gray-500 mt-2">Ngày đặt: {formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Chi tiết đơn hàng</h2>

              <div className="space-y-4">
                {order.items?.map((item, idx) => {
                  const unit = toNumber(item.price);
                  const line = toNumber(item.line_total);
                  return (
                    <div
                      key={`${item.product_id}-${idx}`}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                          <Package className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.product_name || `Sản phẩm #${item.product_id}`}</p>
                          <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {item.quantity} × {formatVND(unit)}
                        </p>
                        <p className="text-lg font-black text-green-600">{formatVND(line)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Giao hàng & Thanh toán</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-800">{order.shipping_address || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <QrCode size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                    <p className="font-medium text-gray-800">{paymentLabel(order.payment_method)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt thanh toán</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-bold text-gray-800">{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-bold text-gray-800">{formatVND(shippingFee)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">{formatVND(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-green-600">{formatVND(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tiếp theo</h2>
              <div className="space-y-3">
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

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
              <h3 className="font-bold text-gray-800 mb-3">📞 Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">Đội ngũ hỗ trợ sẵn sàng giúp bạn.</p>
              <div className="space-y-2">
                <p className="text-sm">
                  📧 Email:{" "}
                  <a href="mailto:support@zenergy.com" className="text-green-600 font-medium">
                    support@zenergy.com
                  </a>
                </p>
                <p className="text-sm">
                  📱 Hotline:{" "}
                  <a href="tel:+842471234567" className="text-green-600 font-medium">
                    0247 123 4567
                  </a>
                </p>
                <p className="text-sm">🕒 8:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <Header />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
