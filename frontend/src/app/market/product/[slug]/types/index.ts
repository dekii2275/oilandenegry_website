// frontend/src/app/market/product/[slug]/types/index.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  category: string;
  description: string;
  unit: string;
  location: string;
  isUp: boolean;
  change: string;
  changeFormatted: string;
  source: string;
  fromAPI?: boolean;
  marketDetails?: MarketDetails;
  chartData?: ChartDataPoint[];
  relatedProducts?: RelatedProduct[];
  specifications?: Record<string, string>;
  shippingInfo?: Record<string, string>;
}

export interface MarketDetails {
  high24h: number;
  low24h: number;
  volume: string;
  lastUpdated: string;
  open: number;
  close: number;
  changeValue: string;
  changePercent: string;
  avgVolume: string;
  marketCap: string;
}

export interface ChartDataPoint {
  name: string;
  date: string;
  price: number;
  forecast: number;
  volume: number;
}

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  isUp: boolean;
  change: string;
}
