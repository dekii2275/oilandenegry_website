// frontend/src/app/profile/components/PersonalInfo/InfoDisplay.tsx
"use client";

import React from "react";

interface InfoDisplayProps {
  label: string;
  value: string;
}

export default function InfoDisplay({ label, value }: InfoDisplayProps) {
  return (
    <div>
      <label className="text-sm font-bold text-gray-700 ml-2">{label}</label>
      <div className="bg-[#D9D9D9] p-3.5 rounded-xl text-black font-bold border border-gray-300">
        {value || "Chưa cập nhật"}
      </div>
    </div>
  );
}
