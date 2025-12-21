'use client'

import Link from 'next/link'

export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: 'Hệ thống Điện mặt trời (50kW)',
      company: 'GREENTECH SOLUTIONS',
      note:
        'Gói hoàn chỉnh bao gồm biến tần, hệ thống khung giá đỡ và tấm pin hiệu suất cao.',
      price: '$12,450',
      badge: 'Còn hàng',
      badgeColor: 'bg-emerald-500',
      image: '/assets/images/pic_2.png',
      link: '#',
    },
    {
      id: 2,
      name: 'Máy phát điện Diesel 500kVA',
      company: 'HEAVY DUTY POWER',
      note:
        'Nguồn điện dự phòng tin cậy cho các khu công nghiệp. Đạt chuẩn khí thải thấp.',
      price: 'Liên hệ báo giá',
      badge: 'Đặt trước',
      badgeColor: 'bg-blue-500',
      image: '/assets/images/pic_3.png',
      link: '#',
    },
    {
      id: 3,
      name: 'Dầu thô ngọt nhẹ (WTI)',
      company: 'GLOBAL PETROLEUM',
      note:
        'Đơn hàng tối thiểu 1,000 thùng. Giao hàng FOB Houston. Sẵn sàng giao ngay.',
      price: 'Giá thị trường',
      badge: 'Bán sỉ',
      badgeColor: 'bg-orange-500',
      image: '/assets/images/pic_4.png',
      link: '#',
    },
  ]

  return (
    <section className="py-14 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-500 text-sm">
              Các sản phẩm năng lượng chất lượng cao được tuyển chọn.
            </p>
          </div>

          <Link
            href="#"
            className="text-emerald-600 font-medium text-sm hover:text-emerald-700"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <Link key={product.id} href={product.link}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition h-full flex flex-col">
                {/* Image */}
                <div className="relative h-[180px] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold ${product.badgeColor}`}
                  >
                    {product.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Company */}
                  <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {product.company}
                  </p>

                  {/* Name */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                    {product.name}
                  </h3>

                  {/* Note / Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    {product.note}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 mb-4" />

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-base font-bold text-gray-900">
                      {product.price}
                    </span>

                    <button className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full inline-flex items-center gap-2 transition text-sm shadow-sm">
            Xem tất cả sản phẩm
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
