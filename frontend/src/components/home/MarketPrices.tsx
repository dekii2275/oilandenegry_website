'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/api';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MarketPrice {
  id: number;
  name: string;
  price: string;
  change: string;
  percent: number;
  isPositive: boolean;
  updatedAt: string;
  chartData: { value: number }[]; // Dữ liệu cho biểu đồ mini
}

export default function MarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');

  const formatRelativeTime = (dateString: string) => {
    const updatedDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - updatedDate.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    return updatedDate.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.MARKET.DATA);
        if (!response.ok) throw new Error('Kết nối thất bại');
        
        const json = await response.json();
        const apiData = json.data;

        const nameMap: { [key: string]: string } = {
          BRENT: 'Dầu Brent',
          WTI: 'Dầu WTI',
          GAS: 'Khí tự nhiên',
          SOLAR: 'Chỉ số Điện mặt trời',
        };

        const mappedPrices: MarketPrice[] = apiData.map((item: any, index: number) => {
          // Tạo dữ liệu biểu đồ mô phỏng dựa trên giá trị thực từ API
          const basePrice = item.price;
          const sparkline = Array.from({ length: 10 }, (_, i) => ({
            value: basePrice + (Math.random() - 0.5) * (basePrice * 0.015)
          }));

          return {
            id: index + 1,
            name: nameMap[item.name] || item.name,
            price: item.name === 'SOLAR' ? item.price.toLocaleString() : `$${item.price.toFixed(2)}`,
            change: `${item.change >= 0 ? '+' : ''}${item.percent}%`,
            percent: item.percent,
            isPositive: item.status === 'up',
            updatedAt: item.updated_at,
            chartData: sparkline
          };
        });

        setPrices(mappedPrices);
        if (mappedPrices.length > 0) {
          setLastUpdatedText(formatRelativeTime(mappedPrices[0].updatedAt));
        }
      } catch (error) {
        console.error('Market API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-lg border border-gray-100"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tỷ giá thị trường trực tuyến</h2>
            <p className="text-gray-400 text-[10px] mt-1 italic">
              Dữ liệu cập nhật từ Yahoo Finance • {lastUpdatedText}
            </p>
          </div>
          
          <Link 
            href="/market" 
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Xem báo cáo chi tiết đầy đủ →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {prices.map((item) => (
            <div key={item.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all group relative overflow-hidden">
              <h3 className="text-gray-600 font-semibold text-xs mb-3 uppercase tracking-wider">{item.name}</h3>
              
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{item.price}</span>
                <span
                  className={`text-xs font-semibold ${
                    item.isPositive ? 'text-teal-600' : 'text-red-500'
                  }`}
                >
                  {item.change}
                </span>
              </div>

              {/* Biểu đồ Sparkline nằm dưới giá */}
              <div className="h-[40px] w-full mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.chartData}>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={item.isPositive ? '#0d9488' : '#ef4444'} 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <span className={`w-1.5 h-1.5 rounded-full ${item.isPositive ? 'bg-teal-500' : 'bg-red-500'} animate-pulse`}></span>
                <p className="text-gray-400 text-[10px] font-bold">Cập nhật</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}