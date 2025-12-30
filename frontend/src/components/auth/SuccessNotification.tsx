"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface SuccessNotificationProps {
  variant?: "email" | "login";
  // optional registered email (used to show mail provider shortcut)
  email?: string;
  // email verification related props
  showEmailVerification?: boolean;
  verificationToken?: string;
  onResendVerification?: () => Promise<void>;
}

export default function SuccessNotification({
  variant = "email",
  email,
  showEmailVerification = false,
  verificationToken,
  onResendVerification,
}: SuccessNotificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setResendError(null);

    try {
      if (onResendVerification) {
        await onResendVerification();
      } else {
        // Gọi API để gửi lại email xác thực
        const response = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to resend verification email");
        }
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setResendError("Không thể gửi lại email. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  const emailMessage = (
    <>
      <div className="text-center font-bold text-black text-base leading-relaxed mb-4">
        <div>Đăng kí thành công</div>
        <div>vui lòng truy cập email</div>
        <div>của bạn để xác thực</div>
      </div>

      {/* Email Verification Instructions */}
      {showEmailVerification && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              📧 Hướng dẫn xác thực email
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1 ml-2">
              <li>
                1. Kiểm tra hộp thư đến của bạn tại{" "}
                <span className="font-semibold">{email}</span>
              </li>
              <li>2. Mở email từ Z-ENERGY (kiểm tra cả thư mục Spam)</li>
              <li>3. Nhấp vào liên kết "Xác thực Email" trong email</li>
              <li>4. Quay lại đăng nhập để sử dụng hệ thống</li>
            </ol>
          </div>

          {/* Manual verification link (for testing/dev) */}
          {verificationToken && process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 mb-2">🔧 Development Mode:</p>
              <Link
                href={`${ROUTES.VERIFY_EMAIL}?token=${verificationToken}`}
                className="text-xs text-blue-600 hover:underline"
              >
                Xác thực ngay (Dev only)
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          {email && email.toLowerCase().endsWith("@gmail.com") && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-green-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              Mở Gmail
            </a>
          )}
          {email &&
            (email.toLowerCase().endsWith("@yahoo.com") ||
              email.toLowerCase().endsWith("@ymail.com")) && (
              <a
                href="https://mail.yahoo.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
              >
                Mở Yahoo Mail
              </a>
            )}
          {email && email.toLowerCase().endsWith("@outlook.com") && (
            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-blue-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              Mở Outlook
            </a>
          )}
          <Link
            href={ROUTES.LOGIN}
            className="text-green-600 hover:text-green-700 font-semibold text-sm underline transition-colors"
          >
            Quay lại đăng nhập
          </Link>
        </div>

        {/* Resend verification email */}
        {showEmailVerification && (
          <div className="text-center">
            <div className="mb-2">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className={`text-sm font-medium ${
                  isResending
                    ? "text-gray-500"
                    : "text-green-600 hover:text-green-800"
                }`}
              >
                {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
              </button>
            </div>
            {resendSuccess && (
              <p className="text-xs text-green-600 animate-pulse">
                ✓ Đã gửi lại email xác thực thành công!
              </p>
            )}
            {resendError && (
              <p className="text-xs text-red-600">{resendError}</p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600 text-center pt-2 border-t border-gray-200">
          Nếu không thấy email, kiểm tra thư mục Spam hoặc chờ vài phút.
        </div>
      </div>
    </>
  );

  const loginMessage = (
    <>
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="text-center font-bold text-black text-base leading-relaxed">
          <div>Đăng kí thành công</div>
          <div>vui lòng đăng nhập để</div>
          <div>tiếp tục trải nghiệm</div>
        </div>
      </div>

      {/* Email verification reminder */}
      {email && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Lưu ý:</span> Tài khoản của bạn đã
            được xác thực email.
          </p>
        </div>
      )}

      <Link href={ROUTES.LOGIN}>
        <button className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-3 rounded-lg transition-colors">
          Đăng nhập
        </button>
      </Link>
    </>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-[140px] h-[140px] bg-white rounded-full flex flex-col items-center justify-center shadow-lg border border-gray-200 p-3">
          <img
            src="/assets/images/logo.png"
            alt="Z-ENERGY Logo"
            className="w-40 h-40 object-contain mb-1"
          />
        </div>
      </div>

      {/* Notification Box */}
      <div
        className="rounded-2xl shadow-lg p-6"
        style={{
          backgroundColor:
            variant === "email" ? "white" : "rgba(211, 228, 205, 0.9)",
        }}
      >
        {/* Header */}
        <div className="flex items-center mb-5">
          <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
            <span className="text-white text-[10px] font-bold">i</span>
          </div>
          <h2 className="font-bold text-black text-base">Z-ENERGY thông báo</h2>
        </div>

        {/* Message */}
        <div>{variant === "email" ? emailMessage : loginMessage}</div>
      </div>
    </div>
  );
}
