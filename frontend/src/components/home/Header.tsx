'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b-4 border-blue-600 sticky top-0 z-50 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <img 
              src="/assets/images/logo.png" 
              alt="Z-ENERGY Logo"
              className="w-8 h-8 object-contain"
            />
            <span>Z-ENERGY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center text-sm">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition font-medium">
              Trang chủ
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600 transition font-medium">
              Về chúng tôi
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600 transition font-medium">
              Sản phẩm
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600 transition font-medium">
              Tin tức
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <button className="text-gray-600 hover:text-gray-900 text-xl">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="20" fill="#F3F4F6"/>
<path d="M13.3333 25.8335V24.1668H14.9999V18.3335C14.9999 17.1807 15.3471 16.1564 16.0416 15.2606C16.736 14.3647 17.6388 13.7779 18.7499 13.5002V12.9168C18.7499 12.5696 18.8714 12.2745 19.1145 12.0314C19.3576 11.7884 19.6527 11.6668 19.9999 11.6668C20.3471 11.6668 20.6423 11.7884 20.8853 12.0314C21.1284 12.2745 21.2499 12.5696 21.2499 12.9168V13.5002C22.361 13.7779 23.2638 14.3647 23.9583 15.2606C24.6527 16.1564 24.9999 17.1807 24.9999 18.3335V24.1668H26.6666V25.8335H13.3333ZM19.9999 28.3335C19.5416 28.3335 19.1492 28.1703 18.8228 27.8439C18.4964 27.5175 18.3333 27.1252 18.3333 26.6668H21.6666C21.6666 27.1252 21.5034 27.5175 21.177 27.8439C20.8506 28.1703 20.4583 28.3335 19.9999 28.3335ZM16.6666 24.1668H23.3333V18.3335C23.3333 17.4168 23.0069 16.6321 22.3541 15.9793C21.7013 15.3266 20.9166 15.0002 19.9999 15.0002C19.0833 15.0002 18.2985 15.3266 17.6458 15.9793C16.993 16.6321 16.6666 17.4168 16.6666 18.3335V24.1668Z" fill="#4B5563"/>
</svg>

            </button>
            <button className="text-gray-600 hover:text-gray-900 text-xl">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="20" fill="#F3F4F6"/>
<path d="M15.8333 28.3335C15.3749 28.3335 14.9826 28.1703 14.6562 27.8439C14.3298 27.5175 14.1666 27.1252 14.1666 26.6668C14.1666 26.2085 14.3298 25.8161 14.6562 25.4897C14.9826 25.1634 15.3749 25.0002 15.8333 25.0002C16.2916 25.0002 16.6839 25.1634 17.0103 25.4897C17.3367 25.8161 17.4999 26.2085 17.4999 26.6668C17.4999 27.1252 17.3367 27.5175 17.0103 27.8439C16.6839 28.1703 16.2916 28.3335 15.8333 28.3335ZM24.1666 28.3335C23.7083 28.3335 23.3159 28.1703 22.9895 27.8439C22.6631 27.5175 22.4999 27.1252 22.4999 26.6668C22.4999 26.2085 22.6631 25.8161 22.9895 25.4897C23.3159 25.1634 23.7083 25.0002 24.1666 25.0002C24.6249 25.0002 25.0173 25.1634 25.3437 25.4897C25.6701 25.8161 25.8333 26.2085 25.8333 26.6668C25.8333 27.1252 25.6701 27.5175 25.3437 27.8439C25.0173 28.1703 24.6249 28.3335 24.1666 28.3335ZM15.1249 15.0002L17.1249 19.1668H22.9583L25.2499 15.0002H15.1249ZM14.3333 13.3335H26.6249C26.9444 13.3335 27.1874 13.4759 27.3541 13.7606C27.5208 14.0453 27.5277 14.3335 27.3749 14.6252L24.4166 19.9585C24.2638 20.2363 24.0589 20.4516 23.802 20.6043C23.5451 20.7571 23.2638 20.8335 22.9583 20.8335H16.7499L15.8333 22.5002H25.8333V24.1668H15.8333C15.2083 24.1668 14.736 23.8925 14.4166 23.3439C14.0971 22.7953 14.0833 22.2502 14.3749 21.7085L15.4999 19.6668L12.4999 13.3335H10.8333V11.6668H13.5416L14.3333 13.3335Z" fill="#4B5563"/>
</svg>

            </button>
            <button className="text-gray-600 hover:text-gray-900 text-lg">
              👤
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3 border-t">
            <Link href="/" className="text-gray-700 hover:text-teal-600 pt-3 block">
              Trang chủ
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600">
              Về chúng tôi
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600">
              Sản phẩm
            </Link>
            <Link href="#" className="text-gray-700 hover:text-teal-600 pb-3">
              Tin tức
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
