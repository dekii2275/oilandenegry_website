// frontend/src/app/market/product/[slug]/components/CTACard.tsx

"use client";

import { ShieldCheck, Users, Quote, MessageSquare } from "lucide-react";
import { Product } from "../types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useState } from "react";

interface CTACardProps {
  product: Product;
}

export default function CTACard({ product }: CTACardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState({
    quote: false,
    consultation: false,
  });

  // Kiểm tra đăng nhập trước khi thực hiện hành động
  const checkAuthAndAction = (
    actionType: "quote" | "consultation",
    callback: () => void
  ) => {
    if (!isAuthenticated) {
      // Lưu thông tin sản phẩm và hành động
      sessionStorage.setItem(
        "pendingCTAAction",
        JSON.stringify({
          type: actionType,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category,
          },
          redirectUrl: window.location.href,
        })
      );

      toast.error("Vui lòng đăng nhập để sử dụng dịch vụ!", {
        duration: 4000,
        icon: "🔒",
      });

      // Redirect đến trang đăng nhập
      router.push(
        `/login?redirect=${encodeURIComponent(
          window.location.href
        )}&action=${actionType}`
      );
      return false;
    }
    return true;
  };

  // Xử lý yêu cầu báo giá - scroll về đầu trang
  const handleRequestQuote = async () => {
    if (!checkAuthAndAction("quote", () => {})) return;

    setIsLoading((prev) => ({ ...prev, quote: true }));

    try {
      // Lưu thông tin sản phẩm vào sessionStorage để sử dụng ở trang báo giá
      sessionStorage.setItem(
        "quoteProduct",
        JSON.stringify({
          id: product.id,
          name: product.name,
          price:
            typeof product.price === "number"
              ? product.price
              : parseFloat(product.price as string),
          category: product.category,
          unit: product.unit,
          location: product.location,
          specifications: product.specifications || {},
        })
      );

      // Scroll về đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast.success("Đã cuộn về đầu trang!", {
        duration: 2000,
        icon: "📋",
      });
    } catch (error) {
      console.error("Lỗi khi yêu cầu báo giá:", error);
      toast.error("Có lỗi xảy ra!", {
        duration: 4000,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, quote: false }));
    }
  };

  // Xử lý tư vấn chuyên gia - chuyển đến trang contact
  const handleExpertConsultation = async () => {
    if (!checkAuthAndAction("consultation", () => {})) return;

    setIsLoading((prev) => ({ ...prev, consultation: true }));

    try {
      // Lưu thông tin sản phẩm vào sessionStorage để sử dụng ở trang contact
      sessionStorage.setItem(
        "consultationProduct",
        JSON.stringify({
          id: product.id,
          name: product.name,
          category: product.category,
          slug: product.slug,
        })
      );

      // Chuyển đến trang contact
      router.push(`/contact?product=${product.slug}`);

      toast.success("Chuyển đến trang liên hệ!", {
        duration: 2000,
        icon: "👨‍💼",
      });
    } catch (error) {
      console.error("Lỗi khi chuyển đến trang liên hệ:", error);
      toast.error("Có lỗi xảy ra!", {
        duration: 4000,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, consultation: false }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#71C291] to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-green-200">
      <div className="relative z-10">
        <h4 className="font-black text-2xl mb-3 leading-tight">
          Cần mua
          <br />
          {product.name}?
        </h4>
        <p className="text-sm opacity-90 mb-8">
          Nhận báo giá tốt nhất trong 24h với tư vấn chuyên nghiệp từ đội ngũ
          của chúng tôi.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleRequestQuote}
            disabled={isLoading.quote}
            className="w-full bg-white text-[#71C291] py-4 rounded-xl font-black text-sm hover:bg-opacity-95 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading.quote ? (
              <>
                <div className="w-4 h-4 border-2 border-[#71C291] border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Quote size={16} />
                Yêu cầu Báo giá
              </>
            )}
          </button>
          <button
            onClick={handleExpertConsultation}
            disabled={isLoading.consultation}
            className="w-full bg-transparent border-2 border-white text-white py-4 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading.consultation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Users size={16} />
                Tư vấn chuyên gia
              </>
            )}
          </button>
        </div>
      </div>
      <ShieldCheck
        className="absolute -bottom-8 -right-8 text-white/10"
        size={200}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
    </div>
  );
}
