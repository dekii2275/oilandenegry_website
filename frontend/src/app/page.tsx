<<<<<<< HEAD
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white fixed top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-[102px] h-[102px] rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/assets/images/logo.png"
              alt="Z-ENERGY Logo"
              width={102}
              height={102}
              className="w-full h-full object-cover"
            />
          </div>
          <nav className="flex gap-6 text-base font-medium">
            <Link href="/" className="text-red-600 border-b-2 border-red-600">
              TRANG CHỦ
            </Link>
            <Link href="/about" className="hover:text-red-600">
              GIỚI THIỆU
            </Link>
            <Link href="/products" className="hover:text-red-600">
              SẢN PHẨM
            </Link>
            <Link href="/news" className="hover:text-red-600">
              TIN TỨC
            </Link>
            <Link href="/partners" className="hover:text-red-600">
              ĐỐI TÁC
            </Link>
            <Link href="/contact" className="hover:text-red-600">
              LIÊN HỆ
            </Link>
          </nav>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-[#FFF57E] font-bold text-sm hover:opacity-90 transition-opacity"
          >
            ĐĂNG NHẬP
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 rounded-full bg-[#FFF57E] font-bold text-sm hover:opacity-90 transition-opacity"
          >
            ĐĂNG KÝ
          </Link>
        </div>
      </header>

      {/* Hero Section - First Image */}
      {/*
        <section className="w-full mt-[80px]">
          <div className="w-full h-[172px] relative">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Hero Image 1 (1920x172)</span>
            </div>
          </div>
        </section>
      */}
      {/* Hero Section - Image */}
      <section className="w-full pt-[80px] px-[10px]">
        <div className="w-full h-[668px] relative">
          <Image
            src="/assets/images/1.png"
            alt="Hero Image 1"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Giới thiệu Section */}
      <section className="w-full h-auto lg:h-[724px] relative bg-gray-50 py-12 lg:py-0">
        <div className="container mx-auto px-4 lg:px-32 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center">
            {/* Left Side - 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
              {/* Row 1 - Spanning both columns */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                {/* Main Title */}
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-6 leading-tight">
                  Z-ENERGY là đơn vị tiên phong dẫn đầu trong việc cung cấp giải
                  pháp về xăng dầu, năng lượng xanh
                </h1>
              </div>

              {/* Row 2 Col 1 - Description and Link */}
              <div className="flex flex-col justify-center">
                {/* Description */}
                <p className="text-base lg:text-lg text-gray-700 mb-8 leading-relaxed">
                  Cùng với hơn 100 doanh nghiệp đối tác, chúng tôi cung cấp xăng
                  dầu, LPG, dầu nhớt và giải pháp năng lượng tái tạo; tiêu chuẩn
                  an toàn – chất lượng quốc tế, mạng lưới phủ khắp, đáp ứng
                  nhanh cho cả doanh nghiệp và hộ gia đình.
                </p>

                {/* About Us Link */}
                <div>
                  <Link
                    href="/about"
                    className="inline-flex items-center text-red-600 font-semibold hover:underline"
                  >
                    Về chúng tôi
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Row 2 Col 2 - Stats */}
              <div className="flex flex-col justify-center space-y-8">
                {/* 36 Units Section */}
                <div className="flex flex-col gap-4">
                  {/* Number 36 and Label */}
                  <div className="flex items-start gap-6">
                    <div className="text-[48.4px] font-bold leading-[50px] text-[#B6E388]">
                      36
                    </div>
                    <div className="font-bold text-[17.5px] text-[#B6E388] mt-2">
                      đơn vị thành viên
                    </div>
                  </div>

                  {/* Description below 36 */}
                  <p className="text-base lg:text-lg text-gray-700">
                    Kinh doanh và phân phối các sản phẩm xăng dầu và năng lượng
                    xanh
                  </p>
                </div>

                {/* 35.1 Section */}
                <div className="flex flex-col gap-4">
                  {/* Number 35.1 and Label */}
                  <div className="flex items-start gap-6">
                    <div className="text-[48.4px] font-bold leading-[50px] text-[#B6E388]">
                      35.1
                    </div>
                    <div className="font-bold text-[17.5px] text-[#B6E388] mt-2">
                      nghìn tỷ đồng
                    </div>
                  </div>

                  {/* Description below 35.1 */}
                  <p className="text-base lg:text-lg text-gray-700">
                    Tổng vốn điều lệ của F4 group
                  </p>
                </div>

                {/* 3636 Number with Description */}
                <div className="flex flex-col gap-4">
                  {/* Number 3636 */}
                  <div className="text-[48.4px] font-bold leading-[50px] text-[#B6E388]">
                    3636
                  </div>

                  {/* Description below 3636 */}
                  <p className="text-lg text-gray-700">
                    Dự án về giải pháp xăng dầu và dự án năng lượng đã được thực
                    hiện
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="flex items-center justify-center lg:justify-end">
              <Image
                src="/assets/images/2.png" // đường dẫn từ public
                alt="Hydrogen fuel storage with wind turbines"
                width={600} // đặt width và height phù hợp
                height={500}
                className="w-full max-w-md rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lĩnh vực hoạt động Section */}
      <section className="w-full h-[712px] py-12 px-32 bg-white">
        <h2
          className="text-[55px] font-bold mb-8"
          style={{ width: "542px", height: "110px", lineHeight: "70px" }}
        >
          Lĩnh vực hoạt động
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[400px] h-[500px] bg-gray-200 rounded-lg flex flex-col items-center justify-center">
            <div className="text-2xl font-bold mb-4">1. Xăng dầu</div>
            <div className="w-full h-[400px] bg-gray-300 rounded"></div>
          </div>
          <div className="min-w-[400px] h-[500px] bg-gray-200 rounded-lg flex flex-col items-center justify-center">
            <div className="text-2xl font-bold mb-4">
              2. Năng lượng mặt trời
            </div>
            <div className="w-full h-[400px] bg-gray-300 rounded"></div>
          </div>
          <div className="min-w-[400px] h-[500px] bg-gray-200 rounded-lg flex flex-col items-center justify-center">
            <div className="text-2xl font-bold mb-4">
              3. Điện gió và thủy điện
            </div>
            <div className="w-full h-[400px] bg-gray-300 rounded"></div>
          </div>
          <div className="min-w-[400px] h-[500px] bg-gray-200 rounded-lg flex flex-col items-center justify-center">
            <div className="text-2xl font-bold mb-4">
              4. Giải pháp môi trường
            </div>
            <div className="w-full h-[400px] bg-gray-300 rounded"></div>
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật Section */}
      <section className="w-full py-12 px-32 bg-white">
        <h2 className="text-[55px] font-bold mb-8">Sản phẩm nổi bật</h2>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 relative">
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="relative">
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                  <Image
                    src="/assets/images/3.png"
                    alt="Product Image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-[#B6E388] text-white px-4 py-2 rounded font-bold">
                  100W
                </div>
              </div>
              <div className="mt-4">
                <p className="font-bold text-lg mb-2">
                  SOLAR PANEL MONO-CRYSTALLINE
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  <span className="text-blue-500 font-semibold">
                    Blue Carbon
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Tên sản phẩm</label>
                <p className="font-semibold">SOLAR PANEL MONO-CRYSTALLINE</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Xuất xứ</label>
                <p className="font-semibold">-</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Giá niêm yết</label>
                <p className="font-semibold">-</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Giá khuyến mãi</label>
                <p className="font-semibold text-red-600">-</p>
              </div>
            </div>

            {/* Discount Badge */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">%</span>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Tin tức và dự báo Section */}
      <section className="w-full py-12 px-32 bg-white">
        <h2 className="text-[55px] font-bold mb-8">Tin tức và dự báo</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Left - Infographic */}
          <div className="col-span-1">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <h3 className="font-bold text-lg mb-4">
                VIỆT NAM CHÚ TRỌNG PHÁT TRIỂN CÁC NGUỒN NĂNG LƯỢNG SẠCH, NĂNG
                LƯỢNG TÁI TẠO
              </h3>
              <div className="h-32 bg-blue-800 rounded"></div>
            </div>
            <div className="bg-white border-2 border-gray-200 p-6 rounded-b-lg">
              <h4 className="font-bold text-lg mb-4">
                BA ĐỊNH HƯỚNG LỚN CƠ CẤU NGUỒN NĂNG LƯỢNG CỦA VIỆT NAM
                2021-2030, TẦM NHÌN ĐẾN 2045
              </h4>
              <div className="space-y-4 text-sm">
                <p>
                  Thúc đẩy đa dạng hóa các nguồn năng lượng, chú trọng phát
                  triển các nguồn năng lượng sạch, năng lượng tái tạo
                </p>
                <p>
                  Đối với nguồn năng lượng hóa thạch, có lộ trình giảm dần và
                  hầu như không phát triển thêm nhà máy nhiệt điện than mới
                </p>
                <p>Tăng cường sử dụng năng lượng tiết kiệm và hiệu quả</p>
              </div>
            </div>
          </div>

          {/* Right - News and Forecast */}
          <div className="col-span-1 space-y-6">
            <div className="border-2 border-purple-300 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Thông tin tin tức</h3>
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 rounded"></div>
                <div className="h-32 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Dự báo giá xăng dầu</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-2">Hôm nay</p>
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Ngày mai</p>
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12 px-32">
        <h2 className="text-3xl font-bold text-center mb-8">
          Liên hệ với chúng tôi
        </h2>
        <div className="grid grid-cols-2 gap-12">
          {/* Left - Form and Social */}
          <div>
            <div className="mb-6">
              <div className="text-2xl font-bold mb-4">Z-ENERGY</div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white">f</span>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white">@</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white">t</span>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Họ và tên..."
                className="w-full px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400"
              />
              <input
                type="email"
                placeholder="Email..."
                className="w-full px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400"
              />
              <input
                type="tel"
                placeholder="Số điện thoại..."
                className="w-full px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400"
              />
              <textarea
                placeholder="Nội dung..."
                rows={4}
                className="w-full px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="w-full py-3 rounded bg-[#FFF57E] text-black font-bold hover:opacity-90 transition-opacity"
              >
                GỬI THÔNG TIN
              </button>
            </form>
          </div>

          {/* Right - Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span>@</span>
              </div>
              <span>minhanh2275zh@gmail.com</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span>📞</span>
              </div>
              <span>(024) 3791 4111</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span>📍</span>
              </div>
              <span>
                Tòa nhà Intracom, số 33 Cầu Diễn, phường Xuân Phương, TP. Hà Nội
              </span>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-gray-700 text-sm text-gray-400">
          © Copyright 2025 Z-ENERGY Group. All rights reserved. Designed and
          developed by Z-ENERGY
        </div>
      </footer>
    </div>
  );
=======
import Header from '@/components/home/Header'
import HeroSection from '@/components/home/HeroSection'
import MarketPrices from '@/components/home/MarketPrices'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import SolutionsSection from '@/components/home/SolutionsSection'
import WhyEnergyMarket from '@/components/home/WhyEnergyMarket'
import VerifiedSuppliers from '@/components/home/VerifiedSuppliers'
import NewsEvents from '@/components/home/NewsEvents'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <HeroSection />
        <MarketPrices />
        <CategoriesSection />
        <FeaturedProducts />
        <SolutionsSection />
        <WhyEnergyMarket />
        <VerifiedSuppliers />
        <NewsEvents />
      </main>
      <Footer />
    </div>
  )
>>>>>>> c4ae9d3 (Cập nhật giao diện trang chủ, đăng ký và thêm assets)
}
