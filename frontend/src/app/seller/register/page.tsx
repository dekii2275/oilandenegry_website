"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* =========================
   BACKEND SCHEMA (MATCH 100%)
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

  /* =========================
     SUBMIT
  ========================= */
  const onSubmit = async (data: SellerForm) => {
    try {
      // TODO: axiosClient.post("/seller/register", data)
      console.log("📦 Payload gửi backend:", data);

      alert("Gửi đăng ký thành công!");
      reset();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <main className="min-h-screen bg-[#F1FFF7] px-4 py-14">
      <div className="mx-auto w-full max-w-[900px]">
        {/* ===== TITLE ===== */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-1 text-[11px] font-semibold text-emerald-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ĐỐI TÁC KINH DOANH
            </span>
          </div>

          <h1 className="text-[38px] font-extrabold text-slate-900">
            Đăng ký trở thành{" "}
            <span className="text-emerald-500">Seller Z-energy</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[640px] text-[13px] leading-6 text-slate-500">
            Điền thông tin cửa hàng để trở thành đối tác kinh doanh chính thức
            trong hệ sinh thái Z-energy.
          </p>
        </div>

        {/* ===== FORM CARD ===== */}
        <div className="mt-12 rounded-3xl bg-white p-10 shadow-[0_18px_45px_rgba(16,185,129,0.12)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Tên cửa hàng / Doanh nghiệp"
              {...register("store_name")}
              error={errors.store_name?.message}
            />

            <Textarea
              label="Mô tả cửa hàng"
              {...register("store_description")}
              error={errors.store_description?.message}
            />

            <Input
              label="Số điện thoại"
              {...register("phone_number")}
              error={errors.phone_number?.message}
            />

            <Input
              label="Địa chỉ chi tiết"
              {...register("address")}
              error={errors.address?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Tỉnh / Thành phố"
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                label="Quận / Huyện"
                {...register("district")}
                error={errors.district?.message}
              />
              <Input
                label="Phường / Xã"
                {...register("ward")}
                error={errors.ward?.message}
              />
            </div>

            <Input
              label="Giấy phép kinh doanh"
              {...register("business_license")}
              error={errors.business_license?.message}
            />

            <Input
              label="Mã số thuế"
              {...register("tax_code")}
              error={errors.tax_code?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 h-12 w-full rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đăng ký Seller"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

/* =========================
   INPUT COMPONENTS
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
      <label className="text-[12px] font-semibold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 h-11 w-full rounded-full border border-slate-100 bg-[#F7F9FC] px-5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Textarea({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        {...props}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-slate-100 bg-[#F7F9FC] px-5 py-4 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
