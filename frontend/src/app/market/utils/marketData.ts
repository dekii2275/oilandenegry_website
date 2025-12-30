// Import từ productUtils
import { mockProducts } from "@/app/(customer)/products/utils/productUtils";

// Type assertion để tránh lỗi TypeScript
const products = mockProducts as any[];

// Filter chỉ lấy các sản phẩm nhiên liệu và năng lượng cho thị trường
export const marketStats = products
  .filter(
    (product) =>
      (product.category || "").includes("Dầu") ||
      (product.category || "").includes("Nhiên liệu") ||
      (product.category || "").includes("Năng lượng") ||
      product.name.includes("Dầu") ||
      product.name.includes("Khí")
  )
  .slice(0, 8) // Lấy 8 sản phẩm đầu
  .map((product, index) => ({
    id: product.id,
    name: product.name,
    location: getLocationByStore(product.store?.name),
    price: formatPrice(product.price || 0),
    change: getRandomChange(),
    isUp: Math.random() > 0.3,
    color: getColorByCategory(product.category || ""),
    slug: generateSlug(product.name),
    unit: product.unit || "đơn vị",
    category: product.category || "Năng lượng",
    description: product.description || "",
  }));

// Hàm hỗ trợ
function getLocationByStore(storeName?: string): string {
  const locationMap: Record<string, string> = {
    "Global Petroleum": "London, UK",
    SolarWorld: "Berlin, Germany",
    "Energy Plus": "New York, USA",
    "GreenTech Solutions": "Singapore",
    "PowerGen International": "Houston, USA",
    "Heavy Duty Power": "Dubai, UAE",
  };
  return storeName ? locationMap[storeName] || "Toàn cầu" : "Toàn cầu";
}

function formatPrice(price: number): string {
  if (price < 100) return price.toFixed(2);
  if (price < 1000) return price.toFixed(0);
  if (price < 1000000) return price.toLocaleString("vi-VN");
  return (price / 1000000).toFixed(1) + "M";
}

function getRandomChange(): string {
  const changes = [
    "+1.2%",
    "+0.8%",
    "-0.5%",
    "+2.1%",
    "+0.3%",
    "-1.1%",
    "+1.5%",
  ];
  return changes[Math.floor(Math.random() * changes.length)];
}

function getColorByCategory(category: string): string {
  const colorMap: Record<string, string> = {
    "Dầu thô & Nhiên liệu": "blue",
    "Điện mặt trời": "yellow",
    "Năng lượng tái tạo": "green",
    "Máy phát điện": "purple",
    "Dầu nhớt công nghiệp": "orange",
    "Dầu thô": "blue",
    "Nhiên liệu": "blue",
  };
  return colorMap[category] || "blue";
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Tạo detailedPrices từ mockProducts
export const detailedPrices = products
  .filter(
    (product) =>
      (product.category || "").includes("Dầu") ||
      (product.category || "").includes("Nhiên liệu") ||
      (product.category || "").includes("Năng lượng")
  )
  .map((product, index) => ({
    id: product.id,
    name: product.name,
    color: getColorByCategory(product.category || ""),
    unit: product.unit || "chiếc",
    price: formatPrice(product.price || 0),
    changeValue: getRandomChangeValue(),
    changePercent: getRandomChange(),
    high: formatPrice((product.price || 0) * (1 + Math.random() * 0.05)),
    low: formatPrice((product.price || 0) * (1 - Math.random() * 0.03)),
  }));

function getRandomChangeValue(): string {
  const values = [
    "+0.98",
    "+0.62",
    "-0.01",
    "+29.5",
    "+1.50",
    "-0.75",
    "+2.10",
  ];
  return values[Math.floor(Math.random() * values.length)];
}

// Tin tức liên quan
export const marketNews = [
  {
    id: 1,
    title: "Căng thẳng địa chính trị đẩy giá dầu lên cao",
    time: "2 giờ trước",
    image:
      "https://images.unsplash.com/photo-1473110158267-24d4b1ee9522?w=100&h=100&fit=crop",
    category: "Chính trị",
    relatedProducts: ["Dầu thô WTI", "Dầu Brent"], // Liên kết với sản phẩm
  },
  {
    id: 2,
    title: "Công nghệ mới giảm chi phí điện mặt trời",
    time: "5 giờ trước",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop",
    category: "Công nghệ",
    relatedProducts: ["Pin năng lượng mặt trời cao cấp", "Tấm pin mặt trời"],
  },
  {
    id: 3,
    title: "Chính sách năng lượng xanh mới tại EU",
    time: "1 ngày trước",
    image:
      "https://images.unsplash.com/photo-1466611653911-95282fc3656b?w=100&h=100&fit=crop",
    category: "Chính sách",
    relatedProducts: [
      "Hệ thống năng lượng mặt trời",
      "Turbine gió công nghiệp",
    ],
  },
];

export const chartTimeRanges = ["1 Tuần", "1 Tháng", "3 Tháng", "1 Năm"];
