"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";

type CartItem = {
  cart_item_id: number;
  product_id: number;
  variant_id: number;
  name: string;
  variant_name: string;
  price: string;
  quantity: number;
  line_total: string;
  in_stock: boolean;
};

type Cart = {
  cart_id: number;
  items: CartItem[];
  subtotal: string;
};

// product shape (loose) để bắt được nhiều kiểu response khác nhau
type AnyProduct = Record<string, any>;

function pickImageUrl(p: AnyProduct | null | undefined): string | null {
  if (!p) return null;

  // các key thường gặp
  const direct =
    p.image_url ||
    p.thumbnail_url ||
    p.cover_url ||
    p.image ||
    p.thumbnail ||
    p.cover;

  if (typeof direct === "string" && direct.length > 0) return direct;

  // images có thể là array string hoặc array object
  const imgs = p.images || p.image_urls || p.gallery;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.url || first.image_url || first.src || null;
  }

  return null;
}

function normalizeProductsPayload(payload: any): AnyProduct[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  // các kiểu bọc thường gặp
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);

  // map product_id -> image_url
  const [imgByProductId, setImgByProductId] = useState<Record<number, string>>({});
  const [imgLoading, setImgLoading] = useState(false);

  const isNotAuth = useMemo(() => {
    const msg = (error || "").toLowerCase();
    return msg.includes("not authenticated") || msg.includes("unauthorized");
  }, [error]);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      // baseURL = https://zenergy.cloud/api  => /cart/ -> https://zenergy.cloud/api/cart/
      const res = await apiClient.get<Cart>("/cart/");
      setCart(res as any);
    } catch (e: any) {
      setCart(null);
      setError(String(e?.response?.data?.detail || e?.message || "Không tải được giỏ hàng"));
    } finally {
      setLoading(false);
    }
  };

  // Lấy ảnh sản phẩm giống trang /products:
  // - ưu tiên gọi list /products (public) để map theo id
  // - chỉ fetch 1 lần cho những product_id đang có trong cart
  const loadImagesForCart = async (items: CartItem[]) => {
    const ids = Array.from(new Set(items.map((i) => i.product_id))).filter(Boolean);
    const missing = ids.filter((id) => !imgByProductId[id]);

    if (missing.length === 0) return;

    setImgLoading(true);
    try {
      // /products thường trả list sản phẩm có ảnh
      const res = await apiClient.get("/products/");
      const products = normalizeProductsPayload(res as any);

      const next: Record<number, string> = {};
      for (const p of products) {
        const pid = Number(p.id ?? p.product_id ?? p.productId);
        if (!pid) continue;
        if (!missing.includes(pid)) continue;

        const url = pickImageUrl(p);
        if (url) next[pid] = url;
      }

      // merge
      if (Object.keys(next).length > 0) {
        setImgByProductId((prev) => ({ ...prev, ...next }));
      }
    } catch {
      // im lặng: không có /products hoặc khác schema, UI vẫn chạy (chỉ thiếu ảnh)
    } finally {
      setImgLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    const onUpdated = () => loadCart();
    window.addEventListener("cart-updated", onUpdated);
    return () => window.removeEventListener("cart-updated", onUpdated);
  }, []);

  useEffect(() => {
    if (cart?.items?.length) loadImagesForCart(cart.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.cart_id, cart?.items?.length]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold">Giỏ hàng</h1>
        <Link href="/products" className="ml-auto text-sm font-semibold hover:underline">
          ← Quay lại mua sắm
        </Link>
      </div>

      <div className="mt-5">
        {loading && (
          <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            Đang tải giỏ hàng...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <div className="font-bold">❌ {isNotAuth ? "Bạn chưa đăng nhập." : "Có lỗi"}</div>
            {!isNotAuth && <div className="mt-2 text-sm opacity-80">{error}</div>}
            <div className="mt-3 flex gap-3">
              {isNotAuth ? (
                <Link href="/login" className="rounded-xl border px-4 py-2 text-sm font-bold">
                  Đăng nhập
                </Link>
              ) : (
                <button
                  onClick={loadCart}
                  className="rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && cart && (
          <>
            {cart.items.length === 0 ? (
              <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
                Giỏ hàng đang trống.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                {/* List */}
                <div className="space-y-3">
                  {cart.items.map((it) => {
                    const img = imgByProductId[it.product_id];

                    return (
                      <div
                        key={it.cart_item_id}
                        className="flex gap-4 rounded-2xl border bg-white/70 p-4 backdrop-blur"
                      >
                        {/* Image */}
                        <div className="h-24 w-24 overflow-hidden rounded-xl bg-white">
                          {img ? (
                            // dùng img thường cho đơn giản (không cần cấu hình next/image domains)
                            <img
                              src={img}
                              alt={it.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs opacity-60">
                              {imgLoading ? "Đang tải..." : "No image"}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-base font-extrabold">{it.name}</div>
                              <div className="mt-1 inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                {it.variant_name}
                              </div>
                              {!it.in_stock && (
                                <div className="mt-2 text-xs font-bold text-red-600">Hết hàng</div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-sm opacity-70">Đơn giá</div>
                              <div className="text-base font-extrabold">${it.price}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                              <span className="text-sm opacity-70">SL:</span>
                              <b className="text-sm">{it.quantity}</b>
                            </div>

                            <div className="text-right">
                              <div className="text-sm opacity-70">Thành tiền</div>
                              <div className="text-lg font-extrabold">${it.line_total}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="h-fit rounded-2xl border bg-white/70 p-5 backdrop-blur">
                  <div className="text-lg font-extrabold">Tóm tắt</div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm opacity-70">Tạm tính</span>
                    <b className="text-lg">${cart.subtotal}</b>
                  </div>

                  <button
                    className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-extrabold text-white"
                    onClick={() => alert("Bước sau làm checkout")}
                  >
                    Tiến hành thanh toán
                  </button>

                  <button
                    className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-extrabold"
                    onClick={loadCart}
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
