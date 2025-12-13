'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validators/auth'
import { registerUser } from '@/services/auth.service'
import AuthInput from './AuthInput'
import AuthButton from './AuthButton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

interface RegisterFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      // Redirect to success page
      router.push(ROUTES.REGISTER_SUCCESS)
    } catch (error) {
      console.error('Registration error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
      <AuthInput
        {...register('email')}
        type="email"
        placeholder="Nhập email đăng ký"
        error={errors.email?.message}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      <AuthInput
        {...register('username')}
        type="text"
        placeholder="Nhập tên người dùng"
        error={errors.username?.message}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <AuthInput
        {...register('password')}
        type="password"
        placeholder="Nhập mật khẩu"
        error={errors.password?.message}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <AuthInput
        {...register('confirmPassword')}
        type="password"
        placeholder="Nhập lại mật khẩu"
        error={errors.confirmPassword?.message}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <div className="pt-1">
        <AuthButton type="submit" isLoading={isLoading}>
          Đăng kí
        </AuthButton>
      </div>

      <div className="text-center text-sm text-gray-700 mt-4">
        Đã có tài khoản?{' '}
        <Link 
          href={ROUTES.LOGIN} 
          className="text-green-600 hover:text-green-700 font-semibold underline transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </form>
  )
}

