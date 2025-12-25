// components/ui/CircleCheckbox.tsx
"use client";

interface CircleCheckboxProps {
  checked?: boolean;
  onChange?: () => void;
  label?: string;
}

export default function CircleCheckbox({
  checked = false,
  onChange,
  label,
}: CircleCheckboxProps) {
  return (
    <div className="flex items-center cursor-pointer group" onClick={onChange}>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-green-600 border-green-600"
            : "border-gray-300 group-hover:border-green-500"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className="ml-3 text-sm text-gray-700 group-hover:text-green-600 transition-colors">
          {label}
        </span>
      )}
    </div>
  );
}
