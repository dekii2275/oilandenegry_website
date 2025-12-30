"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, Globe } from "lucide-react";

interface RealNews {
  title: string;
  publishedAt: string;
  urlToImage: string;
  url: string;
  source: { name: string };
}

export default function MarketNews() {
  const [newsList, setNewsList] = useState<RealNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRealEnergyNews = async () => {
      setIsLoading(true);
      setError(false);

      // API Key của bạn từ NewsAPI.org
      const API_KEY = "YOUR_API_KEY_HERE";
      // Query tìm kiếm tin tức về năng lượng, dầu khí bằng tiếng Việt và tiếng Anh
      const query = encodeURIComponent(
        'energy market OR "giá dầu" OR "năng lượng"'
      );
      const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API Limit Reached or Error");

        const data = await response.json();

        // Lọc bỏ các tin không có ảnh hoặc bị lỗi
        const validNews = data.articles.filter(
          (article: RealNews) =>
            article.title && article.urlToImage && article.url
        );

        setNewsList(validNews);
      } catch (err) {
        console.error("Lỗi lấy tin tức thật:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealEnergyNews();
  }, []);

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 flex flex-col h-[450px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-bold text-gray-800 text-sm">
            Tin tức Năng lượng Toàn cầu
          </h2>
          <p className="text-[9px] text-green-600 font-medium uppercase flex items-center gap-1">
            <Globe size={10} /> Live từ Internet
          </p>
        </div>
        {isLoading && (
          <Loader2 size={14} className="animate-spin text-green-500" />
        )}
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {isLoading ? (
          // Skeleton loading đơn giản
          [1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
              <div className="flex-grow space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-2 bg-gray-50 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-[10px] text-red-400">
              Không thể tải tin tức lúc này.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[9px] text-blue-500 underline mt-2"
            >
              Thử lại
            </button>
          </div>
        ) : (
          newsList.map((news, index) => (
            <a
              key={index}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="relative shrink-0">
                <img
                  src={news.urlToImage}
                  className="w-14 h-14 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm"
                  alt=""
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/100?text=Energy")
                  }
                />
              </div>

              <div className="flex flex-col justify-center overflow-hidden">
                <h4 className="text-[11px] font-bold text-gray-700 leading-tight group-hover:text-green-600 transition-all line-clamp-2">
                  {news.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    {news.source.name}
                  </span>
                  <span className="text-[9px] text-gray-300">•</span>
                  <span className="text-[9px] text-gray-400">
                    {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #71c291;
        }
      `}</style>
    </div>
  );
}
