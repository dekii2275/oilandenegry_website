"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

// Định nghĩa kiểu dữ liệu khớp với Backend
interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  tags: string;
  source: string;
  author: string;
  views: number;
  published_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // State cho bài viết chính
  const [news, setNews] = useState<NewsDetail | null>(null);
  
  // State cho Sidebar (Tin nổi bật/Liên quan) - KHÔNG DÙNG MOCK DATA
  const [relatedNews, setRelatedNews] = useState<NewsDetail[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. GỌI API LẤY CHI TIẾT BÀI VIẾT ---
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl || !slug) return;

        console.log("Đang tải bài viết slug:", slug); // Debug

        // Gọi API lấy chi tiết
        const res = await fetch(`${baseUrl}/news/${slug}`);
        if (!res.ok) {
           if (res.status === 404) throw new Error("Không tìm thấy bài viết này");
           throw new Error("Lỗi kết nối Server");
        }
        const data = await res.json();
        setNews(data);

        // --- 2. GỌI API LẤY TIN LIÊN QUAN (SIDEBAR) ---
        // Gọi thêm 5 bài mới nhất để làm "Tin nổi bật"
        const resRelated = await fetch(`${baseUrl}/news/?limit=5`);
        if (resRelated.ok) {
            const dataRelated = await resRelated.json();
            // Lọc bỏ bài hiện tại đang đọc
            setRelatedNews(dataRelated.filter((item: NewsDetail) => item.slug !== slug));
        }

      } catch (err: any) {
        console.error("Lỗi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [slug]);

  // Format ngày tháng an toàn
  const formatDate = (dateString: string) => {
    if (!dateString) return "Đang cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        weekday: 'long',
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return "Ngày không hợp lệ";
    }
  };

  const tagsArray = news?.tags ? news.tags.split(",") : [];

  // --- MÀN HÌNH LOADING ---
  if (loading) {
     return (
        <>
          <Header />
          <div className="min-h-screen flex flex-col items-center justify-center bg-white">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
             <p className="text-gray-500">Đang tải nội dung...</p>
          </div>
          <Footer />
        </>
     );
  }

  // --- MÀN HÌNH LỖI ---
  if (error || !news) {
    return (
        <>
          <Header />
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
             <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
             <p className="text-xl text-gray-600 mb-8">{error || "Bài viết không tồn tại"}</p>
             <Link href="/news" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg">
                Quay lại trang tin tức
             </Link>
          </div>
          <Footer />
        </>
    );
  }

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        {/* ===== BREADCRUMB ===== */}
        <div className="bg-green-50 py-3 text-sm border-b border-green-100">
          <div className="container mx-auto px-4 text-gray-600 truncate flex items-center gap-2">
            <Link href="/" className="hover:text-green-700">Trang chủ</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-green-700">Tin tức</Link>
            <span>/</span>
            <span className="text-green-700 font-medium truncate max-w-[200px] md:max-w-md">{news.title}</span>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ===== LEFT CONTENT (ARTICLE) ===== */}
          <article className="lg:col-span-8">
            {/* Category Label */}
            <Link href={`/news?category=${news.category}`} className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold mb-4 hover:bg-green-200 transition">
              {news.category?.toUpperCase() || "TIN TỨC"}
            </Link>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-6">
              {news.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-8 border-b pb-6">
              <div className="flex items-center gap-2">
                 <span>✍️</span>
                 <span className="font-medium text-gray-700">{news.author || "Z-Energy Bot"}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span>📅</span>
                 <span>{formatDate(news.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span>👁️</span>
                 <span>{news.views || 0} lượt xem</span>
              </div>
              {news.source && (
                <div className="flex items-center gap-2 md:ml-auto">
                   <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                      Nguồn: {news.source}
                   </span>
                </div>
              )}
            </div>

            {/* Summary (Sapo) */}
            {news.summary && (
                <div className="text-lg font-medium text-gray-700 leading-relaxed mb-8 italic border-l-4 border-green-500 pl-4 bg-gray-50 py-4 pr-4 rounded-r-lg">
                   {news.summary}
                </div>
            )}

            {/* Main Image (Chỉ hiện nếu có) */}
            {news.image_url && (
                <div className="relative w-full h-auto max-h-[500px] mb-10 rounded-2xl overflow-hidden shadow-lg group">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                          e.currentTarget.style.display = 'none'; // Ẩn ảnh nếu lỗi
                      }}
                    />
                </div>
            )}

            {/* --- MARKDOWN CONTENT (NỘI DUNG CHÍNH) --- */}
            <div className="prose prose-lg max-w-none prose-green prose-img:rounded-xl prose-headings:text-green-800 prose-a:text-green-600">
               {news.content ? (
                   <ReactMarkdown>{news.content}</ReactMarkdown>
               ) : (
                   <p className="text-gray-400 italic">Nội dung chi tiết đang được cập nhật...</p>
               )}
            </div>
            
            {/* Tags */}
            {tagsArray.length > 0 && tagsArray[0] !== "" && (
                <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t">
                  <span className="text-sm font-bold text-gray-500 flex items-center mr-2">TAGS:</span>
                  {tagsArray.map((tag, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 border hover:bg-green-50 hover:text-green-700 hover:border-green-200 cursor-pointer transition">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
            )}
          </article>

          {/* ===== RIGHT SIDEBAR (DYNAMIC DATA) ===== */}
          <aside className="lg:col-span-4 space-y-8">
             
             {/* Newsletter Box */}
             <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <h3 className="font-bold text-xl mb-2 relative z-10">Đăng ký bản tin ⚡</h3>
                <p className="text-green-100 text-sm mb-4 relative z-10">Nhận phân tích thị trường năng lượng chuyên sâu mỗi tuần.</p>
                <div className="relative z-10">
                    <input type="email" placeholder="Email của bạn..." className="w-full px-4 py-3 rounded-lg text-gray-900 mb-2 focus:outline-none" />
                    <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition shadow-md">
                        Đăng ký ngay
                    </button>
                </div>
             </div>

             {/* RELATED NEWS (REAL DATA) */}
             <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2 border-b pb-2">
                    <span className="text-green-600">🔥</span> Tin mới cập nhật
                </h3>
                
                {relatedNews.length === 0 ? (
                    <p className="text-gray-500 text-sm">Đang tải tin liên quan...</p>
                ) : (
                    <div className="space-y-4">
                       {relatedNews.map((item) => (
                           <div key={item.id}>
                               <Link href={`/news/${item.slug}`} className="group cursor-pointer block">
                                  <span className="text-[10px] uppercase text-green-600 font-bold tracking-wider">
                                      {item.category || "Tin tức"}
                                  </span>
                                  <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition line-clamp-2 mt-1">
                                     {item.title}
                                  </h4>
                                  <span className="text-xs text-gray-400 mt-1 block">
                                      {formatDate(item.published_at)}
                                  </span>
                               </Link>
                               <hr className="border-gray-100 mt-3"/>
                           </div>
                       ))}
                    </div>
                )}
             </div>

          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}