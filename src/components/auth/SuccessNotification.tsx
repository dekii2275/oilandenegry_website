'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

interface SuccessNotificationProps {
  variant?: 'email' | 'login'
  // optional registered email (used to show mail provider shortcut)
  email?: string
}

export default function SuccessNotification({ variant = 'email', email }: SuccessNotificationProps) {
  const emailMessage = (
    <>
      <div className="text-center font-bold text-black text-base leading-relaxed mb-4">
        <div>Đăng kí thành công</div>
        <div>vui lòng truy cập email</div>
        <div>của bạn để xác thực</div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          {email && email.toLowerCase().endsWith('@gmail.com') && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-green-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              Mở Gmail
            </a>
          )}
          <Link 
            href={ROUTES.LOGIN}
            className="text-green-600 hover:text-green-700 font-semibold text-sm underline transition-colors"
          >
            Quay lại đăng nhập
          </Link>
        </div>
        <div className="text-xs text-gray-600 text-center">Nếu không thấy email, kiểm tra thư mục Spam hoặc chờ vài phút.</div>
      </div>
    </>
  )

  const loginMessage = (
    <>
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="text-center font-bold text-black text-base leading-relaxed">
          <div>Đăng kí thành công</div>
          <div>vui lòng đăng nhập để</div>
          <div>tiếp tục trải nghiệm</div>
        </div>
      </div>
      <Link href={ROUTES.LOGIN}>
        <button className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-3 rounded-lg transition-colors">
          Đăng nhập
        </button>
      </Link>
    </>
  )

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-[140px] h-[140px] bg-white rounded-full flex flex-col items-center justify-center shadow-lg border border-gray-200 p-3">
          <img 
            src="/assets/images/logo.png" 
            alt="Z-ENERGY Logo" 
            className="w-20 h-20 object-contain mb-1"
          />
          <span className="text-black font-bold text-sm">Z-ENERGY</span>
        </div>
      </div>

      {/* Notification Box */}
      <div 
        className="rounded-2xl shadow-lg p-6"
        style={{
          backgroundColor: variant === 'email' ? '#F8F9E7' : 'rgba(211, 228, 205, 0.9)'
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
        <div>
          {variant === 'email' ? emailMessage : loginMessage}
        </div>
      </div>
    </div>
  )
}

