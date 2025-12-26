'use client'

import Link from 'next/link'

// Interface cho NewsItem
interface NewsItem {
  id: number | string
  title: string
  category?: string
  excerpt?: string
  description?: string
  image?: string
  image_url?: string
  link?: string
  slug?: string
  created_at?: string
}

interface NewsEventsProps {
  newsData?: NewsItem[] | null
}

// Fallback data khi API chưa sẵn sàng
const fallbackNews: NewsItem[] = [
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

export default function NewsEvents({ newsData }: NewsEventsProps) {
  // Sử dụng data từ props nếu có, nếu không thì dùng fallback
  const news: NewsItem[] = newsData && newsData.length > 0 ? newsData : fallbackNews

  // Normalize data để đảm bảo có đủ các trường cần thiết
  const normalizedNews = news.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category || 'TIN TỨC',
    excerpt: item.excerpt || item.description || '',
    image: item.image || item.image_url || '/assets/images/logo.png',
    link: item.link || (item.slug ? `/news/${item.slug}` : item.id ? `/news/${item.id}` : '#'),
  }))

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Tin tức &amp; Sự kiện
          </h2>

          <Link
            href="/products"
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            Xem tất cả tin tức
          </Link>
        </div>

        {/* News list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {normalizedNews.map((item) => (
            <Link key={item.id} href={item.link}>
              <div className="group cursor-pointer">
                {/* Image / Logo box */}
                <div className="h-[150px] rounded-2xl bg-gray-200 overflow-hidden mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    onError={(e) => {
                      // Fallback nếu ảnh không tải được
                      const target = e.target as HTMLImageElement
                      target.src = '/assets/images/logo.png'
                    }}
                  />
                </div>

                {/* Category */}
                {item.category && (
                  <p className="text-emerald-600 text-xs font-semibold uppercase mb-2">
                    {item.category}
                  </p>
                )}

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-emerald-600 transition line-clamp-2">
                  {item.title}
                </h3>

                {/* Excerpt */}
                {item.excerpt && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
