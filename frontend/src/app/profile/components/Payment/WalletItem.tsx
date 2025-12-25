"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Wallet as WalletType } from "../../types";

interface WalletItemProps {
  wallet: WalletType;
  useMockData: boolean;
  onConnect: (walletType: string) => void;
  onDisconnect: (walletType: string) => void;
  formatCurrency: (amount: number) => string;
}

const WALLET_LOGOS: Record<string, string> = {
  momo: "https://cdn.simpleicons.org/momo/ae2070",
  zalopay: "https://cdn.simpleicons.org/zalopay/0068ff",
  vnpay: "https://cdn.simpleicons.org/vnpay/005baa",
};

export default function WalletItem({
  wallet,
  useMockData,
  onConnect,
  onDisconnect,
  formatCurrency,
}: WalletItemProps) {
  const getWalletName = (type: string) => {
    switch (type) {
      case "momo":
        return "Ví MoMo";
      case "zalopay":
        return "ZaloPay";
      case "vnpay":
        return "VNPay";
      default:
        return "Ví điện tử";
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-300 transition-all hover:shadow-md ${
        !wallet.is_linked ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* LOGO */}
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <img
              src={WALLET_LOGOS[wallet.type] || ""}
              alt={wallet.type}
              className="w-8 h-8 object-contain"
            />
          </div>

          {/* INFO */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{getWalletName(wallet.type)}</p>
              {wallet.is_linked ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Đang hoạt động
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  Chưa kết nối
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600">
              {wallet.is_linked
                ? wallet.phone_number || "Đã liên kết"
                : "Chưa kết nối"}
            </p>

            {wallet.is_linked && wallet.balance && (
              <p className="text-sm font-bold text-green-600 mt-1">
                Số dư: {formatCurrency(wallet.balance)}
              </p>
            )}

            {wallet.linked_at && (
              <p className="text-xs text-gray-500 mt-1">
                Kết nối:{" "}
                {new Date(wallet.linked_at).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        {wallet.is_linked ? (
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={16} />
              Đã liên kết
            </div>
            <button
              onClick={() => onDisconnect(wallet.type)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Hủy liên kết
            </button>
          </div>
        ) : (
          <button
            onClick={() => onConnect(wallet.type)}
            className="bg-[#88D0B5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#76b9a1] transition"
          >
            Kết nối ngay
          </button>
        )}
      </div>
    </div>
  );
}
