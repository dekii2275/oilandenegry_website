// frontend/src/app/market/product/[slug]/utils/productUtils.ts

import { mockProducts } from "@/app/(customer)/products/utils/productUtils";
import { marketStats } from "@/app/market/utils/marketData";
import { Product, MarketDetails, RelatedProduct } from "../types";

// Hàm tạo slug từ tên (phải khớp với hàm generateSlug trong marketData)
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Hàm lấy vị trí từ tên store (giống trong marketData.ts)
export const getLocationByStore = (storeName?: string): string => {
  const locationMap: Record<string, string> = {
    "Global Petroleum": "London, UK",
    SolarWorld: "Berlin, Germany",
    "Energy Plus": "New York, USA",
    "GreenTech Solutions": "Singapore",
    "PowerGen International": "Houston, USA",
    "Heavy Duty Power": "Dubai, UAE",
  };
  return storeName ? locationMap[storeName] || "Toàn cầu" : "Toàn cầu";
};

// Helper function để đảm bảo object có đủ thuộc tính Product
const ensureProductStructure = (data: any, source: string): Product => {
  const basePrice =
    typeof data.price === "string"
      ? parseFloat(data.price.replace(/[$,]/g, ""))
      : data.price || 0;

  const marketDetails = generateMarketDetails(basePrice, data.isUp !== false);

  return {
    id: data.id || `${source}-${generateSlug(data.name || "")}`,
    name: data.name || "",
    slug: data.slug || generateSlug(data.name || ""),
    price: basePrice,
    category: data.category || "Năng lượng",
    description: data.description || "Sản phẩm năng lượng chất lượng cao",
    unit: data.unit || "chiếc",
    location:
      data.location || getLocationByStore(data.store?.name) || "Toàn cầu",
    isUp: data.isUp !== undefined ? data.isUp : true,
    change: data.change || "+1.5%",
    changeFormatted:
      data.changeFormatted ||
      `${marketDetails.changeValue} (${marketDetails.changePercent})`,
    source,
    fromAPI: false,
    store: data.store,
    // Các trường optional sẽ được thêm sau
  };
};

// Hàm tìm sản phẩm trong cả 2 nguồn dữ liệu
export const findProductBySlug = (slug: string): Product | null => {
  // Tìm trong mockProducts (sản phẩm chính)
  const fromMockProducts = mockProducts.find((product: any) => {
    const productSlug = generateSlug(product.name);
    return productSlug === slug;
  });

  // Tìm trong marketStats (thống kê thị trường)
  const fromMarketStats = marketStats.find((stat: any) => {
    // Kiểm tra cả slug hiện có và slug từ name
    const statSlugFromName = generateSlug(stat.name);
    return stat.slug === slug || statSlugFromName === slug;
  });

  // Ưu tiên lấy từ marketStats (vì có nhiều thông tin thị trường hơn)
  if (fromMarketStats) {
    const product = ensureProductStructure(fromMarketStats, "marketStats");

    // Merge thêm thông tin từ mockProducts nếu có
    if (fromMockProducts) {
      Object.assign(product, {
        description: fromMockProducts.description || product.description,
        unit: fromMockProducts.unit || product.unit,
        store: fromMockProducts.store || product.store,
      });
    }

    return product;
  }

  // Nếu không có trong marketStats, dùng từ mockProducts
  if (fromMockProducts) {
    return ensureProductStructure(fromMockProducts, "mockProducts");
  }

  return null;
};

// Tạo thông tin thị trường giả lập
export const generateMarketDetails = (
  price: number,
  isUp: boolean
): MarketDetails => {
  const changePercent = (Math.random() * 3 + 0.5) * (isUp ? 1 : -1);
  const changeValue = price * (changePercent / 100);

  return {
    high24h: Number((price * (1 + Math.random() * 0.03 + 0.02)).toFixed(2)),
    low24h: Number((price * (1 - Math.random() * 0.02 - 0.01)).toFixed(2)),
    volume: `${(Math.random() * 500 + 100).toFixed(1)}K`,
    lastUpdated: new Date().toLocaleTimeString("vi-VN"),
    open: Number((price * (1 - Math.random() * 0.01)).toFixed(2)),
    close: Number((price * (1 + Math.random() * 0.01)).toFixed(2)),
    changeValue: `${changeValue >= 0 ? "+" : ""}${changeValue.toFixed(2)}`,
    changePercent: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(
      2
    )}%`,
    avgVolume: `${(Math.random() * 300 + 50).toFixed(1)}K`,
    marketCap: `$${(price * (Math.random() * 100 + 10)).toFixed(1)}B`,
  };
};

// Tạo sản phẩm liên quan
export const getRelatedProducts = (
  currentSlug: string,
  category: string
): RelatedProduct[] => {
  return marketStats
    .filter((item: any) => {
      const itemCategory = item.category || "";
      return (
        (itemCategory.includes(category.split(" ")[0]) ||
          category.includes(itemCategory.split(" ")[0])) &&
        item.slug !== currentSlug
      );
    })
    .slice(0, 4)
    .map((item: any): RelatedProduct => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[$,]/g, ""))
          : item.price || 0;

      return {
        id: item.id || `related-${item.slug || generateSlug(item.name)}`,
        name: item.name || "",
        slug: item.slug || generateSlug(item.name),
        price: price,
        category: item.category || "Năng lượng",
        isUp: item.isUp !== undefined ? item.isUp : true,
        change: item.change || "+1.5%",
      };
    });
};
