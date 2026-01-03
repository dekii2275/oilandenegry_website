"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
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

// UI CartItem (theo component đang dùng)
interface CartItem {
  id: string; // map từ cart_item_id
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  category?: string;
  location?: string;
  slug?: string;
  maxStock?: number;
  product_id?: number;
  variant_id?: number | null;
  variant_name?: string | null;
  line_total?: number;
  in_stock?: boolean;
}

// Response từ backend /api/cart/
type BackendCartResponse = {
  cart_id: number;
  subtotal: string;
  items: Array<{
    cart_item_id: number;
    product_id: number;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
    in_stock: boolean;
    variant_id: number | null;
    variant_name: string | null;
    [k: string]: any;
  }>;
};

export default function CartPage() {
  const router = useRouter();

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);


  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCart = async () => {
    try {
      setIsLoading(true);

      // QUAN TRỌNG: gọi /cart/ (có slash) để tránh redirect
      const res = await apiClient.get<BackendCartResponse>("/cart/");

      // tùy apiClient trả shape {data} hay trực tiếp
      const data: BackendCartResponse | undefined = (res as any)?.data ?? (res as any);
      const items = data?.items ?? [];

      // map backend -> UI shape
      const mapped: CartItem[] = items.map((it) => ({
        id: String(it.cart_item_id),
        name: it.name,
        price: Number(it.price ?? 0),
        quantity: Number(it.quantity ?? 0),
        product_id: it.product_id,
        variant_id: it.variant_id,
        variant_name: it.variant_name,
        line_total: Number(it.line_total ?? 0),
        in_stock: it.in_stock,

        // optional fields (nếu backend chưa có thì để default hợp lý để UI không bị “trống tag”)
        image: (it as any).image ?? (it as any).image_url ?? undefined,
        unit: (it as any).unit ?? "sp",
        category: (it as any).category ?? "Sản phẩm",
        location: (it as any).location ?? "",
        slug: (it as any).slug ?? "",
        maxStock: (it as any).maxStock ?? (it as any).max_stock ?? undefined,
      }));

      setCartItems(mapped);

      // giữ lại selectedIds hợp lệ
      setSelectedIds((prev) => {
        const alive = new Set(mapped.map((m) => m.id));
        const next = new Set<string>();
        for (const id of prev) if (alive.has(id)) next.add(id);
        return next;
      });
    } catch (e) {
      console.error("fetchCart failed:", e);
      setCartItems([]);
      setSelectedIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    const onCartUpdated = () => fetchCart();
    window.addEventListener("cart-updated", onCartUpdated);
    return () => window.removeEventListener("cart-updated", onCartUpdated);
  }, []);

  // ---------- selection ----------
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = cartItems.length > 0 && prev.size === cartItems.length;
      return allSelected ? new Set() : new Set(cartItems.map((i) => i.id));
    });
  };

  const selectedItems = useMemo(
    () => cartItems.filter((i) => selectedIds.has(i.id)),
    [cartItems, selectedIds]
  );

  // ---------- money (theo items đã tick) ----------
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = totalItems > 0 ? 50000 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingFee + tax;

  // ---------- actions ----------
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setIsUpdating(true);
    try {
      await apiClient.put(`/cart/items/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (e) {
      console.error(e);
      toast.error("Không cập nhật được số lượng!");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    setIsUpdating(true);
    try {
      await apiClient.delete(`/cart/items/${cartItemId}`);
      await fetchCart();
    } catch (e) {
      console.error(e);
      toast.error("Không xóa được sản phẩm!");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!cartItems.length) return;
    setIsUpdating(true);
    try {
      for (const it of cartItems) {
        await apiClient.delete(`/cart/items/${Number(it.id)}`);
      }
      await fetchCart();
    } catch (e) {
      console.error(e);
      toast.error("Không xóa được giỏ hàng!");
    } finally {
      setIsUpdating(false);
    }
  };

  // Checkout: chỉ dùng món đã tick
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Bạn chưa chọn sản phẩm nào để thanh toán!", {
        icon: "🛒",
        duration: 4000,
      });
      return;
    }

    // 1. Chuẩn bị dữ liệu thanh toán
    const checkoutData = {
      items: selectedItems,
      subtotal,
      shippingFee,
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    // ✅ 2. BẮT BUỘC: Lưu vào LocalStorage để trang /checkout có thể đọc được
    localStorage.setItem("zenergy_checkout", JSON.stringify(checkoutData));

    // 3. Chuyển hướng sang trang thanh toán
    router.push("/cart/checkout");
  };

  // ---------- UI ----------
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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-green-600">
            Trang chủ
          </Link>
          <ChevronRight size={16} />
          <span className="text-green-700 font-medium">Giỏ hàng</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-2xl">
                    <ShoppingCart className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">Giỏ Hàng Của Bạn</h2>
                    <p className="text-gray-500 text-sm">
                      ({cartItems.length} sản phẩm)
                      {cartItems.length > 0 && (
                        <span className="ml-2">
                          • Đã chọn: <b>{selectedItems.length}</b>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-green-600"
                        checked={selectedIds.size === cartItems.length}
                        onChange={toggleSelectAll}
                      />
                      Chọn tất cả
                    </label>

                    <button
                      onClick={clearCart}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <ShoppingCart className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-800">Giỏ hàng trống</h3>
                <p className="text-gray-600 mt-2">Hãy thêm sản phẩm để bắt đầu mua sắm.</p>
                <Link
                  href="/market"
                  className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
                >
                  <ArrowLeft size={18} />
                  Đi mua sắm
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isMaxed = typeof item.maxStock === "number" && item.quantity >= item.maxStock;

                  return (
                    <div
                      key={item.id}
                      className={[
                        "bg-white rounded-3xl p-5 shadow-lg border transition-colors",
                        isSelected ? "border-green-200" : "border-gray-100",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label className="flex items-start gap-4 flex-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="mt-2 w-5 h-5 accent-green-600"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                          />

                          <div className="flex gap-4 flex-1">
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="text-gray-300" size={28} />
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="text-lg font-black text-gray-900 leading-snug">
                                {item.name}
                              </h3>

                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-semibold">
                                  {item.category}
                                </span>
                                {item.location && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 font-semibold">
                                    {item.location}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3">
                                <div className="text-2xl font-black text-gray-900">{formatVND(item.price)}</div>
                                <div className="text-xs text-gray-500">/{item.unit}</div>
                              </div>

                              {isMaxed && (
                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-orange-600 font-semibold">
                                  <AlertCircle size={14} />
                                  Đã đạt số lượng tối đa
                                </div>
                              )}
                            </div>
                          </div>
                        </label>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              onClick={() => updateQuantity(Number(item.id), item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              aria-label="Giảm số lượng"
                            >
                              <Minus size={16} />
                            </button>

                            <div className="w-10 text-center font-bold text-gray-800">
                              {item.quantity}
                            </div>

                            <button
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              onClick={() => updateQuantity(Number(item.id), item.quantity + 1)}
                              disabled={isUpdating || isMaxed}
                              aria-label="Tăng số lượng"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(Number(item.id))}
                            disabled={isUpdating}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-50"
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="text-blue-600" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800">Giao hàng toàn quốc</h4>
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
                  <h4 className="font-bold text-gray-800">Bảo mật SSL 256-bit</h4>
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
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" />
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span className="font-bold text-gray-800">
                    {formatVND(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-bold text-gray-800">
                    {shippingFee > 0 ? formatVND(shippingFee) : "Miễn phí"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-bold text-gray-800">
                    {formatVND(tax)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-green-600">
                      {formatVND(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || isUpdating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
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

              <Link
                href="/market"
                className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-green-500 text-green-600 font-bold py-4 rounded-xl hover:bg-green-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Tiếp tục mua sắm
              </Link>

              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">🛡️ Thanh toán an toàn</p>
                    <p className="text-xs text-green-600 mt-1">
                      Thông tin thanh toán được mã hóa và bảo mật theo tiêu chuẩn PCI DSS
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
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
