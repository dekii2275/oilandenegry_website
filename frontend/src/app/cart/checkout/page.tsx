"use client";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + " đ";



import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  ChevronRight,
  Building,
  Wallet,
  Package,
  Loader2,
} from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  slug: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cod">(
    "bank_transfer"
  );
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ✅ Chỉ giữ 3 trường cần thiết
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("zenergy_checkout");
    if (!data) {
      toast.error("Không có thông tin thanh toán! Vui lòng thêm sản phẩm vào giỏ hàng.", {
        duration: 5000,
        icon: "🛒",
      });
      router.push("/cart");
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setCheckoutData(parsedData);

      // Load saved customer info if exists (sanitize chỉ lấy 3 field)
      const savedInfo = localStorage.getItem("zenergy_customer_info");
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setCustomerInfo({
          name: parsed?.name || "",
          phone: parsed?.phone || "",
          address: parsed?.address || "",
        });
      }
    } catch (error) {
      console.error("Error parsing checkout data:", error);
      toast.error("Lỗi tải thông tin thanh toán!", {
        duration: 4000,
        icon: "❌",
      });
      router.push("/cart");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
  try {
    // 0) check form
    const shippingAddress = (customerInfo?.address || "").trim();
    if (shippingAddress.length < 5) {
      toast.error("Vui lòng nhập địa chỉ giao hàng hợp lệ");
      return;
    }

    // 0.1) đồng ý điều khoản (nếu bạn có UI checkbox này)
    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với điều khoản trước khi đặt hàng");
      return;
    }

    setIsProcessing(true);

    // 1) token
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("zenergy_token") ||
      localStorage.getItem("accessToken") ||
      "";

    if (!token) {
      toast.error("Bạn cần đăng nhập trước khi đặt hàng");
      router.push("/login");
      return;
    }

    // 2) payment method: FE -> BE
    // bank_transfer (mã QR) -> QR
    // cod -> COD
    const pm = paymentMethod === "cod" ? "COD" : "QR";

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";

    // 3) call backend create order
    const res = await fetch(`${apiBase}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: shippingAddress,
        payment_method: pm,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(data?.detail || "Đặt hàng thất bại");
      return;
    }

    const orderId = data?.order_id;
    if (!orderId) {
      toast.error("Không nhận được order_id từ server");
      return;
    }

    // lưu lại 3 field customer info (đúng như bạn đang làm)
    localStorage.setItem(
      "zenergy_customer_info",
      JSON.stringify({
        name: customerInfo?.name || "",
        phone: customerInfo?.phone || "",
        address: shippingAddress,
      })
    );

    toast.success("Đặt hàng thành công!");

    // QR -> qua trang quét mã
    if (pm === "QR") {
      router.push(`/cart/qr-payment?orderId=${orderId}`);
    } else {
      // COD -> sang trang thành công luôn
      router.push(`/cart/order-confirmation?orderId=${orderId}`);
    }

  } catch (e) {
    console.error(e);
    toast.error("Có lỗi xảy ra khi đặt hàng");
  } finally {
    setIsProcessing(false);
  }
};



  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
              <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!checkoutData) return null;

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
          <span className="text-green-600 font-semibold">Thanh toán</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin khách hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="0987 654 321"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-green-600" size={24} />
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                {/* Bank transfer */}
                <label
                  className={[
                    "flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                    paymentMethod === "bank_transfer"
                      ? "border-green-500 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="w-5 h-5 text-green-600"
                  />
                  <Building
                    className={
                      paymentMethod === "bank_transfer" ? "text-green-600" : "text-gray-400"
                    }
                    size={24}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-600 mt-1">Thanh toán qua Internet Banking</p>
                  </div>
                  <Shield
                    className={paymentMethod === "bank_transfer" ? "text-green-600" : "text-gray-300"}
                    size={20}
                  />
                </label>

                {/* COD */}
                <label
                  className={[
                    "flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                    paymentMethod === "cod"
                      ? "border-green-500 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="w-5 h-5 text-green-600"
                  />
                  <Wallet
                    className={paymentMethod === "cod" ? "text-green-600" : "text-gray-400"}
                    size={24}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Thanh toán khi nhận hàng</p>
                    <p className="text-sm text-gray-600 mt-1">Trả tiền mặt khi nhận được hàng</p>
                  </div>
                  <Truck
                    className={paymentMethod === "cod" ? "text-green-600" : "text-gray-300"}
                    size={20}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {checkoutData.items.map((item: CheckoutItem) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {formatVND(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-bold text-gray-800">
                    {formatVND(checkoutData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-bold text-gray-800">
                    {formatVND(checkoutData.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">
                    {formatVND(checkoutData.tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-green-600">
                      {formatVND(checkoutData.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <label className="flex items-start gap-3 my-6 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 text-green-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Tôi đồng ý với các điều khoản và điều kiện
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Bằng cách đặt hàng, bạn đồng ý với{" "}
                    <Link href="/terms" className="text-green-600 hover:underline">
                      điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link href="/privacy" className="text-green-600 hover:underline">
                      chính sách bảo mật
                    </Link>{" "}
                    của chúng tôi.
                  </p>
                </div>
              </label>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !agreeTerms}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:hover:from-green-500 disabled:hover:to-emerald-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Đặt hàng an toàn
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">🛡️ Đảm bảo an toàn</p>
                    <p className="text-xs text-green-600 mt-1">
                      Thông tin được mã hóa và bảo mật theo tiêu chuẩn PCI DSS
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Cần hỗ trợ?{" "}
                  <Link href="/contact" className="text-green-600 hover:text-green-700 font-medium">
                    Liên hệ chúng tôi
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
