"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx"; // Import thư viện Excel
import {
  Bell, Download, AlertTriangle, Loader2, Lock, Unlock, Trash2
} from "lucide-react";

// Định nghĩa kiểu dữ liệu User (Khớp với Backend)
interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "SELLER";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. HÀM GỌI API LẤY DANH SÁCH ---
  const fetchUsers = async () => {
    try {
      const token = Cookies.get("adminToken");
      // Fix lỗi: Nếu không có token thì tắt loading luôn để tránh quay mãi mãi
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("https://zenergy.cloud/api/users/?skip=0&limit=100", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("Bạn không có quyền Admin!");
        throw new Error("Lỗi tải danh sách người dùng");
      }

      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. HÀM KHÓA / MỞ KHÓA (BAN/UNBAN) ---
  const toggleUserStatus = async (userId: number, currentStatus: boolean, role: string) => {
    // Chặn không cho khóa Admin
    if (role === "ADMIN") {
      toast.error("Không thể khóa tài khoản Admin!");
      return;
    }

    if (!confirm(`Bạn có chắc muốn ${currentStatus ? 'KHÓA (BAN)' : 'MỞ KHÓA'} user này?`)) return;

    try {
      const token = Cookies.get("adminToken");
      // Gọi API PUT (Lưu ý: URL param query string)
      const res = await fetch(`https://zenergy.cloud/api/users/${userId}/status?is_active=${!currentStatus}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công!");
        // Cập nhật State trực tiếp (UX mượt mà, không cần reload trang)
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        ));
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Lỗi khi cập nhật");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  // --- 3. HÀM XÓA USER (Đã nâng cấp để đọc lỗi chi tiết từ Backend) ---
  const handleDeleteUser = async (userId: number, role: string) => {
    if (role === "ADMIN") {
      toast.error("Không thể xóa tài khoản Admin!");
      return;
    }

    if (!confirm("CẢNH BÁO: Hành động này không thể hoàn tác.\nNếu User này đã có dữ liệu (đơn hàng, token...), hệ thống sẽ chặn xóa.\nBạn có chắc chắn muốn thử XÓA vĩnh viễn?")) return;

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(`https://zenergy.cloud/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Đã xóa người dùng thành công!");
        // Cập nhật State: Loại bỏ user vừa xóa khỏi danh sách hiển thị
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } else {
        // QUAN TRỌNG: Đọc tin nhắn lỗi chi tiết từ Backend (lỗi 400)
        const errorData = await res.json();
        toast.error(errorData.detail || "Không thể xóa người dùng này");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  // --- 4. HÀM XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (users.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const dataToExport = users.map(user => ({
      "ID": user.id,
      "Họ và tên": user.full_name,
      "Email": user.email,
      "Vai trò": user.role,
      "Ngày tạo": user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "",
      "Trạng thái": user.is_active ? "Hoạt động" : "Bị khóa"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "DanhSachNguoiDung.xlsx");
    toast.success("Đang tải xuống file Excel...");
  };

  // Tính toán thống kê
  const totalUsers = users.length;
  const totalSellers = users.filter(u => u.role === "SELLER").length;
  const totalCustomers = users.filter(u => u.role === "CUSTOMER").length;
  const totalAdmins = users.filter(u => u.role === "ADMIN").length;

  return (
    <div className="flex-1 bg-gray-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
        <h1 className="font-semibold text-lg">Quản lý Người dùng</h1>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Cột trái: Bảng dữ liệu */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Thống kê */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox title="Tổng User" value={totalUsers} />
              <StatBox title="Khách hàng" value={totalCustomers} highlight="green" />
              <StatBox title="Seller" value={totalSellers} highlight="blue" />
              <StatBox title="Admin" value={totalAdmins} highlight="purple" />
            </div>

            {/* Bảng Users */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h3 className="font-bold text-gray-700">Danh sách tài khoản</h3>
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Download size={16} /> Xuất Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b">
                    <tr>
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Vai trò</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                      <th className="text-right py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin text-green-600" /> Đang tải dữ liệu...
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          Không có dữ liệu người dùng.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-500">#{user.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{user.full_name || "Chưa đặt tên"}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-[10px] text-gray-400 mt-1">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : ""}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                              user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              user.role === 'SELLER' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-green-50 text-green-600 border-green-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                             {user.is_active ? (
                               <span className="text-green-600 text-xs font-bold flex items-center gap-1.5">
                                 <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Active
                               </span>
                             ) : (
                               <span className="text-red-500 text-xs font-bold flex items-center gap-1.5">
                                 <span className="w-2 h-2 rounded-full bg-red-500"></span> Banned
                               </span>
                             )}
                          </td>
                          
                          {/* CỘT HÀNH ĐỘNG */}
                          <td className="py-3 px-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                               {/* Nút Khóa / Mở Khóa */}
                               <button 
                                 onClick={() => toggleUserStatus(user.id, user.is_active, user.role)}
                                 title={user.is_active ? "Khóa tài khoản" : "Mở khóa"}
                                 className={`p-2 rounded-md transition-colors border ${
                                   user.is_active 
                                   ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' 
                                   : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                                 }`}
                               >
                                 {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                               </button>

                               {/* Nút Xóa */}
                               <button 
                                 onClick={() => handleDeleteUser(user.id, user.role)}
                                 title="Xóa vĩnh viễn"
                                 className="p-2 rounded-md bg-white border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                               >
                                 <Trash2 size={16} />
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

          {/* Cột phải: Thông báo */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
              <h2 className="font-semibold flex items-center gap-2 text-sm text-gray-800 mb-3">
                <AlertTriangle className="text-orange-500 w-4 h-4" />
                Cần chú ý
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Hệ thống tự động chặn xóa các User đã phát sinh giao dịch (đơn hàng, cửa hàng...) để bảo toàn dữ liệu. Vui lòng sử dụng tính năng <b>Khóa tài khoản</b> thay thế.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component hiển thị ô thống kê
function StatBox({ title, value, highlight }: any) {
  const color = highlight === "green" ? "text-green-600" 
              : highlight === "blue" ? "text-blue-600" 
              : highlight === "purple" ? "text-purple-600" 
              : "text-gray-900";
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}