"use client";

import { useEffect, useState } from "react";
import { Search, FileDown, Eye, Package, Truck, CheckCircle, XCircle, Loader2, Check, X, User, MapPin, RefreshCcw } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-hot-toast";

interface OrderStats {
  new: number;
  processing: number;
  shipping: number;
  completed: number;
  cancelled: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ new: 0, processing: 0, shipping: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filter & Search
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (keyword) params.append("keyword", keyword);

      // Gọi song song 2 API
      const [ordersRes, statsRes] = await Promise.all([
         apiClient.get<Order[]>(`/seller/orders?${params.toString()}`),
         apiClient.get<OrderStats>('/seller/orders/stats')
      ]);

      if (ordersRes) setOrders(ordersRes.data);
      if (statsRes) setStats(statsRes.data);
      
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi filter/keyword thay đổi
  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [keyword, filterStatus]);

  // --- ACTIONS ---
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const actionName = newStatus === 'SHIPPING' ? "Duyệt đơn" : "Hủy đơn";
    if (!confirm(`Bạn chắc chắn muốn ${actionName}?`)) return;

    try {
      await apiClient.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      toast.success(`${actionName} thành công!`);
      setSelectedOrder(null);
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'});

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý đơn hàng.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors active:scale-95">
           {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCcw className="w-4 h-4" />} 
           Làm mới dữ liệu
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Chờ xác nhận" value={stats.new} icon={<Package className="text-blue-600" />} color="bg-blue-50 border-blue-100" textColor="text-blue-700" />
        <StatCard title="Đang giao" value={stats.shipping} icon={<Truck className="text-orange-600" />} color="bg-orange-50 border-orange-100" textColor="text-orange-700" />
        <StatCard title="Thành công" value={stats.completed} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50 border-emerald-100" textColor="text-emerald-700" />
        <StatCard title="Đã hủy" value={stats.cancelled} icon={<XCircle className="text-red-600" />} color="bg-red-50 border-red-100" textColor="text-red-700" />
      </div>

      {/* FILTER BAR - Đã chỉnh sửa */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1 min-w-[280px] group">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            placeholder="Tìm theo Mã đơn, Khách hàng..." 
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
          />
          {keyword && (
            <button onClick={() => setKeyword("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
               <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Dropdown Lọc trạng thái */}
        <div className="relative min-w-[180px]">
           <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "ALL")} 
              className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white cursor-pointer hover:bg-gray-50 transition-all font-medium text-gray-700"
           >
             <option value="ALL">📋 Tất cả trạng thái</option>
             <option value="CONFIRMED">📦 Chờ xác nhận</option>
             <option value="SHIPPING">🚚 Đang giao hàng</option>
             <option value="COMPLETED">✅ Thành công</option>
             <option value="CANCELLED">❌ Đã hủy</option>
           </select>
           {/* Mũi tên custom cho đẹp */}
           <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
           </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading && (
           <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                 <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                 <span className="text-sm font-medium text-emerald-700">Đang cập nhật...</span>
              </div>
           </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 whitespace-nowrap">Mã đơn</th>
                <th className="py-4 px-6 whitespace-nowrap">Khách hàng</th>
                <th className="py-4 px-6 whitespace-nowrap">Sản phẩm</th>
                <th className="py-4 px-6 whitespace-nowrap">Tổng tiền</th>
                <th className="py-4 px-6 whitespace-nowrap">Ngày đặt</th>
                <th className="py-4 px-6 whitespace-nowrap">Trạng thái</th>
                <th className="py-4 px-6 whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 && !loading ? (
                <tr><td colSpan={7} className="py-20 text-center text-gray-400">Không tìm thấy đơn hàng nào phù hợp.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-700">#{o.order_id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{o.customer_name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{o.shipping_address}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-800 line-clamp-1">{o.items[0]?.product_name}</span>
                        {o.items.length > 1 && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">+{o.items.length - 1} sp khác</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">{formatVND(o.total_amount)}</td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="py-4 px-6"><StatusBadge status={o.status} /></td>
                    
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.status === "CONFIRMED" && (
                          <>
                            <button onClick={() => handleUpdateStatus(o.order_id, "SHIPPING")} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all" title="Duyệt đơn"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleUpdateStatus(o.order_id, "CANCELLED")} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all" title="Từ chối"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        <button onClick={() => setSelectedOrder(o)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chi tiết"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT (Giữ nguyên) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div><h3 className="text-xl font-bold text-gray-800">Chi tiết đơn #{selectedOrder.order_id}</h3><p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p></div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2"><h4 className="font-bold flex items-center gap-2"><User className="w-4 h-4"/> Khách hàng</h4><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm"><p>Họ tên: <b>{selectedOrder.customer_name}</b></p><p>SĐT: <b>{selectedOrder.customer_phone || "N/A"}</b></p></div></div>
                 <div className="space-y-2"><h4 className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4"/> Giao hàng</h4><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm"><p className="line-clamp-2">{selectedOrder.shipping_address}</p><div className="mt-2"><StatusBadge status={selectedOrder.status} /></div></div></div>
              </div>

              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2"><Package className="w-4 h-4"/> Sản phẩm</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500 border-b border-gray-100"><tr><th className="py-2 px-4 text-left">Tên SP</th><th className="py-2 px-4 text-center">SL</th><th className="py-2 px-4 text-right">Tiền</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{selectedOrder.items.map((item, idx) => (<tr key={idx}><td className="py-3 px-4 text-gray-700">{item.product_name}</td><td className="py-3 px-4 text-center">x{item.quantity}</td><td className="py-3 px-4 text-right font-bold">{formatVND(item.line_total)}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end text-lg font-bold text-emerald-600">Tổng cộng: {formatVND(selectedOrder.total_amount)}</div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Đóng</button>
              {selectedOrder.status === "CONFIRMED" && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedOrder.order_id, "CANCELLED")} className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200">Từ chối</button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.order_id, "SHIPPING")} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Duyệt đơn</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Components con (StatCard & StatusBadge)
function StatCard({ title, value, icon, color, textColor }: any) {
  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] ${color}`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm`}>{icon}</div>
      <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p><p className={`text-2xl font-black ${textColor}`}>{value !== undefined ? value.toLocaleString() : "--"}</p></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    CONFIRMED: { label: "Chờ xác nhận", className: "bg-blue-50 text-blue-700 border border-blue-100" },
    SHIPPING: { label: "Đang giao", className: "bg-orange-50 text-orange-700 border border-orange-100" },
    COMPLETED: { label: "Thành công", className: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border border-red-100" },
  };
  const current = config[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${current.className}`}>{current.label}</span>;
}