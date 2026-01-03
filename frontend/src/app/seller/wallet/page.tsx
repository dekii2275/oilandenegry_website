"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowDownCircle, HelpCircle, RefreshCcw } from "lucide-react";
import Cookies from "js-cookie"; // 📦 Import để lấy Token
import { toast, Toaster } from "react-hot-toast"; // 📦 Thông báo đẹp

/* =======================
   CONSTANTS
   ======================= */
// Đổi thành URL thật của bạn nếu chạy local (ví dụ: http://localhost:8000/api)
const API_BASE_URL = "https://zenergy.cloud/api"; 

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

interface WalletOverview {
  balance: number;
  totalRevenue: number;
  platformFee: number;
  pendingPayout: number;
}

type WithdrawStatus = "PENDING" | "COMPLETED" | "REJECTED";

interface WithdrawRequest {
  id: string;
  code: string;
  requestDate: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: WithdrawStatus;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

/* =======================
   PAGE
   ======================= */

export default function WalletPage() {
  /* ===== STATE ===== */
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH DATA – BACKEND
     ======================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy Token từ Cookie (accessToken hoặc token)
      const token = Cookies.get("accessToken") || Cookies.get("token");
      
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 2. Gọi song song 3 API để load nhanh hơn
      const [resOverview, resRequests, resBank] = await Promise.all([
        fetch(`${API_BASE_URL}/seller/wallet/overview`, { headers }),
        fetch(`${API_BASE_URL}/seller/wallet/withdraw-requests`, { headers }),
        fetch(`${API_BASE_URL}/seller/wallet/bank-account`, { headers }),
      ]);

      // 3. Xử lý dữ liệu trả về
      if (resOverview.ok) {
        const data = await resOverview.json();
        setOverview(data);
      } else {
        console.error("Lỗi Overview:", await resOverview.text());
      }

      if (resRequests.ok) {
        const data = await resRequests.json();
        setWithdraws(data);
      }

      if (resBank.ok) {
        const data = await resBank.json();
        // Nếu API trả về null (chưa có bank), state sẽ là null
        setBankAccount(data);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Không thể tải dữ liệu ví tiền");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component vừa load
  useEffect(() => {
    fetchData();
  }, []);

  /* =======================
     HANDLERS
     ======================= */

  const handleWithdraw = async () => {
    // 1. Kiểm tra điều kiện cơ bản
    if (!overview || overview.balance <= 0) {
      toast.error("Số dư hiện tại là 0đ, không thể rút tiền.");
      return;
    }

    if (!bankAccount) {
      toast.error("Bạn chưa cấu hình tài khoản ngân hàng nhận tiền.");
      return;
    }

    // 2. Nhập số tiền (Dùng prompt đơn giản, thực tế nên dùng Modal)
    const input = window.prompt(`Nhập số tiền muốn rút (Tối đa: ${overview.balance.toLocaleString()} ₫):`);
    if (!input) return; // Người dùng bấm Hủy

    const amount = parseFloat(input.replace(/,/g, "")); // Xóa dấu phẩy nếu user nhập kiểu 1,000

    // 3. Validate số tiền
    if (isNaN(amount) || amount <= 0) {
      toast.error("Số tiền không hợp lệ.");
      return;
    }

    if (amount > overview.balance) {
      toast.error("Số tiền vượt quá số dư khả dụng.");
      return;
    }

    // 4. Gọi API Rút tiền
    try {
        const token = Cookies.get("accessToken") || Cookies.get("token");
        const res = await fetch(`${API_BASE_URL}/seller/wallet/withdraw`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: amount }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Gửi yêu cầu rút tiền thành công!");
            // Reload lại dữ liệu để cập nhật số dư mới và lịch sử
            fetchData();
        } else {
            toast.error(data.detail || "Lỗi khi tạo yêu cầu rút tiền.");
        }
    } catch (error) {
        toast.error("Lỗi kết nối server.");
    }
  };

  /* =======================
     UI
     ======================= */

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen">
      <Toaster position="top-right" />
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            Ví tiền & Rút tiền
            {loading && <RefreshCcw className="w-4 h-4 animate-spin text-green-600" />}
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý doanh thu, theo dõi dòng tiền và yêu cầu thanh toán.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">
          <HelpCircle className="w-4 h-4" />
          Hướng dẫn
        </button>
      </div>

      {/* ===== OVERVIEW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* BALANCE */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Số dư khả dụng</p>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {overview?.balance !== undefined
                ? overview.balance.toLocaleString() + " ₫"
                : "--"}
            </p>
            <p className="text-xs text-gray-400">Có thể rút ngay lập tức</p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!overview || overview.balance <= 0}
            className={`flex items-center justify-center gap-2 text-white px-4 py-3 rounded-lg text-sm font-medium mt-4 transition-all
                ${(!overview || overview.balance <= 0) 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"}`}
          >
            <ArrowDownCircle className="w-5 h-5" />
            Yêu cầu Rút tiền
          </button>
        </div>

        {/* MONTH REPORT */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-50">
            Báo cáo doanh thu
          </p>

          <div className="space-y-3 text-sm">
            <Row
              label="Tổng doanh thu"
              value={overview?.totalRevenue}
              positive
            />
            <Row
              label="Phí nền tảng & khấu trừ"
              value={overview?.platformFee}
              negative
            />
            <Row
              label="Đang chờ thanh toán"
              value={overview?.pendingPayout}
            />
          </div>
        </div>

        {/* BANK INFO */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-50">Cấu hình Thanh toán</p>

          {bankAccount ? (
             <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-xl p-4 shadow-md relative z-10">
              <p className="text-sm font-medium opacity-90">{bankAccount.bankName}</p>
              <p className="text-lg font-bold tracking-widest my-3 font-mono">
                **** **** {bankAccount.accountNumber.slice(-4)}
              </p>
              <p className="text-xs uppercase opacity-80">
                {bankAccount.accountHolder}
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50">
                <p className="text-sm text-gray-400">
                Chưa cấu hình tài khoản ngân hàng
                </p>
            </div>
          )}
          
          {/* Nút thêm/sửa chỉ là demo, cần dẫn link tới trang settings */}
          <button className="mt-4 w-full text-sm text-green-600 font-medium hover:underline">
            {bankAccount ? "Thay đổi tài khoản" : "+ Thêm tài khoản ngân hàng"}
          </button>
          
          <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-green-50 opacity-50 pointer-events-none" />
        </div>
      </div>

      {/* ===== WITHDRAW HISTORY ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">
          Lịch sử Yêu cầu Rút tiền
        </h2>

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="text-left text-gray-500 bg-gray-50 border-y border-gray-100">
                <tr>
                <th className="py-3 px-4 font-medium">Mã GD</th>
                <th className="py-3 px-4 font-medium">Ngày yêu cầu</th>
                <th className="py-3 px-4 font-medium">Số tiền</th>
                <th className="py-3 px-4 font-medium">Ngân hàng</th>
                <th className="py-3 px-4 font-medium">Trạng thái</th>
                </tr>
            </thead>

            <tbody>
                {withdraws.length === 0 ? (
                <tr>
                    <td
                    colSpan={5}
                    className="py-8 text-center text-gray-400 italic"
                    >
                    Chưa có giao dịch rút tiền nào.
                    </td>
                </tr>
                ) : (
                withdraws.map((w) => (
                    <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-green-600 font-medium font-mono">
                        {w.code}
                    </td>
                    <td className="py-3 px-4">{new Date(w.requestDate).toLocaleDateString("vi-VN")}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{w.amount.toLocaleString()} ₫</td>
                    <td className="py-3 px-4 text-gray-600">
                        {w.bankName} ••••{" "}
                        {w.bankAccount.slice(-4)}
                    </td>
                    <td className="py-3 px-4">
                        <WithdrawStatusBadge status={w.status} />
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

/* =======================
   COMPONENTS
   ======================= */

function Row({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value?: number;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-semibold ${
          positive
            ? "text-green-600"
            : negative
            ? "text-red-500"
            : "text-gray-700"
        }`}
      >
        {value !== undefined ? value.toLocaleString() + " ₫" : "0 ₫"}
      </span>
    </div>
  );
}

function WithdrawStatusBadge({
  status,
}: {
  status: WithdrawStatus;
}) {
  const map: Record<WithdrawStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
    COMPLETED: "bg-green-100 text-green-700 ring-1 ring-green-200",
    REJECTED: "bg-red-100 text-red-700 ring-1 ring-red-200",
  };

  const label: Record<WithdrawStatus, string> = {
    PENDING: "Đang xử lý",
    COMPLETED: "Hoàn thành",
    REJECTED: "Từ chối",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}