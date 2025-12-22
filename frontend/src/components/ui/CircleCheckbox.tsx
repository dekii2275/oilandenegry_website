"use client"

export default function CircleCheckbox({
  checked = false,
  onChange,
}: {
  checked?: boolean
  onChange?: () => void
}) {
  return (
    <div
      onClick={onChange}
      className={`w-5 h-5 rounded-full border cursor-pointer flex items-center justify-center
        ${checked ? "border-green-600 bg-green-600" : "border-gray-300"}
      `}
    >
      {checked && <div className="w-2 h-2 bg-white rounded-full" />}
    </div>
  )
}
