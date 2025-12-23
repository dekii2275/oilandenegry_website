 "use client";

import { useState } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer"; // nếu path khác, đổi lại cho đúng

type Category = "ALL" | "THI_TRUONG" | "CONG_NGHE" | "SU_KIEN";

export default function NewsPage() {
  const [category, setCategory] = useState<Category>("ALL");

  const news = [
    {
      id: 1,
      title: "Dự báo thị trường năng lượng 2025",
      excerpt:
        "Những bước chuyển mình quan trọng của ngành điện gió trong giai đoạn mới.",
      category: "THI_TRUONG",
      image: "/images/news/hero.jpg",
      hot: true,
    },
    {
      id: 2,
      title: "Hội nghị Thượng đỉnh Năng lượng Xanh 2024",
      excerpt:
        "Sự kiện quy tụ hơn 500 doanh nghiệp và chuyên gia trong lĩnh vực năng lượng.",
      category: "SU_KIEN",
      image: "/images/news/event.jpg",
    },
    {
      id: 3,
      title: "Tấm pin mặt trời thế hệ mới đạt hiệu suất kỷ lục",
      excerpt:
        "Công nghệ pin mặt trời mới giúp tăng hiệu suất và giảm chi phí.",
      category: "CONG_NGHE",
      image: "/images/news/solar.jpg",
    },
  ];

  const filteredNews =
    category === "ALL"
      ? news
      : news.filter((n) => n.category === category);

  const hotNews = news.find((n) => n.hot);

  return (
    <>
      {/* ===== HEADER ===== */}
      <Header />

      <main>
        {/* ===== HERO ===== */}
        <section className="bg-emerald-50 py-16 text-center">
          <span className="text-emerald-600 text-sm font-semibold">
            THÔNG TIN THỊ TRƯỜNG & CỘNG ĐỒNG
          </span>
          <h1 className="text-4xl font-bold mt-2">Tin tức & Sự kiện</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Cập nhật những biến động mới nhất của thị trường năng lượng và các sự
            kiện nổi bật.
          </p>

          <div className="mt-6">
            <input
              placeholder="Tìm kiếm bài viết, chủ đề..."
              className="w-[320px] px-4 py-2 rounded-full border focus:outline-none"
            />
          </div>
        </section>

        {/* ===== FILTER ===== */}
        <section className="container mx-auto py-6 flex gap-3 justify-center">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "THI_TRUONG", label: "Tin tức thị trường" },
            { key: "CONG_NGHE", label: "Công nghệ & Giải pháp" },
            { key: "SU_KIEN", label: "Sự kiện sắp tới" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setCategory(item.key as Category)}
              className={`px-4 py-2 rounded-full border text-sm transition
                ${
                  category === item.key
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              {item.label}
            </button>
          ))}
        </section>

        {/* ===== HOT NEWS ===== */}
        {hotNews && (
          <section className="container mx-auto mb-12">
            <div className="flex flex-col md:flex-row bg-emerald-50 rounded-2xl overflow-hidden">
              <img
                src={hotNews.image}
                alt={hotNews.title}
                className="md:w-1/2 h-64 object-cover"
              />
              <div className="p-6 flex flex-col justify-center">
                <span className="text-sm text-emerald-600 font-semibold">
                  Thị trường năng lượng
                </span>
                <h2 className="text-2xl font-bold mt-2">
                  {hotNews.title}
                </h2>
                <p className="text-gray-600 mt-2">
                  {hotNews.excerpt}
                </p>
                <button className="mt-4 text-emerald-600 font-medium">
                  Đọc chi tiết →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===== LIST ===== */}
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-16">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="rounded-xl overflow-hidden border hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <span className="text-xs text-emerald-600 font-semibold">
                  {item.category.replace("_", " ")}
                </span>
                <h3 className="font-semibold mt-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.excerpt}
                </p>
                <button className="mt-3 text-sm text-emerald-600">
                  Đọc thêm →
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* ===== PAGINATION ===== */}
        <div className="flex justify-center gap-2 pb-12">
          {[1, 2, 3, "...", 8].map((p, i) => (
            <button
              key={i}
              className={`w-9 h-9 rounded-full border text-sm ${
                p === 1 ? "bg-emerald-600 text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ===== NEWSLETTER ===== */}
        <section className="container mx-auto mb-20">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-white text-xl font-semibold">
                Đăng ký nhận bản tin
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Nhận thông tin cập nhật hàng tuần về thị trường năng lượng
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <input
                placeholder="Email của bạn..."
                className="px-4 py-2 rounded-full outline-none"
              />
              <button className="px-5 py-2 rounded-full bg-emerald-600 text-white">
                Đăng ký
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <Footer />
    </>
  );
}
