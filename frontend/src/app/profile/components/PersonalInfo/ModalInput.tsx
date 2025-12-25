// frontend/src/app/profile/components/PersonalInfo/ModalInput.tsx
"use client";

import React from "react";

interface ModalInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function ModalInput({
  label,
  value,
  onChange,
  type = "text",
}: ModalInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold ml-4">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-[#D9D9D9] p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#88D0B5] transition"
      />
    </div>
  );
}
