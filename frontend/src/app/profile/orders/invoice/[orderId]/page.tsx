"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Printer,
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  Home,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

interface OrderData {
  orderId: string;
  order_number?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    taxCode: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  status: string;
}

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng!", {
        duration: 4000,
      });
      router.push("/profile");
      return;
    }

    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem("zenergy_orders") || "[]");
    const foundOrder = orders.find((o: OrderData) => o.orderId === orderId);

    if (!foundOrder) {
      toast.error("Không tìm thấy đơn hàng!", {
        duration: 4000,
      });
      router.push("/profile");
      return;
    }

    setOrder(foundOrder);
    setIsLoading(false);

    // Auto download if download param is present
    const shouldDownload = searchParams.get("download") === "true";
    if (shouldDownload && foundOrder) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [orderId, router, searchParams]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !order) {
      toast.error("Không thể tạo PDF!", {
        icon: "❌",
        duration: 3000,
      });
      return;
    }

    try {
      toast.loading("Đang tạo file PDF...", {
        icon: "📄",
        id: "pdf-loading",
      });

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // Ẩn các phần tử không cần thiết khi tạo PDF
          const breadcrumb = clonedDoc.querySelector("nav");
          const actionButtons = clonedDoc.querySelectorAll(".print\\:hidden");

          if (breadcrumb) (breadcrumb as HTMLElement).style.display = "none";
          actionButtons.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const imgScaledHeight = imgHeight * ratio;

      let heightLeft = imgScaledHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgScaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgScaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgScaledHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Hoa-don-${order.order_number || order.orderId}.pdf`;
      pdf.save(fileName);

      toast.success("Đã tải hóa đơn PDF thành công!", {
        icon: "✅",
        id: "pdf-loading",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Có lỗi xảy ra khi tạo PDF!", {
        icon: "❌",
        id: "pdf-loading",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải hóa đơn...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium print:hidden">
          <Link
            href="/profile"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Trang cá nhân
          </Link>
          <span>&gt;</span>
          <Link
            href="/profile?tab=orders"
            className="hover:text-green-600 transition-colors"
          >
            Đơn hàng của tôi
          </Link>
          <span>&gt;</span>
          <span className="text-green-600 font-semibold">Hóa đơn</span>
        </nav>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h1 className="text-3xl font-bold text-gray-800">Hóa đơn đặt hàng</h1>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Tải PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              In hóa đơn
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          ref={invoiceRef}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 print:shadow-none print:border-0"
        >
          {/* Invoice Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">
                  Z-ENERGY
                </h2>
                <p className="text-sm text-gray-600">
                  328 Nguyễn Trãi, Thanh Xuân, Hà Nội
                </p>
                <p className="text-sm text-gray-600">
                  Email: hotro@z-energy.com.vn
                </p>
                <p className="text-sm text-gray-600">
                  Hotline: (+84) 24 3283 2828
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 bg-green-100 rounded-xl mb-4">
                  <p className="text-xs text-gray-600 font-bold uppercase mb-1">
                    Hóa đơn
                  </p>
                  <p className="text-lg font-black text-green-600">
                    {order.order_number || order.orderId}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Ngày đặt: {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái:{" "}
                  <span className="font-bold text-green-600">
                    {order.status === "pending"
                      ? "Chờ xác nhận"
                      : order.status === "confirmed"
                      ? "Đã xác nhận"
                      : order.status === "shipping"
                      ? "Đang giao"
                      : order.status === "completed"
                      ? "Hoàn thành"
                      : "Đã hủy"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-bold text-gray-800">
                    {order.customer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-gray-600">{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-gray-600">{order.customer.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-1" />
                  <span className="text-gray-600">
                    {order.customer.address}
                  </span>
                </div>
                {order.customer.company && (
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      {order.customer.company}
                    </span>
                  </div>
                )}
                {order.customer.taxCode && (
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      MST: {order.customer.taxCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
                Phương thức thanh toán
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  {order.paymentMethod === "bank_transfer"
                    ? "Chuyển khoản ngân hàng"
                    : order.paymentMethod === "credit_card"
                    ? "Thẻ tín dụng/ghi nợ"
                    : "Thanh toán khi nhận hàng"}
                </p>
                <p className="text-sm text-gray-500">
                  {order.paymentMethod === "bank_transfer" &&
                    "Thanh toán qua Internet Banking"}
                  {order.paymentMethod === "credit_card" &&
                    "Visa, Mastercard, JCB"}
                  {order.paymentMethod === "cod" &&
                    "Trả tiền mặt khi nhận được hàng"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">
              Chi tiết đơn hàng
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {item.quantity} {item.unit || "cái"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-96 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">
                    {formatCurrency(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế (VAT 10%):</span>
                  <span className="font-medium">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-black text-green-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Cảm ơn bạn đã sử dụng dịch vụ của Z-ENERGY!
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Hóa đơn này có giá trị pháp lý và được lưu trữ trong hệ thống.
            </p>
          </div>
        </div>

        {/* Back Button - Hidden when printing */}
        <div className="mt-6 print:hidden">
          <Link
            href="/profile?tab=orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </main>
    </div>
  );
}
