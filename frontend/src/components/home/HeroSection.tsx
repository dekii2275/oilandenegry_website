"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Import CSS bắt buộc
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SLIDES = [
  {
    id: 1,
    // ✅ ĐÃ SỬA: Bỏ "frontend/public", chỉ để từ "/assets..."
    image: "/assets/images/anhherosection1.jpg", 
    badge: "TƯƠNG LAI CỦA NĂNG LƯỢNG",
    title: (
      <>
        Tiếp sức Doanh nghiệp <br />
        với <span className="text-emerald-400">Giải pháp Bền vững</span>
      </>
    ),
    description: "Tìm kiếm sản phẩm xăng dầu, năng lượng tái tạo và giải pháp vận chuyển tối ưu.",
    buttonText: "Khám phá ngay",
  },
  {
    id: 2,
    image: "/assets/images/herosection2.jpg", 
    badge: "CAM KẾT CHẤT LƯỢNG",
    title: (
      <>
        Dẫn đầu xu thế <br />
        cung cấp <span className="text-blue-400">Năng lượng Sạch</span>
      </>
    ),
    description: "Tiên phong trong chuyển đổi và kinh doanh các sản phẩm năng lượng sạch chất lượng cao.",
    buttonText: "Tìm hiểu thêm",
  },
  {
    id: 3,
    image: "/assets/images/herosection3.jpg",
    badge: "CÔNG NGHỆ XANH",
    title: (
      <>
        Tối ưu hóa vận hành <br />
        với <span className="text-yellow-400">Điện mặt trời</span>
      </>
    ),
    description: "Giải pháp tiết kiệm chi phí năng lượng và bảo vệ môi trường cho khu công nghiệp.",
    buttonText: "Liên hệ tư vấn",
  },
];

export default function HeroSection() {
  return (
    <section className="mx-auto my-10 max-w-[1200px] px-4 md:px-0">
      <div className="relative h-[480px] w-full overflow-hidden rounded-3xl shadow-2xl bg-gray-900">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade" 
          fadeEffect={{ crossFade: true }} // ✅ QUAN TRỌNG: Giúp chữ không bị chồng lên nhau khi chuyển cảnh
          speed={1000}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          className="h-full w-full"
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.id} className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] scale-100"
                style={{
                  backgroundImage: `url('${slide.image}')`, // ✅ Sẽ hoạt động nếu ảnh nằm trong public/assets/images/
                }}
              >
                 {/* Overlay tối để nổi bật chữ */}
                 <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative z-20 flex h-full flex-col justify-center px-8 md:px-16 text-white">
                <div className="mb-6 w-fit">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
                    {slide.badge}
                  </span>
                </div>

                <h1 className="mb-6 max-w-3xl text-3xl md:text-[46px] font-extrabold leading-[1.1] drop-shadow-xl">
                  {slide.title}
                </h1>

                <p className="mb-10 max-w-2xl text-sm md:text-base text-gray-100/90 drop-shadow-md">
                  {slide.description}
                </p>

                <button className="w-fit flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-emerald-600 transition-all">
                  {slide.buttonText}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet { background: white !important; opacity: 0.5; }
        .swiper-pagination-bullet-active { opacity: 1; background: #10b981 !important; width: 24px; border-radius: 10px; }
      `}</style>
    </section>
  );
}