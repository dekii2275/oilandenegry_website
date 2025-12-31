"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

/* =========================
   SCHEMA
========================= */
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SellerLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    console.log("LOGIN:", data);
    // TODO: call API login
  };

  return (
    /* ===== FULL CONTENT AREA (KHÔNG DÙNG min-h-screen) ===== */
    <div className="w-full h-full flex items-center justify-center bg-[#F1FFF7]">
      {/* ===== CARD ===== */}
      <div className="w-full max-w-[520px] rounded-[28px] bg-white px-12 py-14
        shadow-[0_30px_80px_rgba(16,185,129,0.25)]"
      >
        {/* TAG */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 rounded-full
            border border-emerald-200 bg-emerald-50
            px-4 py-1 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            SELLER
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-center text-[32px] font-extrabold text-slate-900">
          Đăng nhập Seller
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Đăng nhập để quản lý cửa hàng và đơn hàng
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          {/* EMAIL */}
          <Input
            label="Email"
            type="email"
            placeholder="example@email.com"
            {...register("email")}
            error={errors.email?.message}
          />

          {/* PASSWORD */}
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          {/* BUTTON */}
          <button
            disabled={isSubmitting}
            className="mt-2 h-14 w-full rounded-full
              bg-emerald-500 text-base font-semibold text-white
              shadow-[0_20px_40px_rgba(16,185,129,0.45)]
              hover:bg-emerald-600 transition disabled:opacity-60"
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* FOOT */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/seller/register"
            className="font-semibold text-emerald-600 hover:underline"
          >
            Đăng ký Seller
          </Link>
        </p>
      </div>
    </div>
  );
}

/* =========================
   INPUT
========================= */
function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 h-14 w-full rounded-full
          border border-slate-100 bg-[#F7F9FC]
          px-6 text-sm outline-none
          focus:border-emerald-300
          focus:ring-4 focus:ring-emerald-100"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
