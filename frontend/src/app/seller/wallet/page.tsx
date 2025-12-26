"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowDownCircle, HelpCircle } from "lucide-react";

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
  /* ===== STATE (EMPTY) ===== */
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH DATA – BACKEND
     ======================= */
  useEffect(() => {
    setLoading(true);

    /*
      TODO: BACKEND APIs

      - GET /api/seller/wallet/overview
        -> balance, totalRevenue, platformFee, pendingPayout

      - GET /api/seller/wallet/withdraw-requests

      - GET /api/seller/wallet/bank-account
    */

    setLoading(false);
  }, []);

  /* =======================
     HANDLERS
     ======================= */

  const handleWithdraw = () => {
    /*
      TODO:
      - POST /api/seller/wallet/withdraw
      Payload:
        {
          amount
        }
    */
  };

  /* =======================
     UI
     ======================= */

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Ví tiền & Rút tiền</h1>
          <p className="text-sm text-gray-500">
            Quản lý doanh thu, theo dõi dòng tiền và yêu cầu thanh toán.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
          <HelpCircle className="w-4 h-4" />
          Hướng dẫn
        </button>
      </div>

      {/* ===== OVERVIEW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* BALANCE */}
        <div className="bg-white rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Số dư khả dụng</p>
          <p className="text-2xl font-semibold mb-4">
            {overview?.balance !== undefined
              ? overview.balance.toLocaleString() + " ₫"
              : "--"}
          </p>

          <button
            onClick={handleWithdraw}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <ArrowDownCircle className="w-4 h-4" />
            Yêu cầu Rút tiền
          </button>
        </div>

        {/* MONTH REPORT */}
        <div className="bg-white rounded-xl p-5">
          <p className="font-medium mb-4">
            Báo cáo doanh thu tháng này
          </p>

          <div className="space-y-2 text-sm">
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
        <div className="bg-white rounded-xl p-5">
          <p className="font-medium mb-4">Cấu hình Thanh toán</p>

          {bankAccount ? (
            <div className="bg-green-600 text-white rounded-xl p-4">
              <p className="text-sm">{bankAccount.bankName}</p>
              <p className="font-semibold tracking-widest my-2">
                **** **** {bankAccount.accountNumber.slice(-4)}
              </p>
              <p className="text-xs">
                {bankAccount.accountHolder}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Chưa cấu hình tài khoản ngân hàng
            </p>
          )}

          <button className="mt-4 text-sm text-green-600 font-medium">
            + Thêm / chỉnh sửa tài khoản ngân hàng
          </button>
        </div>
      </div>

      {/* ===== WITHDRAW HISTORY ===== */}
      <div className="bg-white rounded-xl p-5">
        <h2 className="font-semibold mb-4">
          Lịch sử Yêu cầu Rút tiền
        </h2>

        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Mã GD</th>
              <th>Ngày yêu cầu</th>
              <th>Số tiền</th>
              <th>Ngân hàng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {withdraws.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-gray-400"
                >
                  Chưa có yêu cầu rút tiền
                </td>
              </tr>
            ) : (
              withdraws.map((w) => (
                <tr key={w.id} className="border-b">
                  <td className="py-3 text-green-600 font-medium">
                    {w.code}
                  </td>
                  <td>{w.requestDate}</td>
                  <td>{w.amount.toLocaleString()} ₫</td>
                  <td>
                    {w.bankName} ••••{" "}
                    {w.bankAccount.slice(-4)}
                  </td>
                  <td>
                    <WithdrawStatusBadge status={w.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${
          positive
            ? "text-green-600"
            : negative
            ? "text-red-500"
            : ""
        }`}
      >
        {value !== undefined ? value.toLocaleString() + " ₫" : "--"}
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
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const label: Record<WithdrawStatus, string> = {
    PENDING: "Đang xử lý",
    COMPLETED: "Hoàn thành",
    REJECTED: "Từ chối",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
