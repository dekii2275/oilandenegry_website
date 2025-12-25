// frontend/src/app/profile/components/Security/PasswordForm.tsx
"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

interface PasswordFormProps {
  useMockData: boolean;
  onChangePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<boolean> | void;
}

export default function PasswordForm({
  useMockData,
  onChangePassword,
}: PasswordFormProps) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSubmit = async () => {
    if (
      !form.current_password ||
      !form.new_password ||
      !form.confirm_password
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    if (form.new_password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setChangingPassword(true);
    await onChangePassword(form);
    setChangingPassword(false);
    setForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
          placeholder="Nhập mật khẩu hiện tại"
          value={form.current_password}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              current_password: e.target.value,
            }))
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
            placeholder="Nhập mật khẩu mới"
            value={form.new_password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                new_password: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#88D0B5] focus:border-transparent outline-none"
            placeholder="Xác nhận mật khẩu mới"
            value={form.confirm_password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                confirm_password: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={changingPassword}
        className="w-full bg-[#88D0B5] text-white py-3 rounded-lg font-bold hover:bg-[#76b9a1] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
      </button>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl flex gap-3">
        <AlertCircle className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs text-blue-700">
          Lần cuối bạn thay đổi mật khẩu là 3 tháng trước. Hệ thống khuyến nghị
          bạn nên đổi mật khẩu định kỳ 3 tháng một lần.
        </p>
      </div>
    </div>
  );
}
