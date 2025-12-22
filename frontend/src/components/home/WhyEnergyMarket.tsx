'use client'

import Link from 'next/link'

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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn{' '}
              <span className="text-emerald-600">EnergyMarket</span>?
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-10 max-w-xl">
              Chúng tôi không chỉ là một sàn giao dịch, mà là đối tác chiến lược
              đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-3">
                  {/* Check */}
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13L9 17L19 7"
                        stroke="#16A34A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      {b.title}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="#">
              <button className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-2.5 px-6 rounded-full transition text-sm">
                Tìm hiểu thêm về chúng tôi
              </button>
            </Link>
          </div>

          {/* RIGHT – TESTIMONIAL CARD */}
          <div className="relative">
            <div className="relative h-[340px] rounded-2xl bg-gradient-to-b from-gray-100 to-gray-300 p-8 shadow-xl overflow-hidden">
              {/* Watermark */}
              <div className="absolute bottom-10 right-8 text-[56px] font-bold text-black/10 leading-none select-none">
                Energy<br />Corp.
              </div>

              {/* Quote icon */}
              <div className="text-emerald-500 text-3xl mb-4">“</div>

              {/* Quote text */}
              <p className="text-gray-800 text-sm leading-relaxed max-w-md mb-8">
                EnergyMarket đã giúp chúng tôi tiết kiệm 15% chi phí năng lượng
                hàng năm nhờ việc kết nối trực tiếp với nhà sản xuất.
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200">
  <img
    src="/assets/images/NguyenVanA.png"
    alt="Nguyễn Văn A"
    className="w-full h-full object-cover"
  />
</div>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Nguyễn Văn A
                  </p>
                  <p className="text-gray-600 text-xs">
                    Giám đốc vận hành, PetroVietnam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
