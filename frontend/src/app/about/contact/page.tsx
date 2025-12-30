"use client";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F1FFF7] px-4 py-14">
        <div className="mx-auto w-full max-w-[1120px]">
          {/* ===== TOP TITLE ===== */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-1 text-[11px] font-semibold text-emerald-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                HỖ TRỢ 24/7
              </span>
            </div>

            <h1 className="text-[40px] leading-[1.1] font-extrabold text-[#0F172A]">
              Liên hệ với <span className="text-emerald-500">Z-energy</span>
            </h1>

            <p className="mx-auto mt-4 max-w-[720px] text-[13px] leading-6 text-slate-500">
              Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành
              trình năng lượng xanh. Hãy để lại thông tin, đội ngũ chuyên gia của
              chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>

          {/* ===== GRID ===== */}
          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* ===== LEFT: FORM ===== */}
            <div className="rounded-3xl bg-white p-10 shadow-[0_18px_45px_rgba(16,185,129,0.12)]">
              <h2 className="text-[18px] font-bold text-slate-900">
                Gửi tin nhắn cho chúng tôi
              </h2>

              <form
                className="mt-7 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: ghép backend:
                  // - validate
                  // - gọi API POST /contact
                  // - hiện toast + reset form
                }}
              >
                {/* Họ và tên */}
                <div>
                  <label className="text-[12px] font-semibold text-slate-700">
                    Họ và tên
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-full border border-slate-100 bg-[#F7F9FC] px-5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-2 h-11 w-full rounded-full border border-slate-100 bg-[#F7F9FC] px-5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="mt-2 h-11 w-full rounded-full border border-slate-100 bg-[#F7F9FC] px-5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
                      placeholder="0901 234 567"
                    />
                  </div>
                </div>

                {/* Nội dung */}
                <div>
                  <label className="text-[12px] font-semibold text-slate-700">
                    Nội dung tin nhắn
                  </label>
                  <textarea
                    rows={5}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-100 bg-[#F7F9FC] px-5 py-4 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-200 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Nhập nội dung cần hỗ trợ..."
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-full bg-emerald-500 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-600 active:scale-[0.99]"
                >
                  Gửi tin nhắn <span className="ml-1">➤</span>
                </button>
              </form>
            </div>

            {/* ===== RIGHT: INFO + MAP ===== */}
            <div className="space-y-6">
              {/* Địa chỉ */}
              <InfoCard
                icon={<IconLocation />}
                title="Địa chỉ"
                subtitle="Tầng 12, Tòa nhà Z-Tower, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam"
              />

              {/* Số điện thoại */}
              <InfoCard
                icon={<IconPhone />}
                title="Số điện thoại"
                subtitle={
                  <>
                    (+84) 28 1234 5678
                    <div className="mt-1 text-[11px] text-slate-400">
                      Thứ 2 - Thứ 6: 8:00 - 17:30
                    </div>
                  </>
                }
              />

              {/* Email */}
              <InfoCard
                icon={<IconEmail />}
                title="Email hỗ trợ"
                subtitle={
                  <>
                    <div className="inline-flex items-center gap-2 text-emerald-600">
                      {/* SVG nhỏ bạn gửi */}
                      <SmallMail />
                      <span className="text-[13px] font-medium">
                        hotro@z-energy.com
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Phản hồi trong vòng 24h
                    </div>
                  </>
                }
              />

              {/* MAP */}
              <div className="h-[280px] overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_rgba(16,185,129,0.12)]">
                <iframe
                  title="Z-energy Map"
                  src="https://www.google.com/maps?q=Nguyen%20Hue%20Quan%201&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function InfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white px-6 py-5 shadow-[0_18px_45px_rgba(16,185,129,0.12)]">
      <div className="shrink-0">{icon}</div>
      <div className="pt-1">
        <div className="text-[13px] font-bold text-slate-900">{title}</div>
        <div className="mt-1 text-[12px] leading-5 text-slate-500">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/* ===== SVG (y hệt bạn gửi) ===== */
function SmallMail() {
  return (
    <svg
      width="14"
      height="17"
      viewBox="0 0 14 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.33366 13.1665C2.01283 13.1665 1.73817 13.0523 1.5097 12.8238C1.28123 12.5953 1.16699 12.3207 1.16699 11.9998V4.99984C1.16699 4.679 1.28123 4.40435 1.5097 4.17588C1.73817 3.94741 2.01283 3.83317 2.33366 3.83317H11.667C11.9878 3.83317 12.2625 3.94741 12.491 4.17588C12.7194 4.40435 12.8337 4.679 12.8337 4.99984V11.9998C12.8337 12.3207 12.7194 12.5953 12.491 12.8238C12.2625 13.0523 11.9878 13.1665 11.667 13.1665H2.33366ZM7.00033 9.08317L2.33366 6.1665V11.9998H11.667V6.1665L7.00033 9.08317ZM7.00033 7.9165L11.667 4.99984H2.33366L7.00033 7.9165Z"
        fill="#10B981"
      />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="24" fill="#EFF6FF" />
      <path
        d="M24 24C24.55 24 25.0208 23.8042 25.4125 23.4125C25.8042 23.0208 26 22.55 26 22C26 21.45 25.8042 20.9792 25.4125 20.5875C25.0208 20.1958 24.55 20 24 20C23.45 20 22.9792 20.1958 22.5875 20.5875C22.1958 20.9792 22 21.45 22 22C22 22.55 22.1958 23.0208 22.5875 23.4125C22.9792 23.8042 23.45 24 24 24ZM24 31.35C26.0333 29.4833 27.5417 27.7875 28.525 26.2625C29.5083 24.7375 30 23.3833 30 22.2C30 20.3833 29.4208 18.8958 28.2625 17.7375C27.1042 16.5792 25.6833 16 24 16C22.3167 16 20.8958 16.5792 19.7375 17.7375C18.5792 18.8958 18 20.3833 18 22.2C18 23.3833 18.4917 24.7375 19.475 26.2625C20.4583 27.7875 21.9667 29.4833 24 31.35ZM24 34C21.3167 31.7167 19.3125 29.5958 17.9875 27.6375C16.6625 25.6792 16 23.8667 16 22.2C16 19.7 16.8042 17.7083 18.4125 16.225C20.0208 14.7417 21.8833 14 24 14C26.1167 14 27.9792 14.7417 29.5875 16.225C31.1958 17.7083 32 19.7 32 22.2C32 23.8667 31.3375 25.6792 30.0125 27.6375C28.6875 29.5958 26.6833 31.7167 24 34Z"
        fill="#2563EB"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="24" fill="#10B981" fillOpacity="0.1" />
      <path
        d="M31.95 33C29.8667 33 27.8083 32.5458 25.775 31.6375C23.7417 30.7292 21.8917 29.4417 20.225 27.775C18.5583 26.1083 17.2708 24.2583 16.3625 22.225C15.4542 20.1917 15 18.1333 15 16.05C15 15.75 15.1 15.5 15.3 15.3C15.5 15.1 15.75 15 16.05 15H20.1C20.3333 15 20.5417 15.0792 20.725 15.2375C20.9083 15.3958 21.0167 15.5833 21.05 15.8L21.7 19.3C21.7333 19.5667 21.725 19.7917 21.675 19.975C21.625 20.1583 21.5333 20.3167 21.4 20.45L18.975 22.9C19.3083 23.5167 19.7042 24.1125 20.1625 24.6875C20.6208 25.2625 21.125 25.8167 21.675 26.35C22.1917 26.8667 22.7333 27.3458 23.3 27.7875C23.8667 28.2292 24.4667 28.6333 25.1 29L27.45 26.65C27.6 26.5 27.7958 26.3875 28.0375 26.3125C28.2792 26.2375 28.5167 26.2167 28.75 26.25L32.2 26.95C32.4333 27.0167 32.625 27.1375 32.775 27.3125C32.925 27.4875 33 27.6833 33 27.9V31.95C33 32.25 32.9 32.5 32.7 32.7C32.5 32.9 32.25 33 31.95 33ZM18.025 21L19.675 19.35L19.25 17H17.025C17.1083 17.6833 17.225 18.3583 17.375 19.025C17.525 19.6917 17.7417 20.35 18.025 21ZM26.975 29.95C27.625 30.2333 28.2875 30.4583 28.9625 30.625C29.6375 30.7917 30.3167 30.9 31 30.95V28.75L28.65 28.275L26.975 29.95Z"
        fill="#10B981"
      />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="24" fill="#FFF7ED" />
      <path
        d="M16 32C15.45 32 14.9792 31.8042 14.5875 31.4125C14.1958 31.0208 14 30.55 14 30V18C14 17.45 14.1958 16.9792 14.5875 16.5875C14.9792 16.1958 15.45 16 16 16H32C32.55 16 33.0208 16.1958 33.4125 16.5875C33.8042 16.9792 34 17.45 34 18V30C34 30.55 33.8042 31.0208 33.4125 31.4125C33.0208 31.8042 32.55 32 32 32H16ZM24 25L16 20V30H32V20L24 25ZM24 23L32 18H16L24 23Z"
        fill="#F97316"
      />
    </svg>
  );
}
