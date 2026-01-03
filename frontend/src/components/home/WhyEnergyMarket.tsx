'use client'

import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

export default function WhyEnergyMarket() {
  const benefits = [
    {
      title: 'Mạng lưới toàn cầu',
      desc: 'Kết nối với hơn 500+ nhà cung cấp uy tín.',
    },
    {
      title: 'Chất lượng đảm bảo',
      desc: 'Quy trình kiểm định khắt khe cho mọi sản phẩm.',
    },
    {
      title: 'Minh bạch về giá',
      desc: 'Cập nhật giá thị trường theo thời gian thực.',
    },
    {
      title: 'Hỗ trợ 24/7',
      desc: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng.',
    },
  ]

  const testimonials = [
    {
      name: 'Nguyễn Thanh V',
      role: 'Giám đốc vận hành, PetroVietnam',
      quote: 'EnergyMarket đã giúp chúng tôi tiết kiệm 15% chi phí năng lượng hàng năm nhờ việc kết nối trực tiếp với nhà sản xuất.',
      avatar: '/assets/images/why1.jpg'
    },
    {
      name: 'Trần Thị B',
      role: 'Quản lý dự án, Solar Group',
      quote: 'Giao diện trực quan, dữ liệu thời gian thực giúp chúng tôi đưa ra quyết định nhập hàng chính xác vào thời điểm giá tốt nhất.',
      avatar: '/assets/images/why3why.jpeg'
    },
    {
      name: 'Lê Minh C',
      role: 'Kỹ sư trưởng, EVN',
      quote: 'Chúng tôi đánh giá cao sự minh bạch và đội ngũ hỗ trợ nhiệt tình. Đây là nền tảng đáng tin cậy cho ngành năng lượng.',
      avatar: '/assets/images/wh3why.jpeg'
    }
  ]

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* 👇 TRÁI - TRƯỢT TỪ TRÁI QUA PHẢI (slide-in-from-left) */}
          <div className="animate-in fade-in slide-in-from-left-20 duration-1000 fill-mode-both">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight antialiased">
              Tại sao chọn{' '}
              <span className="text-emerald-600">EnergyMarket</span>?
            </h2>

            <p className="text-gray-600 text-base leading-relaxed mb-10 max-w-xl font-medium antialiased">
              Chúng tôi không chỉ là một sàn giao dịch, mà là đối tác chiến lược
              đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-1 transition-all duration-300 group-hover:bg-emerald-500 group-hover:scale-110">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M5 13L9 17L19 7" 
                        stroke="currentColor" 
                        className="text-emerald-600 group-hover:text-white" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wide antialiased">
                      {b.title}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed font-medium antialiased">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/about">
              <button className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300 text-sm shadow-sm active:scale-95">
                Tìm hiểu thêm về chúng tôi
              </button>
            </Link>
          </div>

          {/* 👇 PHẢI - TRƯỢT TỪ PHẢI QUA TRÁI (slide-in-from-right) */}
          <div className="relative animate-in fade-in slide-in-from-right-20 duration-1000 delay-200 fill-mode-both">
            <div className="relative h-[400px] rounded-[2.5rem] bg-gray-50 p-1 border border-gray-100 shadow-2xl overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                className="h-full w-full"
              >
                {testimonials.map((t, index) => (
                  <SwiperSlide key={index}>
                    <div className="h-full flex flex-col justify-center p-10 md:p-12 relative">
                      <div className="text-emerald-500 text-6xl mb-6 font-serif opacity-30 select-none">“</div>

                      <p className="text-gray-800 text-lg md:text-xl font-bold leading-snug italic mb-8 relative z-10 antialiased tracking-tight">
                        {t.quote}
                      </p>

                      <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-md">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-bold text-gray-900 text-sm antialiased">
                            {t.name}
                          </p>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest antialiased">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet { background: #d1d5db !important; opacity: 1; }
        .swiper-pagination-bullet-active {
          background: #059669 !important;
          width: 20px !important;
          border-radius: 10px !important;
          transition: all 0.3s ease;
        }
      `}</style>
    </section>
  )
}