"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  ChevronRight,
  CheckCircle,
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
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    taxCode: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("zenergy_checkout");
    if (!data) {
      toast.error(
        "Không có thông tin thanh toán! Vui lòng thêm sản phẩm vào giỏ hàng.",
        {
          duration: 5000,
          icon: "🛒",
        }
      );
      router.push("/cart");
      return;
    }

    try {
      const parsedData = JSON.parse(data);

      // Kiểm tra lại xem đây có phải là đơn hàng đầu tiên không
      const existingOrders = JSON.parse(
        localStorage.getItem("zenergy_orders") || "[]"
      );
      const isFirstOrder = existingOrders.length === 0;

      // Cập nhật lại thông tin giảm giá nếu cần
      if (isFirstOrder && parsedData.baseShippingFee) {
        const shippingDiscount = parsedData.baseShippingFee * 0.2;
        parsedData.shippingFee = Math.max(
          0,
          parsedData.baseShippingFee - shippingDiscount
        );
        parsedData.shippingDiscount = shippingDiscount;
        parsedData.isFirstOrder = true;
      }

      setCheckoutData(parsedData);

      // Load saved customer info if exists
      const savedInfo = localStorage.getItem("zenergy_customer_info");
      if (savedInfo) {
        setCustomerInfo(JSON.parse(savedInfo));
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
    // Validate customer info
    if (!customerInfo.name.trim()) {
      toast.error("Vui lòng nhập họ tên!", {
        icon: "✏️",
      });
      return;
    }
    if (!customerInfo.email.trim()) {
      toast.error("Vui lòng nhập email!", {
        icon: "📧",
      });
      return;
    }
    if (!customerInfo.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!", {
        icon: "📱",
      });
      return;
    }
    if (!customerInfo.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng!", {
        icon: "📍",
      });
      return;
    }
    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với các điều khoản!", {
        icon: "📋",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Save customer info for next time
      localStorage.setItem(
        "zenergy_customer_info",
        JSON.stringify(customerInfo)
      );

      // Create order ID
      const orderId = `ZNRG-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const orderNumber = `#ORD-${new Date().getFullYear()}-${String(
        Date.now()
      ).slice(-6)}`;

      // Format date for Order type (dd/mm/yyyy)
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Create items string for Order type
      const itemsString = checkoutData.items
        .map(
          (item: CheckoutItem) =>
            `${item.name} (${item.quantity} ${item.unit || "cái"})`
        )
        .join(", ");

      // Create order data with full details
      const orderData = {
        orderId,
        order_number: orderNumber,
        customer: customerInfo,
        items: checkoutData.items,
        paymentMethod,
        subtotal: checkoutData.subtotal,
        shippingFee: checkoutData.shippingFee,
        tax: checkoutData.tax,
        total: checkoutData.total,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      // Create Order format for MyOrders component
      const orderForMyOrders = {
        id: orderId,
        order_number: orderNumber,
        created_at: formatDate(new Date()),
        status: "pending" as const,
        total_amount: Math.round(checkoutData.total * 24000), // Convert to VND
        items: itemsString,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
      };

      // Save order to localStorage (simulating API call)
      const existingOrders = JSON.parse(
        localStorage.getItem("zenergy_orders") || "[]"
      );
      existingOrders.push(orderData);
      localStorage.setItem("zenergy_orders", JSON.stringify(existingOrders));

      // Save order in MyOrders format
      const existingMyOrders = JSON.parse(
        localStorage.getItem("zenergy_my_orders") || "[]"
      );
      existingMyOrders.push(orderForMyOrders);
      localStorage.setItem(
        "zenergy_my_orders",
        JSON.stringify(existingMyOrders)
      );

      // Clear cart and checkout data
      localStorage.removeItem("zenergy_cart");
      localStorage.removeItem("zenergy_checkout");

      // Dispatch cart update event
      const event = new CustomEvent("cart-updated", {
        detail: { count: 0, items: [] },
      });
      window.dispatchEvent(event);

      // Show success message
      toast.success(
        <div>
          <p className="font-bold">🎉 Đặt hàng thành công!</p>
          <p className="text-sm">Mã đơn hàng: {orderData.orderId}</p>
        </div>,
        {
          duration: 8000,
          icon: "✅",
        }
      );

      // Redirect to confirmation page with invoice
      setTimeout(() => {
        router.push(
          `/cart/order-confirmation?orderId=${orderData.orderId}&showInvoice=true`
        );
      }, 2000);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Có lỗi xảy ra khi đặt hàng!", {
        duration: 5000,
        icon: "❌",
      });
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Thông tin khách hàng
              </h2>

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
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="example@email.com"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Công ty
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={customerInfo.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Công ty TNHH ABC"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={customerInfo.taxCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="0101234567"
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
                <label className="flex items-center gap-3 p-4 border-2 border-green-500 rounded-xl bg-green-50 cursor-pointer transition-all hover:bg-green-100">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600"
                  />
                  <Building className="text-green-600" size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán qua Internet Banking
                    </p>
                  </div>
                  <Shield className="text-green-600" size={20} />
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 cursor-pointer transition-all hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600"
                  />
                  <CreditCard className="text-gray-400" size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      Thẻ tín dụng/ghi nợ
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Visa, Mastercard, JCB
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 cursor-pointer transition-all hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600"
                  />
                  <Wallet className="text-gray-400" size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      Thanh toán khi nhận hàng
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Trả tiền mặt khi nhận được hàng
                    </p>
                  </div>
                  <Truck className="text-gray-400" size={20} />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt đơn hàng
              </h2>

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
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-bold text-gray-800">
                    ${checkoutData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    {checkoutData.isFirstOrder &&
                      checkoutData.shippingDiscount > 0 && (
                        <span className="text-xs text-green-600 font-medium mt-1">
                          🎉 Giảm 20% cho đơn hàng đầu tiên!
                        </span>
                      )}
                  </div>
                  <div className="text-right">
                    {checkoutData.isFirstOrder &&
                    checkoutData.shippingDiscount > 0 ? (
                      <div>
                        <span className="text-sm text-gray-400 line-through mr-2">
                          $
                          {checkoutData.baseShippingFee?.toFixed(2) ||
                            checkoutData.shippingFee.toFixed(2)}
                        </span>
                        <span className="font-bold text-gray-800">
                          ${checkoutData.shippingFee.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-800">
                        ${checkoutData.shippingFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">
                    ${checkoutData.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-green-600">
                      ${checkoutData.total.toFixed(2)}
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
                    <Link
                      href="/terms"
                      className="text-green-600 hover:underline"
                    >
                      điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link
                      href="/privacy"
                      className="text-green-600 hover:underline"
                    >
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
                    <p className="text-sm text-green-800 font-medium">
                      🛡️ Đảm bảo an toàn
                    </p>
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
                  <Link
                    href="/contact"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
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
