'use client'

import Link from 'next/link'

export default function NewsEvents() {
  const news = [
    {
      id: 1,
      title: 'Dự báo giá dầu thô quý 4: Những điều doanh nghiệp cần biết',
      category: 'THỊ TRƯỜNG NĂNG LƯỢNG',
      excerpt:
        'Phân tích chi tiết về biến động nguồn cung và tác động địa chính trị đến giá dầu toàn cầu trong những tháng cuối năm.',
      image: '/assets/images/news-1.png',
      link: '#',
    },
    {
      id: 2,
      title: 'Đột phá mới trong công nghệ pin mặt trời hiệu suất cao',
      category: 'CÔNG NGHỆ',
      excerpt:
        'Công nghệ PERC mới giúp tăng hiệu suất chuyển đổi năng lượng lên tới 25%, giảm chi phí đầu tư cho doanh nghiệp.',
      image: '/assets/images/news-2.png',
      link: '#',
    },
    {
      id: 3,
      title: 'Hội thảo Quốc tế về Năng lượng Sạch 2024',
      category: 'SỰ KIỆN',
      excerpt:
        'Tham gia cùng các chuyên gia hàng đầu để thảo luận về lộ trình chuyển đổi xanh và cơ hội đầu tư bền vững.',
      image: '/assets/images/news-3.png',
      link: '#',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Tin tức &amp; Sự kiện
          </h2>

          <Link
            href="#"
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            Xem tất cả tin tức
          </Link>
        </div>

        {/* News list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link key={item.id} href={item.link}>
              <div className="group cursor-pointer">
                {/* Image / Logo box */}
                <div className="h-[150px] rounded-2xl bg-gray-200 overflow-hidden mb-4">
                  {/* 👉 bạn thay img này bằng logo / ảnh thật sau */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* Category */}
                <p className="text-emerald-600 text-xs font-semibold uppercase mb-2">
                  {item.category}
                </p>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-emerald-600 transition line-clamp-2">
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
