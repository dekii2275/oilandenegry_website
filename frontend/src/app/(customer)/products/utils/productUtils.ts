// frontend/src/app/(customer)/products/utils/productUtils.ts

import type { Product } from "@/types/product";

/**
 * Adapter chuyển từ Product API sang UI Product
 */
export interface UIProduct extends Product {
  status?: "CÓ SẴN" | "ĐẶT TRƯỚC" | "BÁN SỈ" | "HOT" | "MỚI";
  brand?: string;
  oldPrice?: number;
}

/**
 * Chuyển đổi Product từ API sang format UI
 */
export const adaptProductForUI = (product: Product): UIProduct => {
  return {
    ...product,
    status: getProductStatus(product),
    brand: product.store?.name || "Unknown",
    oldPrice: product.old_price,
    image: product.image_url || product.image || "/api/placeholder/400/300",
    price: product.price || 0,
    unit: product.unit || "chiếc",
  };
};

/**
 * Xác định trạng thái sản phẩm
 */
const getProductStatus = (product: Product): UIProduct["status"] => {
  if (product.stock === 0) return "ĐẶT TRƯỚC";
  if (product.stock && product.stock > 100) return "BÁN SỈ";

  // Logic cho mock data
  const id = typeof product.id === "string" ? parseInt(product.id) : product.id;
  if ([3, 8, 20].includes(id)) return "HOT";
  if ([6, 12, 18, 24].includes(id)) return "MỚI";
  if ([2, 10, 23].includes(id)) return "BÁN SỈ";
  if ([5].includes(id)) return "ĐẶT TRƯỚC";

  return "CÓ SẴN";
};

/**
 * Mock data cho đến khi API sẵn sàng
 */
export const mockCategories = [
  { id: 1, name: "Điện mặt trời", slug: "dien-mat-troi" },
  { id: 2, name: "Máy phát điện", slug: "may-phat-dien" },
  { id: 3, name: "Dầu thô & Nhiên liệu", slug: "dau-tho-nhien-lieu" },
  { id: 4, name: "Dầu nhớt công nghiệp", slug: "dau-nhot-cong-nghiep" },
  { id: 5, name: "Vận tải & Logistics", slug: "van-tai-logistics" },
  { id: 6, name: "Năng lượng tái tạo", slug: "nang-luong-tai-tao" },
];

export const mockSuppliers = [
  { id: 1, name: "GreenTech Solutions" },
  { id: 2, name: "Global Petroleum" },
  { id: 3, name: "Heavy Duty Power" },
  { id: 4, name: "SolarWorld" },
  { id: 5, name: "Energy Plus" },
  { id: 6, name: "PowerGen International" },
];

// 24 SẢN PHẨM GIẢ LẬP
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Pin năng lượng mặt trời cao cấp",
    description: "Công suất cao, hiệu suất lên đến 22%",
    category: "Điện mặt trời",
    price: 1200,
    old_price: 1500,
    unit: "tấm",
    image: "/api/placeholder/400/300",
    store: { name: "SolarWorld", id: 4 },
  },
  {
    id: 2,
    name: "Máy phát điện diesel công nghiệp",
    description: "Công suất 500KVA, vận hành êm ái",
    category: "Máy phát điện",
    price: 25000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "PowerGen International", id: 6 },
  },
  {
    id: 3,
    name: "Dầu thô WTI",
    description: "Dầu thô chất lượng cao, API 40",
    category: "Dầu thô & Nhiên liệu",
    price: 75,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Global Petroleum", id: 2 },
  },
  {
    id: 4,
    name: "Dầu nhớt công nghiệp SAE 40",
    description: "Dầu nhớt chất lượng cao cho máy móc",
    category: "Dầu nhớt công nghiệp",
    price: 850,
    old_price: 1000,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Heavy Duty Power", id: 3 },
  },
  {
    id: 5,
    name: "Xe tải vận chuyển nhiên liệu",
    description: "Xe tải chuyên dụng vận chuyển nhiên liệu",
    category: "Vận tải & Logistics",
    price: 120000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 6,
    name: "Turbine gió công nghiệp",
    description: "Turbine gió công suất lớn cho doanh nghiệp",
    category: "Năng lượng tái tạo",
    price: 85000,
    old_price: 100000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "Energy Plus", id: 5 },
  },
  {
    id: 7,
    name: "Pin lithium cao cấp",
    description: "Pin lithium chất lượng cao",
    category: "Điện mặt trời",
    price: 500,
    old_price: 600,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 8,
    name: "Máy phát điện mini",
    description: "Máy phát điện mini cho gia đình",
    category: "Máy phát điện",
    price: 1500,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "Energy Plus", id: 5 },
  },
  {
    id: 9,
    name: "Dầu diesel",
    description: "Dầu diesel chất lượng cao",
    category: "Dầu thô & Nhiên liệu",
    price: 85,
    unit: "lít",
    image: "/api/placeholder/400/300",
    store: { name: "Global Petroleum", id: 2 },
  },
  {
    id: 10,
    name: "Dầu máy công nghiệp",
    description: "Dầu máy chuyên dụng",
    category: "Dầu nhớt công nghiệp",
    price: 950,
    old_price: 1200,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Heavy Duty Power", id: 3 },
  },
  {
    id: 11,
    name: "Xe container vận chuyển",
    description: "Xe container chuyên dụng",
    category: "Vận tải & Logistics",
    price: 200000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 12,
    name: "Hệ thống năng lượng mặt trời",
    description: "Hệ thống năng lượng mặt trời trọn gói",
    category: "Năng lượng tái tạo",
    price: 50000,
    old_price: 60000,
    unit: "bộ",
    image: "/api/placeholder/400/300",
    store: { name: "SolarWorld", id: 4 },
  },
  {
    id: 13,
    name: "Máy phát điện công suất lớn",
    description: "Công suất 1000KVA",
    category: "Máy phát điện",
    price: 50000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "PowerGen International", id: 6 },
  },
  {
    id: 14,
    name: "Dầu nhớt đặc biệt",
    description: "Dầu nhớt cho máy móc hạng nặng",
    category: "Dầu nhớt công nghiệp",
    price: 1200,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Heavy Duty Power", id: 3 },
  },
  {
    id: 15,
    name: "Tấm pin mặt trời",
    description: "Tấm pin mặt trời công suất cao",
    category: "Điện mặt trời",
    price: 800,
    old_price: 1000,
    unit: "tấm",
    image: "/api/placeholder/400/300",
    store: { name: "SolarWorld", id: 4 },
  },
  {
    id: 16,
    name: "Máy phát điện gia đình",
    description: "Máy phát điện cho hộ gia đình",
    category: "Máy phát điện",
    price: 3000,
    old_price: 3500,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "Energy Plus", id: 5 },
  },
  {
    id: 17,
    name: "Dầu máy nông nghiệp",
    description: "Dầu máy cho thiết bị nông nghiệp",
    category: "Dầu nhớt công nghiệp",
    price: 700,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Global Petroleum", id: 2 },
  },
  {
    id: 18,
    name: "Hệ thống lưu trữ năng lượng",
    description: "Hệ thống lưu trữ năng lượng mặt trời",
    category: "Năng lượng tái tạo",
    price: 25000,
    unit: "bộ",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 19,
    name: "Xe bồn vận chuyển",
    description: "Xe bồn chuyên dụng",
    category: "Vận tải & Logistics",
    price: 180000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 20,
    name: "Máy phát điện di động",
    description: "Máy phát điện di động công suất cao",
    category: "Máy phát điện",
    price: 8000,
    old_price: 10000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "PowerGen International", id: 6 },
  },
  {
    id: 21,
    name: "Dầu nhớt cao cấp",
    description: "Dầu nhớt chất lượng cao",
    category: "Dầu nhớt công nghiệp",
    price: 1500,
    unit: "thùng",
    image: "/api/placeholder/400/300",
    store: { name: "Heavy Duty Power", id: 3 },
  },
  {
    id: 22,
    name: "Tấm pin mặt trời công suất thấp",
    description: "Tấm pin cho hộ gia đình",
    category: "Điện mặt trời",
    price: 600,
    unit: "tấm",
    image: "/api/placeholder/400/300",
    store: { name: "SolarWorld", id: 4 },
  },
  {
    id: 23,
    name: "Xe nâng hàng",
    description: "Xe nâng hàng chuyên dụng",
    category: "Vận tải & Logistics",
    price: 75000,
    unit: "chiếc",
    image: "/api/placeholder/400/300",
    store: { name: "GreenTech Solutions", id: 1 },
  },
  {
    id: 24,
    name: "Hệ thống điều khiển năng lượng",
    description: "Hệ thống điều khiển thông minh",
    category: "Năng lượng tái tạo",
    price: 15000,
    unit: "bộ",
    image: "/api/placeholder/400/300",
    store: { name: "Energy Plus", id: 5 },
  },
];

export const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
  { value: "name-desc", label: "Tên: Z-A" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "discount", label: "Giảm giá nhiều nhất" },
];
