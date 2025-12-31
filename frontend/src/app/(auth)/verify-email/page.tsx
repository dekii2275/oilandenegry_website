"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

// 1. Tách logic chính ra Component con
function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực email...");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Liên kết xác thực không hợp lệ hoặc đã hết hạn");
        return;
      }

      try {
        // Gọi API để xác thực email
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email của bạn đã được xác thực thành công!");

          // Chuyển hướng sau 5 giây
          setTimeout(() => {
            router.push(
              `${ROUTES.LOGIN}?verified=true${email ? `&email=${email}` : ""}`
            );
          }, 5000);
        } else {
          setStatus("error");
          setMessage(data.message || "Xác thực email thất bại. Liên kết có thể đã hết hạn.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Không tìm thấy token xác thực");
    }
  }, [token, email, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-6 py-12"
      style={{
        backgroundImage: "url('/assets/images/register_background.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-green-50/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-[140px] h-[140px] bg-white rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/assets/images/logo.png"
                  alt="Z-ENERGY Logo"
                  className="w-[120px] h-[120px] object-contain"
                />
              </div>
            </div>
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {status === "loading" && (
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {status === "loading"
              ? "Đang xác thực..."
              : status === "success"
              ? "Xác thực thành công!"
              : "Lỗi xác thực"}
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          {/* Additional Info */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                Bạn sẽ được chuyển đến trang đăng nhập trong 5 giây...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === "error" && (
              <div className="space-y-3">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="inline-block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Đăng ký lại
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-3">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500">
                Vui lòng không đóng trang này...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Component chính bọc Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}