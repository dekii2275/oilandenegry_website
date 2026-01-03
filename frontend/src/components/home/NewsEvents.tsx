'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// ✅ Định nghĩa Interface khớp với file NewsPage (camelCase)
interface NewsItem {
  id: number | string
  title: string
  slug: string
  imageUrl?: string    // 👈 Đổi từ image_url sang imageUrl
  summary?: string     
  category?: string
  publishedAt?: string // 👈 Đổi từ published_at sang publishedAt
}

interface NewsEventsProps {
  newsData?: NewsItem[] | null
}

export default function NewsEvents({ newsData }: NewsEventsProps) {
  const [displayNews, setDisplayNews] = useState<NewsItem[]>([])
  const [domLoaded, setDomLoaded] = useState(false)

  useEffect(() => {
    setDomLoaded(true)
    if (newsData && newsData.length > 0) {
      // ✅ Xáo trộn ngẫu nhiên
      const shuffled = [...newsData].sort(() => 0.5 - Math.random())
      setDisplayNews(shuffled)
    }
  }, [newsData])

  // ✅ Hàm xử lý ảnh giống hệt logic file NewsPage
  const getImageUrl = (url?: string) => {
    if (!url) return "/assets/images/placeholder.png"; // Dùng placeholder giống NewsPage
    if (url.startsWith('http')) return url;
    return `https://zenergy.cloud${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (!domLoaded || !displayNews || displayNews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Tin tức &amp; Sự kiện
          </h2>
          <Link href="/news" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
            Xem tất cả tin tức &rarr;
          </Link>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          loop={displayNews.length >= 3}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-16 news-swiper"
        >
          {displayNews.map((item) => (
            <SwiperSlide key={item.id}>
              <Link href={`/news/${item.slug}`} className="block h-full">
                <div className="group flex flex-col h-[450px] bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-[200px] w-full shrink-0">
                    {/* ✅ Sử dụng imageUrl (camelCase) khớp với Backend Service */}
                    <img
                      src={getImageUrl(item.imageUrl)} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/placeholder.png";
                      }}
                    />
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 flex-grow">
                      {item.summary}
                    </p>
                    <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-400">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Mới nhất'}
                      </span>
                      <span className="text-emerald-600 font-bold">Đọc tiếp</span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .news-swiper .swiper-button-next,
        .news-swiper .swiper-button-prev {
          color: #10b981 !important;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transform: scale(0.6);
        }
        .news-swiper .swiper-pagination-bullet-active {
          background: #10b981 !important;
        }
      `}</style>
    </section>
  )
}