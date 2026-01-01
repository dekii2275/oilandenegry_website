// --- FILE: src/app/news/[slug]/page.tsx ---

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { newsService } from "@/services/news.service";
import type { NewsItem } from "@/types/news";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        if (!slug) return;

        // 1. Gọi API: Dữ liệu nhận về đã chuẩn camelCase và tags là mảng
        const data = await newsService.getNewsById(slug); 
        setNews(data);

        // 2. Tin liên quan
        const relatedData = await newsService.getLatestNews(5);
        setRelatedNews(relatedData.filter((item) => item.slug !== slug));

      } catch (err: any) {
        console.error("Lỗi:", err);
        setError("Không thể tải bài viết này.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [slug]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Đang cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        weekday: 'long', day: "2-digit", month: "2-digit", year: "numeric"
      });
    } catch (e) { return ""; }
  };

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

  if (error || !news) {
    return (
        <>
          <Header />
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
             <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
             <p className="text-xl text-gray-600 mb-8">{error || "Bài viết không tồn tại"}</p>
             <Link href="/news" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Quay lại</Link>
          </div>
          <Footer />
        </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-green-50 py-3 text-sm border-b border-green-100">
          <div className="container mx-auto px-4 text-gray-600 truncate flex items-center gap-2">
            <Link href="/" className="hover:text-green-700">Trang chủ</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-green-700">Tin tức</Link>
            <span>/</span>
            <span className="text-green-700 font-medium truncate max-w-[200px]">{news.title}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <article className="lg:col-span-8">
            <Link href={`/news?category=${news.category}`} className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold mb-4">
              {news.category?.toUpperCase() || "TIN TỨC"}
            </Link>

            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-6">{news.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b pb-6">
              <span className="font-medium text-gray-700">✍️ {news.author}</span>
              <span>📅 {formatDate(news.publishedAt)}</span>
              <span>👁️ {news.views} lượt xem</span>
            </div>

            {news.summary && (
                <div className="text-lg font-medium text-gray-700 italic border-l-4 border-green-500 pl-4 bg-gray-50 py-4 pr-4 rounded-r-lg mb-8">
                   {news.summary}
                </div>
            )}

            {news.imageUrl && (
                <div className="relative w-full h-auto max-h-[500px] mb-10 rounded-2xl overflow-hidden shadow-lg">
                    <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="prose prose-lg max-w-none prose-green">
               {news.content ? <ReactMarkdown>{news.content}</ReactMarkdown> : <p>Đang cập nhật...</p>}
            </div>
            
            {/* ✅ Xử lý TAGS siêu gọn vì Service đã chuyển thành mảng rồi */}
            {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t">
                  <span className="text-sm font-bold text-gray-500 flex items-center mr-2">TAGS:</span>
                  {news.tags.map((tag, idx) => (
                    <span key={idx} className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 border cursor-pointer hover:bg-green-50">
                      #{tag}
                    </span>
                  ))}
                </div>
            )}
          </article>

          {/* Sidebar giữ nguyên logic render */}
          <aside className="lg:col-span-4 space-y-8">
             {/* Newsletter & Tin liên quan (Giữ nguyên code UI của bạn ở đây) */}
             <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-4 border-b pb-2"><span className="text-green-600">🔥</span> Tin mới cập nhật</h3>
                <div className="space-y-4">
                   {relatedNews.map((item) => (
                       <div key={item.id}>
                           <Link href={`/news/${item.slug}`} className="group cursor-pointer block">
                              <h4 className="font-semibold text-gray-800 group-hover:text-green-600 line-clamp-2">{item.title}</h4>
                              <span className="text-xs text-gray-400 mt-1 block">{formatDate(item.publishedAt)}</span>
                           </Link>
                           <hr className="border-gray-100 mt-3"/>
                       </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}