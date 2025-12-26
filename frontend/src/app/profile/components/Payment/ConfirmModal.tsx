// frontend/src/app/profile/components/Payment/ConfirmModal.tsx
"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ConfirmModalProps {
  type: "delete" | "disconnect";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon: LucideIcon;
}

export default function ConfirmModal({
  type,
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon: Icon,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const bgColor = type === "delete" ? "bg-red-600" : "bg-yellow-600";
  const hoverColor =
    type === "delete" ? "hover:bg-red-700" : "hover:bg-yellow-700";
  const iconBgColor = type === "delete" ? "bg-red-100" : "bg-yellow-100";
  const iconColor = type === "delete" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <Icon className={iconColor} size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${bgColor} text-white py-3 rounded-lg font-bold ${hoverColor} transition`}
          >
            {type === "delete" ? "Xác nhận xóa" : "Hủy liên kết"}
          </button>
        </div>
      </div>
    </div>
  );
}
