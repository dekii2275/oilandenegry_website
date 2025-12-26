// frontend/src/app/profile/components/Payment/AddCardModal.tsx
"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (cardData: {
    card_number: string;
    expiry_date: string;
    cvv: string;
    card_holder_name: string;
  }) => Promise<void>;
  useMockData: boolean;
  addingCard: boolean;
}

export default function AddCardModal({
  isOpen,
  onClose,
  onAddCard,
  useMockData,
  addingCard,
}: AddCardModalProps) {
  const [form, setForm] = useState({
    card_number: "",
    expiry_date: "",
    cvv: "",
    card_holder_name: "",
  });

  const handleSubmit = async () => {
    if (
      !form.card_number ||
      !form.expiry_date ||
      !form.cvv ||
      !form.card_holder_name
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const cardNumber = form.card_number.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cardNumber)) {
      alert("Số thẻ phải có 16 chữ số");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(form.expiry_date)) {
      alert("Định dạng ngày hết hạn không đúng (MM/YY)");
      return;
    }

    if (!/^\d{3,4}$/.test(form.cvv)) {
      alert("CVV phải có 3-4 chữ số");
      return;
    }

    await onAddCard({
      ...form,
      card_number: cardNumber,
    });

    setForm({
      card_number: "",
      expiry_date: "",
      cvv: "",
      card_holder_name: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-6">Thêm thẻ thanh toán mới</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Số thẻ</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
              placeholder="1234 5678 9012 3456"
              value={form.card_number}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  card_number: e.target.value
                    .replace(/\D/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim(),
                }))
              }
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ngày hết hạn (MM/YY)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
                placeholder="12/26"
                value={form.expiry_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expiry_date: e.target.value
                      .replace(/\D/g, "")
                      .replace(/(\d{2})(\d{0,2})/, "$1/$2"),
                  }))
                }
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
                placeholder="123"
                value={form.cvv}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên chủ thẻ
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
              placeholder="NGUYEN VAN A"
              value={form.card_holder_name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  card_holder_name: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={addingCard}
              className="flex-1 bg-[#88D0B5] text-white py-3 rounded-lg font-bold hover:bg-[#76b9a1] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {addingCard ? "Đang thêm..." : "Thêm thẻ"}
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            <div className="flex items-center justify-center gap-2">
              <Shield size={14} />
              {useMockData
                ? "Dữ liệu thẻ chỉ được lưu cục bộ (Mock Data)"
                : "Thông tin thẻ được bảo mật và mã hóa"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
