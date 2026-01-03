"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + " đ";

type QrResponse = {
  order_id: number;
  amount: number;
  account_name: string;
  account_no: string;
  bank_bin: string;
  add_info: string;
  qr_image_url: string;
};

function getTokenFromLocalStorage() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("zenergy_token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export default function QrPaymentClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "/api", []);

  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<QrResponse | null>(null);
  const [checking, setChecking] = useState(false);

  const pollingRef = useRef<number | null>(null);

  const authHeaders = useMemo(() => {
    const token =
      typeof window !== "undefined" ? getTokenFromLocalStorage() : "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // 1) Fetch QR from backend
  useEffect(() => {
    if (!orderId) {
      toast.error("Thiếu orderId");
      router.push("/cart");
      return;
    }

    const token = getTokenFromLocalStorage();
    if (!token) {
      toast.error("Bạn cần đăng nhập để thanh toán");
      router.push("/login");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/orders/${orderId}/qr`, {
          method: "GET",
          headers: authHeaders,
        });

        const data = (await res.json().catch(() => null)) as QrResponse | null;

        if (!res.ok || !data?.qr_image_url) {
          toast.error((data as any)?.detail || "Không tạo được QR cho đơn hàng");
          return;
        }

        if (!cancelled) setQr(data);
      } catch (e) {
        console.error(e);
        toast.error("Lỗi gọi API tạo QR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, apiBase, authHeaders, router]);

  // 2) Check payment status (polling) - vẫn giữ (nếu sau này backend cập nhật status thì tự nhảy)
  const checkPaid = async () => {
    if (!orderId) return false;

    try {
      const res = await fetch(`${apiBase}/orders/${orderId}`, {
        method: "GET",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) return false;

      const status = String(data?.status ?? "").toUpperCase();

      // Backend hiện tại: CONFIRMED = mới tạo (chờ xác nhận)
      // Khi seller/admin đổi sang SHIPPING/COMPLETED/... => coi như đã xử lý tiếp
      return status !== "CONFIRMED";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!orderId) return;
    if (!qr) return;

    if (pollingRef.current) window.clearInterval(pollingRef.current);

    pollingRef.current = window.setInterval(async () => {
      const paid = await checkPaid();
      if (paid) {
        if (pollingRef.current) window.clearInterval(pollingRef.current);
        toast.success("Đặt hàng thành công!");
        router.push(`/cart/order-confirmation?orderId=${orderId}`);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [orderId, qr, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 3) Nút "Tôi đã thanh toán" -> CHUYỂN THẲNG sang trang thành công, KHÔNG CHECK backend
  const handleManualCheck = async () => {
    if (!orderId) return;

    setChecking(true);
    try {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      toast.success("Đặt hàng thành công!");
      router.push(`/cart/order-confirmation?orderId=${orderId}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán bằng QR
          </h1>
          <p className="text-gray-600 mb-6">
            Quét mã QR để chuyển khoản. Bạn có thể bấm xác nhận để chuyển sang
            trang hoàn tất (đơn vẫn ở trạng thái chờ xác nhận).
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Đang tạo mã QR...</span>
            </div>
          ) : !qr ? (
            <div className="py-10">
              <p className="text-red-600">Không lấy được thông tin QR.</p>
              <button
                onClick={() => router.push("/cart")}
                className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">Mã đơn hàng</div>
                  <div className="font-semibold">#{qr.order_id}</div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">Số tiền</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatVND(qr.amount)}
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">
                    Nội dung chuyển khoản
                  </div>
                  <div className="font-semibold">{qr.add_info}</div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">Tài khoản nhận</div>
                  <div className="font-semibold">{qr.account_name}</div>
                  <div className="text-gray-700">
                    {qr.account_no} (BIN {qr.bank_bin})
                  </div>
                </div>

                <button
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Tôi đã thanh toán (chuyển sang hoàn tất)
                </button>

                <p className="text-xs text-gray-500">
                  *Đơn hàng trong DB vẫn là CONFIRMED (chờ xác nhận). Sau này nếu
                  backend có cơ chế xác nhận thanh toán, polling vẫn có thể tự
                  nhảy.
                </p>
              </div>

              <div className="rounded-2xl border p-4 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.qr_image_url}
                  alt="VietQR"
                  className="w-full max-w-sm rounded-xl border"
                />
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Mở app ngân hàng → Quét QR → Xác nhận chuyển khoản
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
