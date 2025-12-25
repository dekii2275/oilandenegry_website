// frontend/src/app/profile/components/PersonalInfo/EditInfoModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

interface EditInfoModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export default function EditInfoModal({
  title,
  onClose,
  onSave,
  children,
}: EditInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-8 text-center border-b border-black pb-2">
          {title}
        </h2>
        {children}
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-200 px-8 py-2 rounded-xl font-bold border border-gray-400 hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="bg-[#88D0B5] text-white px-8 py-2 rounded-xl font-bold hover:bg-[#76b9a1] transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
