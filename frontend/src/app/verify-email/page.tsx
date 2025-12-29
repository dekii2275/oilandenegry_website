'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/link' // Lưu ý: Next.js 13+ dùng next/navigation
import { useSearchParams as useNavSearchParams } from 'next/navigation' // Fix import đúng
import { authService } from '@/services/auth.service'
import SuccessNotification from '@/components/auth/SuccessNotification'
import Link from 'next/link'

// --- BIỆN PHÁP MẠNH: HÀM XỬ LÝ LỖI (Nuclear Option) ---
// Hàm này đảm bảo đầu ra LUÔN LUÔN là string.
const parseErrorMsg = (error: any): string => {
  try {
    // 1. Nếu error chính là string -> trả về luôn
    if (typeof error === 'string') return error;

    // 2. Kiểm tra lỗi từ Backend FastAPI/Pydantic (Lỗi bạn đang gặp)
    // Cấu trúc thường là: error.response.data.detail = [{msg: "...", type: "..."}]
    const responseData = error?.response?.data;
    const detail = responseData?.detail;

    if (detail) {
      if (Array.isArray(detail)) {
        // Lấy field 'msg' của phần tử lỗi đầu tiên
        // Nếu không có field msg, ép cả cục object đó thành string JSON
        return detail[0]?.msg || JSON.stringify(detail[0]);
      }
      if (typeof detail === 'string') return detail;
      if (typeof detail === 'object') return JSON.stringify(detail);
    }

    // 3. Kiểm tra message cơ bản của Error object
    if (error?.message) return error.message;

    // 4. Nếu không trúng trường hợp nào ở trên, ép kiểu JSON toàn bộ
    // Đây là chốt chặn cuối cùng để App không bao giờ bị Crash màn hình trắng
    return JSON.stringify(error);

  } catch (e) {
    return "Đã xảy ra lỗi không xác định (Lỗi parsing).";
  }
};

function VerifyContent() {
  const searchParams = useNavSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
  // State này đảm bảo chỉ chứa String
  const [displayMessage, setDisplayMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setDisplayMessage('Đường dẫn xác thực bị thiếu hoặc không hợp lệ.')
      return
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token)
        setStatus('success')
      } catch (error: any) {
        setStatus('error')
        
        // 👇 SỬ DỤNG HÀM XỬ LÝ LỖI MỚI 👇
        const safeText = parseErrorMsg(error);
        
        // Log lỗi gốc ra console để dev debug (nếu cần)
        console.error("Original Error Object:", error);
        
        setDisplayMessage(safeText);
      }
    }

    verify()
  }, [token])

  // --- GIAO DIỆN ---

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Đang xác thực email của bạn...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="pt-10">
        <SuccessNotification variant="login" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto pt-10">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Xác thực thất bại</h2>
        
        {/* Khu vực hiển thị lỗi an toàn */}
        <div className="bg-white p-3 rounded border border-gray-200 text-left overflow-auto max-h-40">
            <p className="text-xs text-gray-500 font-mono break-all whitespace-pre-wrap">
                {/* Ở đây chắc chắn là string nhờ hàm parseErrorMsg */}
                {displayMessage}
            </p>
        </div>
        
        <div className="mt-6">
            <Link 
            href="/register" 
            className="inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-red-700 transition"
            >
            Đăng ký lại
            </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 bg-[url('/assets/images/bg-auth.png')] bg-cover">
      <Suspense fallback={<div>Đang tải...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}