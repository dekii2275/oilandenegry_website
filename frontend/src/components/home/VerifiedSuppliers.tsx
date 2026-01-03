'use client'

import { useRef } from 'react'
import Image from 'next/image' 
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

interface Supplier {
  id: number
  name: string
  rating: number
  reviews: number
  logo: string
}

export default function VerifiedSuppliers() {
  const swiperRef = useRef<any>(null)

  const suppliers: Supplier[] = [
    { id: 1, name: 'Apex Energy', rating: 4.9, reviews: 120, logo: '/assets/images/apex.jpeg' },
    { id: 2, name: 'LS Energy Solution', rating: 4.8, reviews: 85, logo: '/assets/images/logo2logo.jpeg' },
    { id: 3, name: 'Digital EG', rating: 4.7, reviews: 210, logo: '/assets/images/logo3logo.jpeg' },
    { id: 4, name: 'Eco Transport', rating: 4.9, reviews: 56, logo: '/assets/images/logo4logo.png' },
    { id: 5, name: 'Global Gas', rating: 4.6, reviews: 92, logo: '/assets/images/logo5logo.jpeg' },
    { id: 6, name: 'VietFirst Power', rating: 4.5, reviews: 150, logo: '/assets/images/logo6logo.png' },
    { id: 7, name: 'Green Solutions', rating: 4.8, reviews: 77, logo: '/assets/images/logo7logo.jpeg' },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
             <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Nhà cung cấp uy tín
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Đối tác chiến lược đã được Z-Energy xác minh kỹ lưỡng
            </p>
          </div>

          {/* Buttons điều hướng */}
          <div className="flex gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center text-gray-400 transition-all shadow-sm active:scale-95"
            >
              ‹
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center text-gray-400 transition-all shadow-sm active:scale-95"
            >
              ›
            </button>
          </div>
        </div>

        {/* ✅ Swiper Carousel: Đã sửa để nằm gọn trong container */}
        <Swiper
          modules={[Navigation, Autoplay]}
          onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
          }}
          spaceBetween={24} // Khoảng cách giữa các item
          slidesPerView={2}
          grabCursor={true} // Con trỏ chuột hình bàn tay khi kéo
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          className="pb-12" // Padding bottom để bóng đổ không bị cắt
        >
          {suppliers.map((s) => (
            <SwiperSlide key={s.id}>
              <div className="group bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer h-full">
                
                {/* LOGO SLOT */}
                <div className="w-20 h-20 rounded-full bg-gray-50 mx-auto mb-4 flex items-center justify-center overflow-hidden p-3 group-hover:bg-white transition-colors border border-gray-100">
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full transition-transform group-hover:scale-110 duration-500"
                    onError={(e) => {
                       e.currentTarget.style.opacity = '0.3'; 
                    }}
                  />
                </div>

                <h3 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {s.name}
                </h3>

                <div className="inline-flex items-center gap-1 text-[11px] bg-gray-50 py-1 px-2 rounded-md group-hover:bg-emerald-50 transition-colors border border-gray-100">
                  <span className="text-yellow-500">★</span>
                  <span className="font-bold text-gray-700">{s.rating}</span>
                  <span className="text-gray-400">({s.reviews})</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}