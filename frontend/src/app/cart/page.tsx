"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  CreditCard,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit: string;
  category: string;
  location?: string;
  slug: string;
  maxStock?: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Lấy giỏ hàng từ localStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("zenergy_cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Đảm bảo mỗi item có quantity tối thiểu là 1
          const validatedCart = parsedCart.map((item: CartItem) => ({
            ...item,
            quantity: Math.max(1, item.quantity || 1),
          }));
          setCartItems(validatedCart);
        } catch (error) {
          console.error("Error loading cart:", error);
          setCartItems([]);
        }
      }
      setIsLoading(false);
    };

    loadCart();

    // Lắng nghe sự kiện cập nhật giỏ hàng
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  // Cập nhật số lượng
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem("zenergy_cart", JSON.stringify(updatedItems));

    // Dispatch event để cập nhật badge
    const totalCount = updatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const event = new CustomEvent("cart-updated", {
      detail: {
        count: totalCount,
        items: updatedItems,
      },
    });
    window.dispatchEvent(event);

    toast.success("Đã cập nhật số lượng!", {
      icon: "✅",
      duration: 2000,
    });
    setIsUpdating(false);
  };

  // Xóa sản phẩm
  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem("zenergy_cart", JSON.stringify(updatedItems));

    const totalCount = updatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const event = new CustomEvent("cart-updated", {
      detail: {
        count: totalCount,
        items: updatedItems,
      },
    });
    window.dispatchEvent(event);

    toast.success("Đã xóa sản phẩm khỏi giỏ hàng!", {
      icon: "🗑️",
      duration: 3000,
    });
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    if (cartItems.length === 0) return;

    setCartItems([]);
    localStorage.removeItem("zenergy_cart");

    const event = new CustomEvent("cart-updated", {
      detail: { count: 0, items: [] },
    });
    window.dispatchEvent(event);

    toast.success("Đã xóa toàn bộ giỏ hàng!", {
      icon: "🔄",
      duration: 3000,
    });
  };

  // Kiểm tra xem đây có phải là đơn hàng đầu tiên không
  const isFirstOrder = () => {
    const existingOrders = JSON.parse(
      localStorage.getItem("zenergy_orders") || "[]"
    );
    return existingOrders.length === 0;
  };

  // Tính tổng
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính phí vận chuyển với giảm giá 20% cho đơn hàng đầu tiên
  const baseShippingFee = totalItems > 0 ? 50 : 0;
  const firstOrderDiscount = isFirstOrder() ? baseShippingFee * 0.2 : 0;
  const shippingFee = Math.max(0, baseShippingFee - firstOrderDiscount);
  const shippingDiscount = firstOrderDiscount;

  const tax = subtotal * 0.1;
  const total = subtotal + shippingFee + tax;

  // Xử lý thanh toán
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống! Vui lòng thêm sản phẩm.", {
        icon: "🛒",
        duration: 4000,
      });
      return;
    }

    // Lưu thông tin đơn hàng để thanh toán
    const checkoutData = {
      items: cartItems,
      subtotal,
      shippingFee,
      shippingDiscount,
      baseShippingFee,
      isFirstOrder: isFirstOrder(),
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("zenergy_checkout", JSON.stringify(checkoutData));

    // Chuyển đến trang thanh toán
    router.push("/cart/checkout");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
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
          <Link
            href="/"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            <span></span> Trang chủ
          </Link>

          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-green-600 font-semibold">Giỏ Hàng</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <ShoppingCart className="text-green-600" size={28} />
                  Giỏ Hàng Của Bạn
                  <span className="text-lg text-gray-500">
                    ({totalItems} sản phẩm)
                  </span>
                </h1>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2 transition-colors"
                    disabled={isUpdating}
                  >
                    <Trash2 size={16} />
                    Xóa tất cả
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="text-gray-400" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Giỏ hàng trống
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá thị
                    trường năng lượng để tìm sản phẩm phù hợp!
                  </p>
                  <Link
                    href="/market"
                    className="inline-flex items-center gap-2 bg-[#71C291] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#5da97b] transition-colors shadow-lg shadow-green-100"
                  >
                    <ArrowLeft size={18} />
                    Khám phá thị trường
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors group"
                    >
                      {/* Product Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center">
                            {item.category?.includes("Dầu") ? (
                              <Package className="text-green-600" size={24} />
                            ) : item.category?.includes("Điện") ? (
                              <div className="text-2xl">⚡</div>
                            ) : (
                              <Package className="text-blue-600" size={24} />
                            )}
                          </div>
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/market/product/${item.slug}`}
                            className="font-bold text-gray-800 hover:text-green-600 transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {item.location || "Toàn cầu"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xl font-black text-gray-800">
                              $
                              {item.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              /{item.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 font-bold text-gray-800 min-w-[40px] text-center bg-gray-50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="text-right min-w-[100px]">
                          <div className="text-lg font-bold text-gray-800">
                            $
                            {(item.price * item.quantity).toLocaleString(
                              "en-US",
                              { minimumFractionDigits: 2 }
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating}
                            className="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="text-blue-600" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800">
                    Giao hàng toàn quốc
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Giao hàng trong 3-7 ngày làm việc với mọi đơn hàng năng lượng
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Shield className="text-green-600" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800">
                    Bảo mật SSL 256-bit
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Thanh toán an toàn với công nghệ mã hóa tiên tiến nhất
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800">Hỗ trợ 24/7</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Đội ngũ kỹ thuật năng lượng luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            {/* First Order Discount Banner */}
            {isFirstOrder() && cartItems.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-800 mb-1">
                      Ưu đãi đặc biệt!
                    </h4>
                    <p className="text-sm text-green-700">
                      Bạn được giảm <span className="font-black">20%</span> phí
                      vận chuyển cho đơn hàng đầu tiên!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" />
                Tóm tắt đơn hàng
              </h3>

              {/* Order Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">
                    Tạm tính ({totalItems} sản phẩm)
                  </span>
                  <span className="font-bold text-gray-800">
                    $
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex flex-col">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    {isFirstOrder() && shippingDiscount > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        🎉 Giảm 20% cho đơn hàng đầu tiên!
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {isFirstOrder() && shippingDiscount > 0 ? (
                      <div>
                        <span className="text-sm text-gray-400 line-through mr-2">
                          ${baseShippingFee.toFixed(2)}
                        </span>
                        <span className="font-bold text-gray-800">
                          ${shippingFee.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-800">
                        {shippingFee > 0
                          ? `$${shippingFee.toFixed(2)}`
                          : "Miễn phí"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">
                    ${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-green-600">
                      $
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isUpdating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 disabled:hover:from-green-500 disabled:hover:to-emerald-600"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  "Tiến hành thanh toán"
                )}
              </button>

              {/* Continue Shopping */}
              <Link
                href="/market"
                className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-green-500 text-green-600 font-bold py-4 rounded-xl hover:bg-green-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Tiếp tục mua sắm
              </Link>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      🛡️ Thanh toán an toàn
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Thông tin thanh toán được mã hóa và bảo mật theo tiêu
                      chuẩn PCI DSS
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-6 text-center">
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
