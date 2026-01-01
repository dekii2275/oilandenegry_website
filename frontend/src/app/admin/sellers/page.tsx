"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Search, Filter, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";

// ==========================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (Cập nhật đầy đủ)
// ==========================================
interface StoreInfo {
  store_name: string;
  phone_number: string;
  business_license: string;
  tax_code: string;
  address: string;
  // 👇 Bổ sung các trường này để khớp Backend
  city?: string;
  district?: string;
  ward?: string;
}

interface Seller {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;   
  is_approved: boolean; 
  is_verified: boolean; // 👇 Bổ sung trường này
  created_at: string;
  store: StoreInfo | null; 
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // ==========================================
  // 2. GỌI API LẤY DANH SÁCH
  // ==========================================
  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://zenergy.cloud/api/admin/sellers", {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // 👈 Báo Server không dùng cache
        },
        credentials: "include", // 👈 Quan trọng: Gửi Cookie
        cache: "no-store",      // 👈 Quan trọng: Báo Trình duyệt không lưu cache cũ
      });

      if (res.ok) {
        const data = await res.json();
        setSellers(data);
      } else {
        // Nếu lỗi 401/403 thì có thể do chưa đăng nhập Admin
        if (res.status === 401 || res.status === 403) {
          toast.error("Phiên đăng nhập hết hạn hoặc không có quyền Admin");
        } else {
          toast.error("Không thể tải danh sách Seller");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // ==========================================
  // 3. XỬ LÝ DUYỆT / TỪ CHỐI
  // ==========================================
  
  const handleApprove = async (id: number) => {
    if (!confirm("Xác nhận DUYỆT nhà bán hàng này? Email thông báo sẽ được gửi tự động.")) return;
    
    setIsProcessing(id);
    try {
      const res = await fetch(`https://zenergy.cloud/api/admin/sellers/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        toast.success("✅ Đã duyệt thành công! Email đã được gửi.");
        fetchSellers(); // Load lại danh sách ngay
      } else {
        const err = await res.json();
        toast.error(`Lỗi: ${err.detail}`);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn TỪ CHỐI? Yêu cầu này sẽ bị xóa.")) return;

    setIsProcessing(id);
    try {
      const res = await fetch(`https://zenergy.cloud/api/admin/sellers/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        toast.success("🚫 Đã từ chối và xóa yêu cầu.");
        fetchSellers();
      } else {
        const err = await res.json();
        toast.error(`Lỗi: ${err.detail}`);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsProcessing(null);
    }
  };

  // ==========================================
  // 4. PHÂN LOẠI DỮ LIỆU
  // ==========================================
  const pendingSellers = sellers.filter((s) => !s.is_approved);
  const approvedSellers = sellers.filter((s) => s.is_approved);

  return (
    <div className="flex-1 bg-gray-100 flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-semibold text-lg">Quản lý Nhà bán hàng</h1>
          <p className="text-sm text-gray-500">Quản lý đối tác và phê duyệt đăng ký mới</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchSellers} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Làm mới">
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Bell className="w-5 h-5 text-gray-600" />
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition">
            <Plus size={16} />
            Thêm thủ công
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-3" />
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* --- SECTION 1: HÀNG CHỜ DUYỆT --- */}
            {pendingSellers.length > 0 && (
              <section className="bg-orange-50 border border-orange-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold flex items-center gap-2 text-orange-800 text-lg">
                      <span className="bg-orange-100 p-2 rounded-lg">📦</span>
                      Hàng chờ duyệt ({pendingSellers.length})
                    </h2>
                    <p className="text-sm text-orange-600/80 mt-1 ml-11">
                      Cần xem xét kỹ thông tin GPKD trước khi phê duyệt.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingSellers.map((seller) => (
                    <PendingSellerCard
                      key={seller.id}
                      seller={seller}
                      isProcessing={isProcessing === seller.id}
                      onApprove={() => handleApprove(seller.id)}
                      onReject={() => handleReject(seller.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* --- SECTION 2: DANH SÁCH NHÀ BÁN HÀNG --- */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="font-bold text-gray-800 text-lg">
                  Danh sách Đối tác ({approvedSellers.length})
                </h2>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      placeholder="Tìm tên shop, email..."
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                    <Filter size={16} /> Lọc
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4">Thông tin Shop</th>
                      <th className="py-3 px-4">Chủ sở hữu</th>
                      <th className="py-3 px-4">Ngày tham gia</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {approvedSellers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Chưa có nhà bán hàng nào trong danh sách.
                        </td>
                      </tr>
                    ) : (
                      approvedSellers.map((seller) => (
                        <SellerRow key={seller.id} seller={seller} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT CON
// ==========================================

function PendingSellerCard({
  seller,
  onApprove,
  onReject,
  isProcessing
}: {
  seller: Seller;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const date = new Date(seller.created_at).toLocaleDateString("vi-VN");
  const time = new Date(seller.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
            {seller.store?.store_name?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 line-clamp-1" title={seller.store?.store_name}>
              {seller.store?.store_name || "Chưa đặt tên Shop"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Đăng ký: {time} - {date}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full uppercase tracking-wider">
          Pending
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600 mb-5">
        <div className="flex justify-between">
          <span className="text-gray-500 text-xs">Chủ sở hữu:</span>
          <span className="font-medium text-right">{seller.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-xs">Email:</span>
          <span className="font-medium text-right truncate max-w-[150px]" title={seller.email}>{seller.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-xs">SĐT:</span>
          <span className="font-medium text-right">{seller.store?.phone_number}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
          <span className="text-gray-500 text-xs">GPKD:</span>
          <span className="font-bold text-gray-800 text-right">{seller.store?.business_license}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-100 transition disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Duyệt"}
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}

function SellerRow({ seller }: { seller: Seller }) {
  const date = new Date(seller.created_at).toLocaleDateString("vi-VN");

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="py-4 px-4">
        <div>
          <p className="font-semibold text-gray-800">{seller.store?.store_name || "---"}</p>
          <p className="text-xs text-gray-500">ID: #{seller.id}</p>
        </div>
      </td>

      <td className="px-4">
        <p className="text-gray-800 text-sm">{seller.full_name}</p>
        <p className="text-xs text-gray-500">{seller.email}</p>
      </td>

      <td className="px-4 text-gray-600">{date}</td>

      <td className="px-4">
        {seller.is_active ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
            Hoạt động
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5"></span>
            Đã khóa
          </span>
        )}
      </td>

      <td className="px-4 text-right">
        <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition">
          <span className="sr-only">Menu</span>
          •••
        </button>
      </td>
    </tr>
  );
}