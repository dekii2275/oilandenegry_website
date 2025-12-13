import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-6 py-12"
      style={{
        backgroundImage: "url('/assets/images/login_background.png')"
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-green-50/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
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

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-lg font-bold text-black">
              Chào mừng trở lại, vui lòng đăng nhập vào hệ thống của Z-ENERGY
            </h1>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

