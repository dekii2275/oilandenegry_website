// frontend/src/app/profile/components/Payment/CreditCardItem.tsx
"use client";

import React from "react";
import { XCircle, Trash2 } from "lucide-react";
import { PaymentMethod } from "../../types";

interface CreditCardItemProps {
  card: PaymentMethod;
  useMockData: boolean;
  isActive: boolean;
  onSetDefault: (cardId: string) => void;
  onDisconnect: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  onReconnect: (cardId: string) => void;
}

export default function CreditCardItem({
  card,
  useMockData,
  isActive,
  onSetDefault,
  onDisconnect,
  onDelete,
  onReconnect,
}: CreditCardItemProps) {
  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case "visa":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="font-bold">Visa</span>
          </div>
        );
      case "mastercard":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold">MasterCard</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="font-bold">Thẻ</span>
          </div>
        );
    }
  };

  const formatExpiryDate = (month?: number, year?: number) => {
    if (!month || !year) return "--/--";
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-50 to-white p-6 rounded-[20px] border border-gray-300 relative overflow-hidden group transition-all hover:shadow-lg ${
        card.is_default && isActive
          ? "ring-2 ring-[#88D0B5] bg-gradient-to-r from-green-50/30 to-white"
          : !isActive
          ? "bg-gradient-to-r from-gray-100 to-gray-200 opacity-70"
          : ""
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        {getCardTypeIcon(card.type)}
        {isActive ? (
          card.is_default ? (
            <span className="bg-[#88D0B5] text-[10px] font-bold px-2 py-1 rounded-md text-white">
              MẶC ĐỊNH
            </span>
          ) : (
            <button
              onClick={() => onSetDefault(card.id)}
              className="text-xs text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 px-2 py-1 rounded transition"
            >
              Đặt mặc định
            </button>
          )
        ) : (
          <span className="bg-gray-400 text-[10px] font-bold px-2 py-1 rounded-md text-white">
            ĐÃ HỦY
          </span>
        )}
      </div>

      <div className="text-xl font-mono tracking-widest mb-6">
        **** **** **** {card.last_four || "••••"}
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-xs text-gray-600">Tên chủ thẻ</div>
          <div className="font-bold text-sm">{card.card_holder_name}</div>
        </div>

        <div className="space-y-1 text-right">
          <div className="text-xs text-gray-600">Hết hạn</div>
          <div className="font-bold text-sm">
            {formatExpiryDate(card.expiry_month, card.expiry_year)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
        <div className="text-xs text-gray-600">
          {card.bank_name || "Thẻ thanh toán"}
          {useMockData && <span className="text-gray-400 ml-2">(Mock)</span>}
          {!isActive && <span className="text-gray-400 ml-2">(Đã hủy)</span>}
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <>
              <button
                onClick={() => onDisconnect(card.id)}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                title="Hủy liên kết thẻ"
              >
                <XCircle size={18} />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"
                title="Xóa thẻ"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onReconnect(card.id)}
              className="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded text-sm font-medium transition"
            >
              Kích hoạt lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
