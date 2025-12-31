'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: number
  title: string
  read: boolean
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNoti, setShowNoti] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsLoggedIn(!!token)

    // TODO: gọi API thật /notifications
    if (token) {
      setNotifications([
        { id: 1, title: 'Đơn hàng mới #1024', read: false },
        { id: 2, title: 'Cập nhật trạng thái đơn hàng', read: true },
        { id: 3, title: 'Khuyến mãi mới từ Z-Energy', read: false },
      ])
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/')
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
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
          <div className="flex items-center gap-6 text-sm font-medium relative">
            {/* ===== NOTIFICATION ===== */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowNoti(!showNoti)}
                  className="relative text-xl"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-xs
                      bg-red-500 text-white rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNoti && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border shadow-lg rounded-md z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                      <span className="font-semibold text-sm">Thông báo</span>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-4 text-sm text-gray-500">
                          Không có thông báo
                        </p>
                      )}

                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 text-sm cursor-pointer border-b
                            ${!n.read ? 'bg-teal-50 font-medium' : 'bg-white'}
                          `}
                        >
                          {n.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== AUTH ===== */}
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
            <Link href="/news">Tin tức</Link>

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
