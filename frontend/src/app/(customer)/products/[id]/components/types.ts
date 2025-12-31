// app/(customer)/products/[id]/components/types.ts
export interface ProductDetail {
  id: number;
  name: string;
  sku?: string;
  brand: string;
  status: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  rating: number;
  totalReviews: number;
  reviewCount?: number;
  images: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  features: string[];
  technicalDetails: {
  brand: string;
  model: string;
  warranty: string;
  origin: string;
  capacity?: string;
  efficiency?: string;
  power?: string;
};

  benefits: string[];
  supplier: {
  id: number;
  name: string;
  logo?: string;
  slug?: string;
};

}

export interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

export interface RelatedProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
}

export interface ReviewFilter {
  rating: number;
  sortBy: "newest" | "highest" | "lowest";
}

export interface NewReview {
  title: string;
  comment: string;
  rating: number;
}
