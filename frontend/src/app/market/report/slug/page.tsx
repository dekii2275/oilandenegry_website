// frontend/src/app/market/report/[slug]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Printer,
  Share2,
  Mail,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ProductReportPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/market/report/${params.slug}`);
      return;
    }

    // Load product từ sessionStorage hoặc params
    const savedProduct = sessionStorage.getItem("reportProduct");
    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    }
    setIsLoading(false);
  }, [isAuthenticated, params.slug, router]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) {
      toast.error("Không thể tạo báo cáo!");
      return;
    }

    setIsGeneratingPDF(true);
    toast.loading("Đang tạo PDF...", { id: "pdf-generating" });

    try {
      // Tạo canvas từ nội dung báo cáo
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Thêm CSS cho bản in
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-after: always;
              }
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      // Tạo PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 1.0),
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 1.0),
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Tải file
      const reportNumber = `REPORT-${Date.now().toString().slice(-8)}`;
      pdf.save(`bao-cao-${product?.slug || params.slug}-${reportNumber}.pdf`);

      toast.success("PDF đã được tải về!", {
        id: "pdf-generating",
        duration: 3000,
      });

      // Log sự kiện tải báo cáo
      const reportLogs = JSON.parse(
        localStorage.getItem("zenergy_report_logs") || "[]"
      );
      reportLogs.push({
        productId: product?.id,
        productName: product?.name,
        reportNumber,
        downloadedAt: new Date().toISOString(),
        type: "pdf",
      });
      localStorage.setItem("zenergy_report_logs", JSON.stringify(reportLogs));
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error);
      toast.error("Có lỗi khi tạo PDF!", {
        id: "pdf-generating",
        duration: 4000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Tải báo cáo dạng text
  const handleDownloadTextReport = () => {
    if (!product) return;

    const reportContent = `
Z-Energy Market Analysis Report
================================

REPORT NUMBER: REPORT-${Date.now().toString().slice(-8)}
GENERATED: ${new Date().toLocaleString("vi-VN")}
VALID UNTIL: ${new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("vi-VN")}

PRODUCT INFORMATION
-------------------
Product: ${product.name}
Category: ${product.category}
Current Price: $${
      typeof product.price === "number"
        ? product.price.toFixed(2)
        : product.price
    }
24h Change: ${product.changeFormatted || "N/A"}

MARKET STATISTICS
-----------------
24h High: $${product.marketDetails?.high24h || 0}
24h Low: $${product.marketDetails?.low24h || 0}
24h Volume: ${product.marketDetails?.volume || "N/A"}
Market Cap: ${product.marketDetails?.marketCap || "N/A"}
Avg Volume: ${product.marketDetails?.avgVolume || "N/A"}

TECHNICAL ANALYSIS
------------------
Trend: ${product.isUp ? "BULLISH ↗" : "BEARISH ↘"}
RSI (14): 52.3 (NEUTRAL)
MACD: ${product.isUp ? "0.15 (BULLISH)" : "-0.08 (BEARISH)"}
Support Level: $${(typeof product.price === "number"
      ? product.price * 0.95
      : 0
    ).toFixed(2)}
Resistance Level: $${(typeof product.price === "number"
      ? product.price * 1.05
      : 0
    ).toFixed(2)}
Volatility: 18.5%

7-DAY FORECAST
--------------
Base Scenario: +${Math.floor(Math.random() * 5) + 1}%
Optimistic Scenario: +${Math.floor(Math.random() * 8) + 3}%
Cautious Scenario: -${Math.floor(Math.random() * 3) + 1}%

RECOMMENDATION
--------------
${
  product.isUp
    ? "MAINTAIN BUY POSITION\n- Target Profit: +8%\n- Stop Loss: -3%\n- Entry Point: Current level\n- Timeframe: 1-2 weeks"
    : "CONSIDER BUY AT SUPPORT\n- Target Profit: +5%\n- Stop Loss: -5%\n- Entry Point: Support level\n- Timeframe: 2-3 weeks"
}

RISK ASSESSMENT
---------------
Risk Level: ${product.isUp ? "MEDIUM" : "HIGH"}
Volatility: MEDIUM
Liquidity: HIGH
Market Sentiment: ${product.isUp ? "POSITIVE" : "NEUTRAL"}

DISCLAIMER
----------
This report is for informational purposes only and does not constitute investment advice.
Past performance is not indicative of future results.
Consult with a financial advisor before making investment decisions.

Generated by Z-Energy Analytics Team
Contact: analytics@zenergy.com
Last Updated: ${
      product.marketDetails?.lastUpdated || new Date().toLocaleString()
    }
================================
    `.trim();

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${product.slug || params.slug}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Báo cáo text đã được tải về!", {
      duration: 3000,
    });
  };

  // Chia sẻ báo cáo
  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `Báo cáo ${product?.name}`,
        text: `Báo cáo phân tích ${product?.name} từ Z-Energy`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link báo cáo!", {
        duration: 3000,
      });
    }
  };

  // Gửi email báo cáo
  const handleEmailReport = () => {
    const emailSubject = `Báo cáo ${product?.name} - Z-Energy`;
    const emailBody = `Xin chào,\n\nVui lòng xem báo cáo chi tiết tại: ${window.location.href}\n\nTrân trọng,\nZ-Energy Team`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
  };

  // In báo cáo
  const handlePrintReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/market`}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 no-print"
          >
            <ArrowLeft size={18} />
            Quay lại sản phẩm
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Báo cáo chuyên sâu
              </h1>
              <p className="text-gray-600 mt-2">
                Phân tích chi tiết và dự báo thị trường
              </p>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isGeneratingPDF ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isGeneratingPDF ? "Đang tạo..." : "PDF"}
              </button>
              <button
                onClick={handleDownloadTextReport}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <FileText size={18} />
                TXT
              </button>
              <button
                onClick={handlePrintReport}
                className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                <Printer size={18} />
                In
              </button>
              <button
                onClick={handleShareReport}
                className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2"
              >
                <Share2 size={18} />
                Chia sẻ
              </button>
              <button
                onClick={handleEmailReport}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <Mail size={18} />
                Email
              </button>
            </div>
          </div>
        </div>

        {/* Report Content - phần này sẽ được chụp thành PDF */}
        <div
          ref={reportRef}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 print:shadow-none print:border-0"
          id="report-content"
        >
          {/* Report Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <img
                  src="/assets/images/logo.png"
                  alt="Z-Energy Logo"
                  className="h-12 mb-2 print:h-10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  {product?.name}
                </h2>
                <p className="text-gray-600">{product?.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Mã báo cáo</p>
                <p className="font-mono font-bold text-green-600">
                  REPORT-{Date.now().toString().slice(-8)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Confidential</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Cập nhật mới nhất
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời hạn</p>
                <p className="font-semibold">30 ngày</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phiên bản</p>
                <p className="font-semibold">1.0</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8 page-break">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              Tóm tắt điều hành
            </h3>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 print:border print:border-gray-300">
              <p className="text-gray-700 leading-relaxed">
                Báo cáo này cung cấp phân tích chi tiết về {product?.name} trên
                thị trường năng lượng. Sản phẩm đang cho thấy{" "}
                {product?.isUp
                  ? "xu hướng tăng trưởng tích cực"
                  : "dấu hiệu điều chỉnh"}
                với {product?.changeFormatted} trong 24h qua. Khuyến nghị chính:{" "}
                {product?.isUp
                  ? "Tiếp tục nắm giữ và theo dõi"
                  : "Cân nhắc mua vào ở mức giá hỗ trợ"}
                .
              </p>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-green-500" />
              Phân tích thị trường
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl print:border print:border-gray-300">
                <h4 className="font-bold text-gray-800 mb-3">Chỉ số chính</h4>
                <div className="space-y-4">
                  {[
                    {
                      label: "Giá hiện tại",
                      value: `$${
                        typeof product?.price === "number"
                          ? product.price.toFixed(2)
                          : product?.price
                      }`,
                    },
                    {
                      label: "Biến động 24h",
                      value: product?.changeFormatted || "N/A",
                    },
                    {
                      label: "Cao nhất 24h",
                      value: `$${product?.marketDetails?.high24h || 0}`,
                    },
                    {
                      label: "Thấp nhất 24h",
                      value: `$${product?.marketDetails?.low24h || 0}`,
                    },
                    {
                      label: "Khối lượng",
                      value: product?.marketDetails?.volume || "N/A",
                    },
                    {
                      label: "Vốn hóa",
                      value: product?.marketDetails?.marketCap || "N/A",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 print:border print:border-gray-300">
                <h4 className="font-bold text-gray-800 mb-3">Dự báo 7 ngày</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kịch bản cơ sở</span>
                    <span className="font-bold text-green-600">
                      +{Math.floor(Math.random() * 5) + 1}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kịch bản tích cực</span>
                    <span className="font-bold text-green-600">
                      +{Math.floor(Math.random() * 8) + 3}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kịch bản thận trọng</span>
                    <span className="font-bold text-red-600">
                      -{Math.floor(Math.random() * 3) + 1}%
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-green-200 print:border-gray-300">
                  <p className="text-sm text-gray-600">
                    <strong>Khuyến nghị:</strong>{" "}
                    {product?.isUp
                      ? "Duy trì vị thế mua, đặt lệnh chốt lời ở mức +8%"
                      : "Cân nhắc mua vào ở mức hỗ trợ, đặt lệnh dừng lỗ ở -3%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="mb-8 page-break">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Chỉ số kỹ thuật
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  name: "RSI (14)",
                  value: "52.3",
                  status: "neutral",
                  color: "text-yellow-600",
                },
                {
                  name: "MACD",
                  value: product?.isUp ? "0.15" : "-0.08",
                  status: product?.isUp ? "bullish" : "bearish",
                  color: product?.isUp ? "text-green-600" : "text-red-600",
                },
                {
                  name: "Bollinger Bands",
                  value: "Trong biên",
                  status: "normal",
                  color: "text-blue-600",
                },
                {
                  name: "Volume Ratio",
                  value: "1.2",
                  status: "positive",
                  color: "text-green-600",
                },
                {
                  name: "Support Level",
                  value: `$${(typeof product?.price === "number"
                    ? product.price * 0.95
                    : 0
                  ).toFixed(2)}`,
                  status: "support",
                  color: "text-purple-600",
                },
                {
                  name: "Resistance Level",
                  value: `$${(typeof product?.price === "number"
                    ? product.price * 1.05
                    : 0
                  ).toFixed(2)}`,
                  status: "resistance",
                  color: "text-orange-600",
                },
                {
                  name: "Volatility",
                  value: "18.5%",
                  status: "medium",
                  color: "text-amber-600",
                },
                {
                  name: "Trend Strength",
                  value: product?.isUp ? "Mạnh" : "Yếu",
                  status: product?.isUp ? "strong" : "weak",
                  color: product?.isUp ? "text-green-600" : "text-red-600",
                },
              ].map((indicator, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300"
                >
                  <p className="text-sm text-gray-500 mb-1">{indicator.name}</p>
                  <p className={`text-lg font-bold ${indicator.color}`}>
                    {indicator.value}
                  </p>
                  <p className="text-xs text-gray-400">{indicator.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Đánh giá rủi ro
            </h3>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100 print:border print:border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Rủi ro chính</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      Biến động giá thị trường toàn cầu
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                      Thay đổi chính sách năng lượng
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      Cạnh tranh từ các nguồn năng lượng thay thế
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      Yếu tố địa chính trị
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Điểm rủi ro</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Rủi ro thị trường", score: "7/10" },
                      { label: "Rủi ro thanh khoản", score: "3/10" },
                      { label: "Rủi ro vận hành", score: "5/10" },
                      { label: "Rủi ro pháp lý", score: "6/10" },
                    ].map((risk, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600">{risk.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                              style={{ width: `${parseInt(risk.score) * 10}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-800">
                            {risk.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 pt-6 border-t border-gray-200 print:border-gray-300">
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-4 print:border print:border-gray-300">
              <h4 className="font-bold text-red-700 mb-2">
                ⚠️ CẢNH BÁO QUAN TRỌNG
              </h4>
              <p className="text-sm text-red-600">
                Đây không phải là lời khuyên đầu tư. Vui lòng tham khảo ý kiến
                chuyên gia tài chính trước khi đưa ra quyết định.
              </p>
            </div>
            <p className="text-sm text-gray-500 italic">
              <strong>Chú ý:</strong> Báo cáo này chỉ mang tính chất tham khảo
              và phân tích. Không phải là lời khuyên đầu tư. Quý khách nên tham
              khảo ý kiến chuyên gia tài chính trước khi đưa ra quyết định đầu
              tư. Dữ liệu được cập nhật đến{" "}
              {product?.marketDetails?.lastUpdated ||
                new Date().toLocaleString()}
              .
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 gap-4">
              <div>
                <p className="text-sm text-gray-500">Người phân tích</p>
                <p className="font-semibold">Đội ngũ Z-Energy Analytics</p>
                <p className="text-xs text-gray-400">
                  Phòng Phân tích Thị trường
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Liên hệ & Hỗ trợ</p>
                <p className="font-semibold">analytics@zenergy.com</p>
                <p className="text-xs text-gray-400">+84 123 456 789</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Z-Energy. Tất cả các quyền được bảo
                lưu. Báo cáo này được tạo tự động và chỉ dành cho mục đích nội
                bộ.
              </p>
            </div>
          </div>
        </div>

        {/* Các nút hành động phụ */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center no-print">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tạo PDF...
              </>
            ) : (
              <>
                <Download size={18} />
                Tải báo cáo PDF
              </>
            )}
          </button>
          <button
            onClick={handleDownloadTextReport}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <FileText size={18} />
            Tải báo cáo Text
          </button>
          <button
            onClick={handlePrintReport}
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Printer size={18} />
            In báo cáo
          </button>
        </div>
      </div>

      {/* CSS cho in ấn */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          #report-content {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .page-break {
            page-break-after: always;
          }
          a {
            color: black !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </div>
  );
}
