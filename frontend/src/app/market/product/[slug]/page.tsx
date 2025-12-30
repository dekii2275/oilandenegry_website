// frontend/src/app/market/product/[slug]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ProductDetailHeader from "./components/ProductDetailHeader";
import LoadingSkeleton from "./components/LoadingSkeleton";
import NotFoundState from "./components/NotFoundState";
import ProductMainContent from "./components/ProductMainContent";
import {
  findProductBySlug,
  generateMarketDetails,
  getRelatedProducts,
} from "./utils/productUtils";
import { generateChartData } from "./utils/chartData";
import { Product } from "./types";

export default function MarketProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Effect để tải dữ liệu
  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      const slug = params.slug as string;
      const foundProduct = findProductBySlug(slug);

      if (foundProduct) {
        // Parse giá từ string sang number nếu cần
        let price: number;

        if (typeof foundProduct.price === "string") {
          // Xử lý các định dạng giá khác nhau
          const priceStr = foundProduct.price;
          if (priceStr.includes("M")) {
            price = parseFloat(priceStr.replace(/[$,M]/g, "")) * 1000000;
          } else if (priceStr.includes("K")) {
            price = parseFloat(priceStr.replace(/[$,K]/g, "")) * 1000;
          } else {
            price = parseFloat(priceStr.replace(/[$,]/g, ""));
          }
        } else {
          price = foundProduct.price as number;
        }

        // Đảm bảo price là số hợp lệ
        if (isNaN(price) || price <= 0) {
          price = 100; // Giá mặc định nếu không hợp lệ
        }

        const isUp =
          foundProduct.isUp !== undefined
            ? foundProduct.isUp
            : Math.random() > 0.3;

        const marketDetails = generateMarketDetails(price, isUp);
        const chartData = generateChartData(price, isUp);
        const relatedProducts = getRelatedProducts(
          slug,
          foundProduct.category || "Năng lượng"
        );

        const completeProduct: Product = {
          ...foundProduct,
          price: price,
          isUp,
          changeFormatted: `${marketDetails.changeValue} (${marketDetails.changePercent})`,
          marketDetails,
          chartData,
          relatedProducts,
          specifications: {
            purity: "≥ 99.5%",
            density: "0.82 - 0.85 g/cm³",
            sulfurContent: "≤ 0.5%",
            flashPoint: "≥ 60°C",
            viscosity: "15 - 20 cSt",
            origin: foundProduct.location || "Toàn cầu",
            certification: "ISO 9001, ASTM D975",
            shelfLife: "24 tháng",
            packaging: "Thùng 200L, IBC 1000L",
          },
          shippingInfo: {
            deliveryTime: "3-7 ngày làm việc",
            minOrder: "1,000 " + (foundProduct.unit || "chiếc"),
            shippingMethod: "Đường biển/Đường bộ",
            paymentTerms: "T/T 30%, Balance before shipment",
            incoterm: "FOB, CIF, CFR",
          },
          fromAPI: false,
        };

        setTimeout(() => {
          setProduct(completeProduct);
          setLoading(false);
        }, 800);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    loadData();
  }, [params.slug]);

  // Nếu chưa mounted, hiển thị skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
          <NotFoundState />
        </main>
        <Footer />
      </div>
    );
  }

  // Main render với đầy đủ dữ liệu
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
        <ProductDetailHeader
          productName={product.name}
          category={product.category}
          lastPriceUpdate={product.marketDetails?.lastUpdated}
        />
        <ProductMainContent product={product} />
      </main>
      <Footer />
    </div>
  );
}
