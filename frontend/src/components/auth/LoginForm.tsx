'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validators/auth'
import { loginUser } from '@/services/auth.service' // Import hàm login
import AuthInput from './AuthInput'
import AuthButton from './AuthButton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'
// import { getSafeErrorMessage } from '@/utils/error-handler' // Nếu bạn có file này thì uncomment

interface LoginFormData {
  email: string
  password: string
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // --- PHẦN ĐÃ SỬA ---
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      // 1. Gọi API đăng nhập (Bước quan trọng bị thiếu)
      await loginUser(data.email, data.password);

      // 2. Nếu thành công -> Chuyển hướng về trang chủ hoặc Dashboard
      // Đảm bảo ROUTES.HOME hoặc ROUTES.DASHBOARD tồn tại trong file constants
      router.push(ROUTES.HOME || '/'); 
      router.refresh(); // Refresh để cập nhật trạng thái Auth cho header

    } catch (error: any) {
      console.error('Login error:', error)
      
      // 3. Xử lý hiển thị lỗi (Dùng error.message vì đã xử lý ở service rồi)
      const msg = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setApiError(msg);

    } finally {
      setIsLoading(false)
    }
  }
  // -------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {apiError}
        </div>
      )}

      <AuthInput
        {...register('email')}
        type="text"
        placeholder="Tên đăng nhập hoặc email"
        error={errors.email?.message}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <AuthInput
        {...register('password')}
        type="password"
        placeholder="Mật khẩu"
        error={errors.password?.message}
        showPasswordToggle
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <div className="flex items-center justify-between text-sm mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2 w-4 h-4 text-green-400 border-gray-300 rounded focus:ring-green-400"
          />
          <span className="text-gray-700">Lưu thông tin đăng nhập</span>
        </label>
        <Link 
          href="#" 
          className="text-gray-700 hover:text-green-500 transition-colors"
        >
          Quên mật khẩu
        </Link>
      </div>

      <div className="pt-2">
        <AuthButton type="submit" isLoading={isLoading}>
          Đăng nhập
        </AuthButton>
      </div>

      <div className="text-center text-sm text-gray-700 mt-4">
        Chưa có tài khoản?{' '}
        <Link 
          href={ROUTES.REGISTER} 
          className="text-green-600 hover:text-green-700 font-semibold underline transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    </form>
  )
}