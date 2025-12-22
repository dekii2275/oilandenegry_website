"use client";

import { useState } from "react";

interface CircleCheckboxProps {
  label: string;
  rightText?: string;
  defaultChecked?: boolean;
}

export default function CircleCheckbox({
  label,
  rightText,
  defaultChecked = false,
}: CircleCheckboxProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onClick={() => setIsChecked(!isChecked)}
    >
      <div className="relative">
        <div
          className={`w-4 h-4 rounded-full border-2 transition-colors ${
            isChecked ? "border-green-600" : "border-gray-400"
          }`}
        />

        {isChecked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-600" />
          </div>
        )}
      </div>

      <span className="text-sm text-gray-700 flex-1">{label}</span>

      {rightText && <span className="text-xs text-gray-500">{rightText}</span>}
    </div>
  );
}
