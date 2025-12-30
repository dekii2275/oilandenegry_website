// frontend/src/app/market/product/[slug]/utils/chartData.ts

import { ChartDataPoint } from "../types";

// Tạo dữ liệu biểu đồ giả lập
export const generateChartData = (
  basePrice: number,
  isUp: boolean
): ChartDataPoint[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    const baseTrend = isUp ? 0.002 : -0.001;
    const fluctuation = Math.sin(i * 0.5) * 0.02;
    const trend = baseTrend * i;

    const price = basePrice * (1 + trend + fluctuation);
    const forecast = price * (1 + baseTrend + Math.random() * 0.01);

    return {
      name: `${date.getDate()}/${date.getMonth() + 1}`,
      date: date.toLocaleDateString("vi-VN"),
      price: Number(price.toFixed(2)),
      forecast: Number(forecast.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 500,
    };
  });
};

// Tạo dữ liệu biểu đồ theo phạm vi thời gian
export const generateChartDataByRange = (
  basePrice: number,
  isUp: boolean,
  range: string
): ChartDataPoint[] => {
  let dataPoints = 30; // Mặc định 30 ngày

  switch (range) {
    case "7d":
      dataPoints = 7;
      break;
    case "90d":
      dataPoints = 90;
      break;
    case "1y":
      dataPoints = 365;
      break;
    default:
      dataPoints = 30;
  }

  return Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date();
    if (range === "1y") {
      date.setDate(date.getDate() - (dataPoints - 1 - i));
    } else {
      date.setDate(date.getDate() - (dataPoints - 1 - i));
    }

    const baseTrend = isUp ? 0.002 : -0.001;
    const fluctuation = Math.sin(i * 0.5) * 0.02;
    const trend = baseTrend * i;

    let priceMultiplier = 1 + trend + fluctuation;

    // Điều chỉnh biến động cho các phạm vi khác nhau
    if (range === "1y") {
      priceMultiplier += Math.sin(i * 0.1) * 0.1; // Biến động lớn hơn cho 1 năm
    } else if (range === "90d") {
      priceMultiplier += Math.sin(i * 0.2) * 0.05; // Biến động vừa cho 90 ngày
    }

    const price = basePrice * priceMultiplier;
    const forecast = price * (1 + baseTrend + Math.random() * 0.01);

    // Định dạng label theo phạm vi
    let name: string;
    if (range === "7d") {
      name = new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(
        date
      );
    } else if (range === "1y") {
      name = new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(date);
    } else {
      name = `${date.getDate()}/${date.getMonth() + 1}`;
    }

    return {
      name,
      date: date.toLocaleDateString("vi-VN"),
      price: Number(price.toFixed(2)),
      forecast: Number(forecast.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 500,
    };
  });
};

// Tính toán các chỉ số thống kê từ dữ liệu biểu đồ
export const calculateChartStatistics = (chartData: ChartDataPoint[]) => {
  if (!chartData || chartData.length === 0) {
    return {
      currentPrice: 0,
      change: 0,
      changePercent: 0,
      high: 0,
      low: 0,
      avgVolume: 0,
    };
  }

  const prices = chartData.map((d) => d.price);
  const volumes = chartData.map((d) => d.volume);

  const currentPrice = prices[prices.length - 1];
  const startingPrice = prices[0];
  const change = currentPrice - startingPrice;
  const changePercent = (change / startingPrice) * 100;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const avgVolume = Math.round(
    volumes.reduce((a, b) => a + b, 0) / volumes.length
  );

  return {
    currentPrice,
    change,
    changePercent,
    high,
    low,
    avgVolume,
  };
};

// Lấy dữ liệu volume cho biểu đồ volume riêng biệt
export const generateVolumeData = (chartData: ChartDataPoint[]) => {
  return chartData.map((point) => ({
    name: point.name,
    volume: point.volume,
    price: point.price,
  }));
};
