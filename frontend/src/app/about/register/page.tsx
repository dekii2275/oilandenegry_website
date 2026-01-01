"use client";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, forwardRef } from "react"; // 👈 Thêm forwardRef vào import

/* =========================
   BACKEND SCHEMA
========================= */
const sellerSchema = z.object({
  store_name: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
  store_description: z.string().min(10, "Mô tả tối thiểu 10 ký tự"),
  phone_number: z.string().min(8, "Số điện thoại không hợp lệ"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  city: z.string().min(1, "Vui lòng nhập tỉnh / thành phố"),
  district: z.string().min(1, "Vui lòng nhập quận / huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường / xã"),
  business_license: z.string().min(1, "Vui lòng nhập giấy phép kinh doanh"),
  tax_code: z.string().min(1, "Vui lòng nhập mã số thuế"),
});

type SellerForm = z.infer<typeof sellerSchema>;

export default function SellerRegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SellerForm>({
    resolver: zodResolver(sellerSchema),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: SellerForm) => {
    setSubmitError(null);
    try {
      // Gọi API Backend
      const res = await fetch("https://zenergy.cloud/api/users/register-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Quan trọng: Gửi cookie đi để xác thực
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || "Đăng ký thất bại");
      }

      // Thành công
      alert("🎉 Đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
      reset();

    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      setSubmitError(error.message);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    }
  };

  return (
    <main className="bg-[#F1FFF7] min-h-screen flex flex-col">
      <Header />

      {/* ================= CONTENT ================= */}
      <section className="flex-1 px-4 py-16">
        <div className="mx-auto w-full max-w-[720px]">
          {/* ===== TITLE ===== */}
          <div className="text-center mb-10">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-1 text-[11px] font-semibold text-emerald-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                ĐỐI TÁC KINH DOANH
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">
              Đăng ký trở thành{" "}
              <span className="text-emerald-500">Seller Z-energy</span>
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-slate-500">
              Điền thông tin cửa hàng để trở thành đối tác kinh doanh chính thức
              trong hệ sinh thái Z-energy.
            </p>
          </div>

          {/* ===== FORM CARD ===== */}
          <div className="rounded-3xl bg-white p-8 shadow-[0_14px_40px_rgba(16,185,129,0.15)]">
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Tên cửa hàng / Doanh nghiệp"
                placeholder="Ví dụ: Công ty Năng lượng Xanh..."
                {...register("store_name")}
                error={errors.store_name?.message}
              />

              <Textarea
                label="Mô tả cửa hàng"
                placeholder="Giới thiệu ngắn gọn về quy mô, sản phẩm kinh doanh..."
                {...register("store_description")}
                error={errors.store_description?.message}
              />

              <Input
                label="Số điện thoại liên hệ"
                placeholder="0912..."
                {...register("phone_number")}
                error={errors.phone_number?.message}
              />

              <Input
                label="Địa chỉ trụ sở"
                placeholder="Số nhà, đường..."
                {...register("address")}
                error={errors.address?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Tỉnh / Thành phố"
                  placeholder="Hà Nội"
                  {...register("city")}
                  error={errors.city?.message}
                />
                <Input
                  label="Quận / Huyện"
                  placeholder="Cầu Giấy"
                  {...register("district")}
                  error={errors.district?.message}
                />
                <Input
                  label="Phường / Xã"
                  placeholder="Dịch Vọng"
                  {...register("ward")}
                  error={errors.ward?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Giấy phép kinh doanh (Số)"
                  placeholder="010xxxxxx"
                  {...register("business_license")}
                  error={errors.business_license?.message}
                />

                <Input
                  label="Mã số thuế"
                  placeholder="MST..."
                  {...register("tax_code")}
                  error={errors.tax_code?.message}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 h-12 w-full rounded-full bg-emerald-500 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi hồ sơ...
                  </span>
                ) : (
                  "Gửi đăng ký Seller"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================
   INPUT COMPONENTS (ĐÃ SỬA: Thêm forwardRef)
========================= */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// 👇 Đã thêm forwardRef để react-hook-form hoạt động
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="text-xs font-semibold text-slate-700 ml-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          ref={ref} // 👈 Gắn ref vào input
          {...props}
          className={`mt-1.5 h-11 w-full rounded-xl border bg-[#F7F9FC] px-4 text-sm text-slate-700 outline-none transition-all
            ${error 
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
              : "border-slate-200 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            }`}
        />
        {error && <p className="mt-1 ml-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// 👇 Đã thêm forwardRef cho Textarea
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="text-xs font-semibold text-slate-700 ml-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={ref} // 👈 Gắn ref vào textarea
          {...props}
          rows={3}
          className={`mt-1.5 w-full resize-none rounded-2xl border bg-[#F7F9FC] px-4 py-3 text-sm text-slate-700 outline-none transition-all
            ${error 
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
              : "border-slate-200 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            }`}
        />
        {error && <p className="mt-1 ml-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";