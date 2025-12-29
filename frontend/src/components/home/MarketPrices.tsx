'use client'; // <--- THÊM DÒNG NÀY Ở DÒNG 1 (BẮT BUỘC)

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api'; 

interface MarketPrice {
  id: number;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

export default function MarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MARKET.DATA);
        const data = await response.json();
        
        // Map dữ liệu từ API thành format component
        const mappedPrices: MarketPrice[] = data.data.map((item: any, index: number) => {
          const nameMap: { [key: string]: string } = {
            BRENT: 'Dầu Brent',
            WTI: 'Dầu WTI',
            GAS: 'Khí tự nhiên',
            SOLAR: 'Chỉ số Điện mặt trời',
          };
          return {
            id: index + 1,
            name: nameMap[item.name] || item.name,
            price: item.name === 'SOLAR' ? item.price.toString() : `$${item.price}`,
            change: `${item.change >= 0 ? '+' : ''}${item.percent}%`,
            isPositive: item.status === 'up',
          };
        });
        setPrices(mappedPrices);
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Fallback to hardcoded data if API fails
        setPrices([
          { id: 1, name: 'Dầu Brent', price: '$82.40', change: '+1.2%', isPositive: true },
          { id: 2, name: 'Dầu WTI', price: '$78.15', change: '+0.8%', isPositive: true },
          { id: 3, name: 'Khí tự nhiên', price: '$2.55', change: '-0.5%', isPositive: false },
          { id: 4, name: 'Chỉ số Điện mặt trời', price: '1420', change: '+0.1%', isPositive: true },
        ]);
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
          <h2 className="text-2xl font-bold text-gray-900">Tỷ giá thị trường trực tuyến</h2>
          <p className="text-gray-500 text-sm mt-2">Đang cập nhật dữ liệu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tỷ giá thị trường trực tuyến</h2>
          <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
            Xem báo cáo chi tiết đầy đủ →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {prices.map((item) => (
            <div key={item.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-gray-600 font-semibold text-xs mb-3">{item.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-gray-900">{item.price}</span>
                <span
                  className={`text-xs font-semibold ${
                    item.isPositive ? 'text-teal-600' : 'text-red-500'
                  }`}
                >
                  {item.change}
                </span>
              </div>
              <p className="text-gray-400 text-xs">✓ Cập nhật</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}