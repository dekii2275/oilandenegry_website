'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-gray-900"
          >
            <img
              src="/assets/images/logo.png"
              alt="Z-ENERGY Logo"
              className="w-8 h-8 object-contain"
            />
            <span>Z-ENERGY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center text-sm">
            <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium">
              Trang chủ
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-teal-600 font-medium">
              Về chúng tôi
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-teal-600 font-medium">
              Sản phẩm
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-teal-600 font-medium">
              Tin tức
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6 text-sm font-medium">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-teal-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-teal-600"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <div className="relative group">
                <button className="text-lg">👤</button>

                <div className="absolute right-0 mt-2 w-36 bg-white border shadow-md opacity-0 group-hover:opacity-100 transition">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3 border-t">
            <Link href="/" className="pt-3">Trang chủ</Link>
            <Link href="/about">Về chúng tôi</Link>
            <Link href="/products">Sản phẩm</Link>
            <Link href="/products">Tin tức</Link>

            {!isLoggedIn ? (
              <>
                <Link href="/login">Đăng nhập</Link>
                <Link href="/register">Đăng ký</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="text-left text-red-600">
                Đăng xuất
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
