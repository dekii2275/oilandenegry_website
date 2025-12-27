"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  source: string;
  published_at: string;
  views: number;
}

// --- SỬA LẠI DANH MỤC TẠI ĐÂY ---
const CATEGORIES = [
  { id: "ALL", label: "Tất cả" },
  { id: "Thị trường năng lượng", label: "Năng lượng" }, // <--- Đã sửa Label thành "Năng lượng"
  { id: "Dầu khí", label: "Dầu khí" },
  { id: "Năng lượng tái tạo", label: "Điện mặt trời & Gió" },
  { id: "Công nghệ xanh", label: "Công nghệ" },
  { id: "Chính sách", label: "Chính sách" },
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  
  // State cho Newsletter
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  
  const itemsPerPage = 10; 

  // --- KẾT NỐI BACKEND ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!baseUrl) return; 

        const skip = (page - 1) * itemsPerPage;
        let url = `${baseUrl}/news/?skip=${skip}&limit=${itemsPerPage}`;
        if (category !== "ALL") {
          url += `&category=${encodeURIComponent(category)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch news");
        
        const data = await res.json();
        setNews(data);
      } catch (error) {
        console.error("Lỗi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, page]);

  // --- XỬ LÝ ĐĂNG KÝ NEWSLETTER ---
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Vui lòng nhập email hợp lệ!");
      return;
    }

    try {
      setSubscribing(true);
      // Giả lập delay mạng
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Đăng ký thành công! Cảm ơn bạn đã quan tâm đến Z-Energy.");
      setEmail("");
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* ===== PAGE TITLE ===== */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Tin tức Năng lượng
          </h1>
          <p className="text-gray-600">
            Cập nhật xu hướng thị trường, giá dầu và công nghệ mới nhất
          </p>
        </div>

        {/* ===== CATEGORY TABS ===== */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex justify-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.id
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== NEWS LIST ===== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Chưa có tin tức nào trong mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* FEATURED NEWS (Item 1) */}
            <div className="col-span-12 lg:col-span-8">
              {news[0] && (
                <Link href={`/news/${news[0].slug}`} className="group block relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
                   <div className="absolute inset-0 bg-gray-200">
                      <img 
                        src={news[0].image_url || "/images/news-placeholder.jpg"} 
                        alt={news[0].title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800";
                        }}
                      />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                      <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-md mb-3 w-fit">
                        {news[0].category}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-green-400 transition-colors">
                        {news[0].title}
                      </h2>
                      <p className="text-gray-200 line-clamp-2 md:w-3/4 text-sm md:text-base">
                        {news[0].summary}
                      </p>
                      <div className="flex items-center gap-4 text-gray-400 text-xs md:text-sm mt-4">
                         <span>📅 {formatDate(news[0].published_at)}</span>
                         <span>👁️ {news[0].views}</span>
                         <span>📰 {news[0].source}</span>
                      </div>
                   </div>
                </Link>
              )}
            </div>

            {/* SIDE LIST (Item 2 & 3) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {news.slice(1, 3).map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group flex-1 flex flex-col">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={item.image_url || "/images/news-placeholder.jpg"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800";
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 text-sm md:text-base">
                      {item.title}
                    </h3>
                    <div className="mt-auto flex justify-between text-xs text-gray-500">
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* GRID LIST (Item 4+) */}
            <div className="col-span-12">
               <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-green-600 pl-3">
                 Tin mới cập nhật
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {news.slice(3).map((item) => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition group flex flex-col h-full">
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <img 
                          src={item.image_url} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800";
                          }}
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                          {item.summary}
                        </p>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                          <span>{formatDate(item.published_at)}</span>
                          <span>{item.source}</span>
                        </div>
                      </div>
                    </Link>
                 ))}
               </div>
            </div>

          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center mt-12 gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm transition"
          >
            Trước
          </button>
          <span className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold shadow-md">
            Trang {page}
          </span>
          <button 
            disabled={news.length < itemsPerPage}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm transition"
          >
            Sau
          </button>
        </div>
      </main>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section className="bg-gradient-to-r from-green-900 to-green-800 py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận bản tin Z-Energy ⚡</h2>
            <p className="text-green-100 mb-8">
              Cập nhật những thông tin mới nhất về thị trường năng lượng, giá dầu biến động và xu hướng công nghệ xanh mỗi tuần.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                className="flex-1 px-5 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              >
                {subscribing ? "Đang xử lý..." : "Đăng ký ngay"}
              </button>
            </form>
            
            <p className="text-xs text-green-200 mt-4 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              Thông tin của bạn được bảo mật tuyệt đối. Hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}