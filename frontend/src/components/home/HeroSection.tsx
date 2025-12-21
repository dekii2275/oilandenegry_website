'use client'

export default function HeroSection() {
  return (
    <section
      className="relative mx-auto my-10 overflow-hidden rounded-3xl text-white"
      style={{
        width: '1200px',
        height: '480px',
        backgroundImage: "url('/assets/images/pic_1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay tối đều giống ảnh */}
      <div className="absolute inset-0 rounded-3xl bg-black/55" />

      {/* Glow + đường cong giống ảnh (vòng cung dày + line mảnh) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1200 480"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* VÒNG CUNG DÀY (điểm khác biệt chính so với code bạn) */}
          <path
            d="M760 -40 C 920 120, 980 260, 1080 540"
            stroke="#22c55e"
            strokeWidth="26"
            opacity="0.65"
            fill="none"
          />

          {/* Line glow mảnh phía sau (giống các vệt sáng trong ảnh) */}
          <path
            d="M820 -60 C 980 120, 1060 260, 1160 520"
            stroke="#22c55e"
            strokeWidth="6"
            opacity="0.55"
            fill="none"
            filter="url(#glow)"
          />
          <path
            d="M860 -80 C 1040 140, 1120 280, 1220 520"
            stroke="#22c55e"
            strokeWidth="4"
            opacity="0.35"
            fill="none"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-14">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6 w-fit">
          <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.20456 11.4446L9.07956 8.00011H6.85734L7.26012 4.84733L4.69067 8.55566H6.62123L6.20456 11.4446ZM4.7879 13.5557L5.34345 9.66677H2.56567L7.56567 2.44455H8.67679L8.12123 6.889H11.4546L5.89901 13.5557H4.7879Z" fill="white"/>
</svg>
TƯƠNG LAI CỦA NĂNG LƯỢNG
        </span>

        {/* Title (break giống ảnh) */}
        <h1 className="text-[46px] leading-[1.08] font-extrabold mb-6 max-w-3xl">
          Tiếp sức Doanh nghiệp <br />
          với <span className="text-emerald-400">Giải pháp Bền vững</span>
        </h1>

        {/* Desc */}
        <p className="text-gray-200 text-sm leading-relaxed mb-10 max-w-3xl">
          Tìm kiếm sản phẩm xăng dầu, năng lượng tái tạo và giải pháp vận chuyển tối ưu
          từ mạng lưới nhà cung cấp uy tín toàn cầu.
        </p>

        {/* Search bar (pill full + button nằm lọt bên trong, có viền trắng) */}
        <div className="relative max-w-4xl">
          <div className="flex items-center rounded-full bg-white/95 shadow-lg border border-white/30 h-[52px]">
            <input
              type="text"
              placeholder="Tìm kiếm nhiên liệu, dầu nhớt, hoặc tấm pin mặt trời..."
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm focus:outline-none pl-6 pr-[160px]"
            />

            {/* Button inset */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button className="h-[42px] px-10 rounded-full bg-emerald-500 hover:bg-emerald-600 transition font-semibold text-sm border-2 border-white">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
