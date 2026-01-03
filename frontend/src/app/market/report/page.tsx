// frontend/src/app/market/report/page.tsx
"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  ArrowLeft,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { toast } from "react-hot-toast";

export default function MarketReportPage() {
  const USD_TO_VND = 25000;
  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);

  const [dateRange, setDateRange] = useState("thang-nay");
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);

  const reportOptions = {
    dateRanges: [
      { value: "hom-nay", label: "Hôm nay" },
      { value: "tuan-nay", label: "Tuần này" },
      { value: "thang-nay", label: "Tháng này" },
      { value: "quy-nay", label: "Quý này" },
      { value: "nam-nay", label: "Năm nay" },
      { value: "tuy-chon", label: "Tùy chọn..." },
    ],
    formats: [
      { value: "pdf", label: "PDF", icon: "📄" },
      { value: "csv", label: "CSV", icon: "📋" },
    ],
    reportTypes: [
      {
        id: 1,
        title: "Báo cáo tổng hợp thị trường",
        description: "Tổng hợp tất cả chỉ số giá cả năng lượng",
        size: "2.4 MB",
        pages: 24,
        icon: BarChart3,
        color: "bg-blue-500",
      },
      {
        id: 2,
        title: "Báo cáo phân tích xu hướng",
        description: "Phân tích xu hướng giá trong 12 tháng",
        size: "1.8 MB",
        pages: 18,
        icon: TrendingUp,
        color: "bg-green-500",
      },
      {
        id: 3,
        title: "Báo cáo dự báo thị trường",
        description: "Dự báo giá năng lượng 6 tháng tới",
        size: "3.1 MB",
        pages: 32,
        icon: Clock,
        color: "bg-purple-500",
      },
      {
        id: 4,
        title: "Báo cáo đối thủ cạnh tranh",
        description: "Phân tích thị phần và đối thủ",
        size: "4.2 MB",
        pages: 42,
        icon: Users,
        color: "bg-red-500",
      },
    ],
  };

  // Toggle select report
  const toggleReportSelection = (reportId: number) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Tạo mock data cho báo cáo
  const generateMockData = () => {
    const now = new Date();
    const data = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString("vi-VN"),
        crude_oil_price: (80 + Math.random() * 10).toFixed(2),
        natural_gas_price: (3 + Math.random() * 1).toFixed(2),
        electricity_price: (0.12 + Math.random() * 0.05).toFixed(2),
        renewable_energy_price: (0.08 + Math.random() * 0.03).toFixed(2),
        market_volume: (10000 + Math.random() * 5000).toFixed(0),
        market_cap: (1000000 + Math.random() * 500000).toFixed(0),
        daily_change:
          (Math.random() > 0.5 ? "+" : "-") +
          (Math.random() * 3).toFixed(2) +
          "%",
      });
    }

    return data;
  };

  // Tạo và tải PDF
  const generatePDF = async (reportName: string) => {
    // Trong thực tế, bạn sẽ gọi API để tạo PDF
    // Ở đây tạo mock PDF đơn giản
    const pdfContent = `
      BÁO CÁO THỊ TRƯỜNG NĂNG LƯỢNG
      ==============================
      
      Tên báo cáo: ${reportName}
      Thời gian: ${dateRange}
      Ngày tạo: ${new Date().toLocaleString("vi-VN")}
      
      TỔNG QUAN THỊ TRƯỜNG
      -------------------
      • Giá dầu thô: ${formatVND((80 + Math.random() * 10) * USD_TO_VND)}/thùng
      • Giá khí tự nhiên: ${formatVND((3 + Math.random() * 1) * USD_TO_VND)}/MMBtu
      • Giá điện: ${formatVND((0.12 + Math.random() * 0.05) * USD_TO_VND)}/kWh
      • Giá năng lượng tái tạo: ${formatVND((0.08 + Math.random() * 0.03) * USD_TO_VND)}/kWh
      
      XU HƯỚNG THỊ TRƯỜNG
      -------------------
      • Xu hướng chung: ${Math.random() > 0.5 ? "Tăng" : "Giảm"}
      • Biến động 30 ngày: ${(Math.random() * 15).toFixed(2)}%
      • Dự báo 30 ngày tới: ${(Math.random() * 10).toFixed(2)}%
      
      PHÂN TÍCH KỸ THUẬT
      ------------------
      • Chỉ số RSI: ${(30 + Math.random() * 40).toFixed(2)}
      • MACD: ${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 0.5).toFixed(
      3
    )}
      • Hỗ trợ chính: ${formatVND((70 + Math.random() * 5) * USD_TO_VND)}
      • Kháng cự chính: ${formatVND((90 + Math.random() * 5) * USD_TO_VND)}
      
      KHUYẾN NGHỊ
      -----------
      • Rủi ro: ${["Thấp", "Trung bình", "Cao"][Math.floor(Math.random() * 3)]}
      • Khuyến nghị: ${["Mua", "Nắm giữ", "Bán"][Math.floor(Math.random() * 3)]}
      • Mục tiêu giá: ${formatVND((85 + Math.random() * 10) * USD_TO_VND)}
      
      -------------------------------
      Báo cáo được tạo bởi Z-Energy Analytics
      Điện thoại: +84 123 456 789
      Email: analytics@zenergy.com
    `;

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    return blob;
  };

  // Tạo và tải CSV
  const generateCSV = () => {
    const data = generateMockData();
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = headers + "\n" + rows;

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  };

  // Xử lý tải báo cáo riêng
  const handleDownloadReport = async (reportId: number) => {
    const report = reportOptions.reportTypes.find((r) => r.id === reportId);
    if (!report) return;

    setIsGenerating(true);
    const toastId = toast.loading(`Đang tạo báo cáo "${report.title}"...`);

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case "pdf":
          blob = await generatePDF(report.title);
          filename = `${report.title
            .toLowerCase()
            .replace(/ /g, "-")}-${dateRange}.pdf`;
          break;
        case "csv":
          blob = generateCSV();
          filename = `${report.title
            .toLowerCase()
            .replace(/ /g, "-")}-${dateRange}.csv`;
          break;
        default:
          throw new Error("Định dạng không hỗ trợ");
      }

      // Tạo và kích hoạt download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log download
      const reportLogs = JSON.parse(
        localStorage.getItem("zenergy_report_logs") || "[]"
      );
      reportLogs.push({
        reportId: report.id,
        reportName: report.title,
        format: format,
        dateRange: dateRange,
        downloadedAt: new Date().toISOString(),
      });
      localStorage.setItem("zenergy_report_logs", JSON.stringify(reportLogs));

      toast.success(`Đã tải báo cáo "${report.title}" thành công!`, {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error);
      toast.error("Có lỗi xảy ra khi tạo báo cáo!", {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Xử lý tạo báo cáo tùy chỉnh (nhiều báo cáo)
  const handleGenerateCustomReport = async () => {
    if (selectedReports.length === 0) {
      toast.error("Vui lòng chọn ít nhất một báo cáo!");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(
      `Đang tạo ${selectedReports.length} báo cáo...`
    );

    try {
      // Tạo ZIP file nếu nhiều báo cáo
      if (selectedReports.length > 1 && format !== "pdf") {
        toast("Báo cáo nhiều file sẽ được tải riêng lẻ", {
          id: toastId,
          duration: 2000,
        });

        // Tải từng file riêng
        setTimeout(() => {
          selectedReports.forEach((reportId, index) => {
            setTimeout(() => {
              handleDownloadReport(reportId);
            }, index * 500); // Stagger downloads
          });
        }, 2000);
      } else {
        // Tải một báo cáo duy nhất
        await handleDownloadReport(selectedReports[0]);
      }

      toast.success(`Đã tạo ${selectedReports.length} báo cáo thành công!`, {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error);
      toast.error("Có lỗi xảy ra!", {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Tải tất cả báo cáo
  const handleDownloadAllReports = async () => {
    const allReportIds = reportOptions.reportTypes.map((r) => r.id);
    setSelectedReports(allReportIds);

    // Chờ một chút để state update
    setTimeout(() => {
      handleGenerateCustomReport();
    }, 100);
  };

  // Lựa chọn date range tùy chỉnh
  const handleCustomDateRange = () => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md">
        <h3 className="font-bold text-gray-800 mb-4">Chọn khoảng thời gian</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setDateRange("tuy-chon");
                toast.success("Đã chọn khoảng thời gian tùy chỉnh!", {
                  id: t.id,
                });
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FDFB]">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/market"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại trang thị trường
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Tạo & Tải Báo cáo Thị trường
                </h1>
                <p className="text-gray-500 text-sm">
                  Tùy chỉnh và tải báo cáo thị trường chi tiết
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Tùy chọn báo cáo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Calendar size={16} />
                  Khoảng thời gian
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {reportOptions.dateRanges.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (option.value === "tuy-chon") {
                          handleCustomDateRange();
                        } else {
                          setDateRange(option.value);
                        }
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                        dateRange === option.value
                          ? "bg-green-100 text-green-700 border-2 border-green-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Đã chọn:{" "}
                  <span className="font-medium">
                    {
                      reportOptions.dateRanges.find(
                        (r) => r.value === dateRange
                      )?.label
                    }
                  </span>
                </p>
              </div>

              {/* Format */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Filter size={16} />
                  Định dạng tải về
                </label>
                <div className="flex gap-2">
                  {reportOptions.formats.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormat(option.value)}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                        format === option.value
                          ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <span className="text-xl mb-1">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {format === option.value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Định dạng:{" "}
                  <span className="font-medium uppercase">{format}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Loại báo cáo có sẵn
              </h2>
              <button
                onClick={handleDownloadAllReports}
                disabled={isGenerating}
                className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
              >
                <Download size={14} />
                Tải tất cả ({reportOptions.reportTypes.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {reportOptions.reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReports.includes(report.id);

                return (
                  <div
                    key={report.id}
                    className={`bg-gray-50 rounded-xl p-5 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => toggleReportSelection(report.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${report.color} text-white`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-300">
                          {report.size}
                        </span>
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {report.pages} trang • Đã chọn {isSelected ? "✓" : "○"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadReport(report.id);
                        }}
                        disabled={isGenerating}
                        className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isGenerating && selectedReports.includes(report.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        Tải ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedReports.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-800">
                      Đã chọn {selectedReports.length} báo cáo
                    </p>
                    <p className="text-sm text-blue-600">
                      {selectedReports
                        .map(
                          (id) =>
                            reportOptions.reportTypes.find((r) => r.id === id)
                              ?.title
                        )
                        .join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReports([])}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="text-center space-y-4">
              <button
                onClick={handleGenerateCustomReport}
                disabled={isGenerating || selectedReports.length === 0}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang tạo báo cáo...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    {selectedReports.length > 0
                      ? `Tạo ${selectedReports.length} báo cáo đã chọn`
                      : "Tạo báo cáo tùy chỉnh"}
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="font-medium">Định dạng:</span>{" "}
                  {format.toUpperCase()}
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="font-medium">Thời gian:</span>{" "}
                  {
                    reportOptions.dateRanges.find((r) => r.value === dateRange)
                      ?.label
                  }
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="font-medium">Số lượng:</span>{" "}
                  {selectedReports.length || 0}
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Báo cáo sẽ được tạo theo thời gian và định dạng đã chọn
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                📋 Lưu ý khi tải báo cáo
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dữ liệu được cập nhật theo thời gian thực</li>
                <li>• Báo cáo PDF có thể mất 1-2 phút để tạo</li>
                <li>• Báo cáo được lưu tự động trong 30 ngày</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                📊 Định dạng hỗ trợ
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF - Đọc và in ấn</li>
                <li>• CSV - Xử lý dữ liệu thô</li>
                <li>• ZIP - Nhiều file cùng lúc</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                ⚡ Tải nhanh
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const firstReport = reportOptions.reportTypes[0];
                    setSelectedReports([firstReport.id]);
                    setTimeout(() => handleGenerateCustomReport(), 100);
                  }}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-700 bg-white px-3 py-2 rounded-lg border border-blue-200"
                >
                  Tải báo cáo tổng hợp nhanh
                </button>
                <button
                  onClick={() => {
                    const trendReport = reportOptions.reportTypes[1];
                    setSelectedReports([trendReport.id]);
                    setTimeout(() => handleGenerateCustomReport(), 100);
                  }}
                  className="w-full text-left text-sm text-green-600 hover:text-green-700 bg-white px-3 py-2 rounded-lg border border-green-200"
                >
                  Tải báo cáo xu hướng nhanh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lần tải gần đây
          </h3>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet
                size={32}
                className="mx-auto mb-3 text-gray-300"
              />
              <p>Chưa có lịch sử tải báo cáo</p>
              <p className="text-sm mt-1">
                Các báo cáo đã tải sẽ hiển thị ở đây
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
