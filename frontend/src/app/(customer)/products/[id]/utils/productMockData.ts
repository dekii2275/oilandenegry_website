// app/(customer)/products/[id]/utils/productMockData.ts
import { ProductDetail, Review, RelatedProduct } from "../components/types";

export const mockProductDetail = (id: number): ProductDetail => ({
  id: id,
  name: "Hệ thống Điện mặt trời Công nghiệp (50kW)",
  brand: "SunPower Maxeon",
  status: "CÓ HÀNG",
  category: "Năng lượng tái tạo",
  description:
    "Giải pháp năng lượng cao cấp cho nhà xưởng và Năng lượng mặt trời hiệu suất cao, biến đổi quả biến hóa lợi ích thô thành năng lượng sạch bền vững.",
  price: 12450,
  oldPrice: 15850,
  unit: "Bộ trọn gói",
  rating: 4.8,
  totalReviews: 24,
  images: [
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1508818180500-f06dd38d8c21?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
  ],
  specifications: [
    { label: "Năng lượng tái tạo", value: "25 Năm Hiệu suất" },
    { label: "Công suất", value: "50,000 Watt (Peak)" },
  ],
  features: [
    "Tiết kiệm chi phí điện năng: Giảm đến 80% hóa đơn tiền điện hàng tháng cho doanh nghiệp",
    "Hoàn vốn nhanh: Thời gian hoàn vốn dự kiến từ 5-6 năm",
    "Bền bỉ: Tuổi thọ hệ thống lên đến 30 năm với công nghệ thấp",
    "Giảm sát thông minh: Ứng dụng module giám sát qua WiFi/4G, cho phép theo dõi sử dụng điện của hệ thống 24/7 từ xa",
    "Thân thiện môi trường: Giảm phát thải hàng tấn CO2 mỗi năm, góp phần xây dựng tương lai xanh",
  ],
  technicalDetails: {
    capacity: "50kW",
    efficiency: "21-22%",
    warranty: "25 năm",
    power: "50,000W Peak",
  },
  benefits: [
    "Giảm hàng chi phí quốc",
    "Bảo vệ môi trường",
    "Hỗ trợ kỹ thuật 24/7",
  ],
  supplier: {
    name: "GreenTech Solutions",
  },
});

export const mockReviews: Review[] = [
  {
    id: 1,
    userName: "Hoàng Tùng",
    userAvatar: "HT",
    rating: 5,
    date: "15/12/2024",
    title: "Hiệu suất tuyệt vời, dịch vụ tốt",
    comment:
      "Sản phẩm hoạt động rất ổn định. Sau 3 tháng sử dụng đặt, hóa đơn giảm đáng kể. Thư thầy tôi giới thiệu lại công ty bạn mà cũ giảm nghi đất. Đội ngũ hỗ trợ của GreenTech rất nhiệt tình và chuyên môn nghiệp.",
  },
  {
    id: 2,
    userName: "Minh Anh Corp",
    userAvatar: "MA",
    rating: 5,
    date: "05/01/2025",
    title: "Đáng đầu tư cho nhà xưởng",
    comment:
      "Hệ thống rất ổn định. Không gặp chi phí lượng dừng. Tuy nhiên thời gian lắp đặt hơi dài do yêu cầu kỹ thuật cao.",
  },
  {
    id: 3,
    userName: "Trần Văn Nam",
    userAvatar: "TV",
    rating: 5,
    date: "20/01/2025",
    title: "Giá cả cạnh tranh nhất thị trường",
    comment:
      "Tô đã thâm khảo giá ở nhiều nơi và thấy EnergyMarket cung cấp mức giá tốt nhất cùng chất lượng sản phẩm cao. Máy hoạt động tốt.",
  },
  {
    id: 4,
    userName: "Nguyễn Văn A",
    userAvatar: "NA",
    rating: 4,
    date: "10/01/2025",
    title: "Chất lượng tốt",
    comment:
      "Sản phẩm đúng như mô tả, chất lượng tốt. Nhân viên tư vấn nhiệt tình.",
  },
  {
    id: 5,
    userName: "Lê Thị B",
    userAvatar: "LB",
    rating: 5,
    date: "25/12/2024",
    title: "Rất hài lòng",
    comment:
      "Sau 6 tháng sử dụng, hệ thống hoạt động ổn định, tiết kiệm điện đáng kể.",
  },
];

export const mockRelatedProducts: RelatedProduct[] = [
  {
    id: 1,
    name: "Panels Solar Inverter 100kw - 3 Phase",
    brand: "GreenTech Solutions",
    price: 1250,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Máy phát điện dự phòng 100kVA",
    brand: "Heavy Duty Power",
    price: 8500,
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Đầu nạp Công nghiệp (Thông phụ)",
    brand: "Global Petroleum",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1508818180500-f06dd38d8c21?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Pin lưu trữ Lithium ion 48V-100Ah",
    brand: "Apex Energy",
    price: 1850,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
  },
];
