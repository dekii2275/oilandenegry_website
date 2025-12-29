import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/assets/images/register_background.png')",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        {/* Left Section - Logo and Promotional Text */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-8 relative">
          <div className="relative z-10 text-center">
            <div className="mb-8 flex flex-col items-center">
              <div className="w-[140px] h-[140px] bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <img
                  src="/assets/images/logo.png"
                  alt="Z-ENERGY Logo"
                  className="w-[120px] h-[120px] object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-lg text-center px-4">
              Đăng kí để trở thành một phần của Z-ENERGY ngay hôm nay
            </h1>
          </div>
        </div>

        {/* Right Section - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-6 lg:py-8">
          <div
            className="w-full max-w-full lg:max-w-[580px] lg:h-auto rounded-[25px] shadow-2xl p-6 sm:p-7 flex flex-col justify-center"
            style={{
              backgroundColor: 'rgba(211, 228, 205, 0.8)',
            }}
          >
            <RegisterForm />

            {/* Quick link to success page for testing */}
            <div className="mt-4 text-center">
              <Link
                href={`${ROUTES.REGISTER_SUCCESS}?email=test@gmail.com`}
                className="text-sm text-green-600 hover:underline"
              >
                Xem trang thông báo đăng ký thành công
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
