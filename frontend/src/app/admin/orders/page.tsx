"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import {
  Bell,
  Search,
  Filter,
  Download,
  Calendar,
  QrCode,
  Truck,
  Eye,
  CheckCircle,
  Loader2,
  RefreshCcw
} from "lucide-react";

/**
 * =====================================
 * ADMIN - QUẢN LÝ ĐƠN HÀNG (REAL DATA)
 * =====================================
 */

interface Order {
  order_id: number;
  customer_name: string;
  created_at: string;
  total_amount: number;
  payment_method: "QR" | "COD";
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  item_count: number;
  shipping_address: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "QR" | "COD">("ALL");
  const [keyword, setKeyword] = useState("");

  // --- 1. GỌI API LẤY DANH SÁCH ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("adminToken");
      const params = new URLSearchParams();
      
      // Filter logic
      if (activeTab !== "ALL") params.append("payment_method", activeTab);
      if (keyword) params.append("search", keyword);
      params.append("limit", "100"); // Lấy 100 đơn mới nhất

      const res = await fetch(`https://zenergy.cloud/api/admin/orders?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Lỗi tải đơn hàng");
      
      const data = await res.json();
      setOrders(data.data); // Backend trả về { data: [], total: ... }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => fetchOrders(), 500);
    return () => clearTimeout(timer);
  }, [activeTab, keyword]);

  // --- 2. XỬ LÝ XÁC NHẬN THANH TOÁN (NÚT TICK) ---
  const handleConfirmPayment = async (orderId: number) => {
    if (!confirm(`Xác nhận đã nhận được tiền cho đơn #${orderId}?`)) return;

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(`https://zenergy.cloud/api/admin/orders/${orderId}/confirm-payment`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success(`Đơn #${orderId} đã được xác nhận thanh toán!`);
        fetchOrders(); // Load lại danh sách
      } else {
        const err = await res.json();
        toast.error(err.detail || "Lỗi khi xác nhận");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    }
  };

  // Helper format
  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-xl text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-xs text-gray-500">Kiểm soát dòng tiền và vận đơn</p>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-full" title="Làm mới">
          <RefreshCcw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <TabButton 
            active={activeTab === "ALL"} 
            onClick={() => setActiveTab("ALL")} 
            label="Tất cả đơn hàng" 
            count={orders.length}
          />
          <TabButton 
            active={activeTab === "QR"} 
            onClick={() => setActiveTab("QR")} 
            label="Thanh toán QR (Cần duyệt)" 
            icon={<QrCode size={16}/>}
            colorClass="text-blue-600"
            count={orders.filter(o => o.payment_method === 'QR').length}
          />
          <TabButton 
            active={activeTab === "COD"} 
            onClick={() => setActiveTab("COD")} 
            label="COD (Thanh toán khi nhận)" 
            icon={<Truck size={16}/>}
            colorClass="text-orange-600"
            count={orders.filter(o => o.payment_method === 'COD').length}
          />
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã đơn, tên khách hàng..."
              className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-green-500"
            />
          </div>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter size={16} /> Bộ lọc
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 bg-gray-50/50 border-b border-gray-100 font-medium">
              <tr>
                <th className="py-4 px-6">Mã đơn</th>
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">Thanh toán</th>
                <th className="py-4 px-6">Tổng tiền</th>
                <th className="py-4 px-6">Ngày đặt</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan={7} className="py-12 text-center text-gray-400"><div className="flex justify-center gap-2"><Loader2 className="animate-spin"/> Đang tải...</div></td></tr>
              ) : orders.length === 0 ? (
                 <tr><td colSpan={7} className="py-12 text-center text-gray-400">Không tìm thấy đơn hàng nào.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-700">#{order.order_id}</td>
                    <td className="px-6 py-4 font-medium">{order.customer_name}</td>
                    <td className="px-6 py-4">
                      {order.payment_method === "QR" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                          <QrCode size={14} /> QR Banking
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                          <Truck size={14} /> COD
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{formatVND(order.total_amount)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    
                    {/* CỘT THAO TÁC */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* 🔥 NÚT TICK QUAN TRỌNG: Chỉ hiện khi là QR + PENDING */}
                        {order.status === "PENDING" && order.payment_method === "QR" && (
                          <button 
                            onClick={() => handleConfirmPayment(order.order_id)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" 
                            title="Xác nhận đã nhận được tiền"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        
                        <button className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500" title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function TabButton({ active, onClick, label, icon, colorClass, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-4 text-sm font-medium transition-all relative flex items-center gap-2 
        ${active ? (colorClass || "text-green-600") : "text-gray-500 hover:text-gray-700"}`}
    >
      {icon} {label}
      <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
      {active && <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-md ${active ? (colorClass?.replace('text-', 'bg-') || 'bg-green-600') : ''}`}></span>}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    SHIPPING: "bg-purple-50 text-purple-700 border-purple-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: any = {
    PENDING: "Chờ thanh toán", // Hoặc Chờ xử lý
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100"}`}>
      {labels[status] || status}
    </span>
  );
}