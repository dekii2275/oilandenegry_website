"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/* =======================
   MENU DATA (SVG LẶP RIÊNG)
   ======================= */

const mainMenu = [
  {
    label: "Tổng quan",
    href: "/seller",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 11.5V5.5H21V11.5H13ZM3 15.5V5.5H11V15.5H3ZM13 23.5V13.5H21V23.5H13ZM3 23.5V17.5H11V23.5H3ZM5 13.5H9V7.5H5V13.5ZM15 21.5H19V15.5H15V21.5ZM15 9.5H19V7.5H15V9.5ZM5 21.5H9V19.5H5V21.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Đơn hàng",
    href: "/seller/orders",
    icon: (
      <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 24.5C6.45 24.5 5.97917 24.3042 5.5875 23.9125C5.19583 23.5208 5 23.05 5 22.5C5 21.95 5.19583 21.4792 5.5875 21.0875C5.97917 20.6958 6.45 20.5 7 20.5C7.55 20.5 8.02083 20.6958 8.4125 21.0875C8.80417 21.4792 9 21.95 9 22.5C9 23.05 8.80417 23.5208 8.4125 23.9125C8.02083 24.3042 7.55 24.5 7 24.5ZM17 24.5C16.45 24.5 15.9792 24.3042 15.5875 23.9125C15.1958 23.5208 15 23.05 15 22.5C15 21.95 15.1958 21.4792 15.5875 21.0875C15.9792 20.6958 16.45 20.5 17 20.5C17.55 20.5 18.0208 20.6958 18.4125 21.0875C18.8042 21.4792 19 21.95 19 22.5C19 23.05 18.8042 23.5208 18.4125 23.9125C18.0208 24.3042 17.55 24.5 17 24.5ZM6.15 8.5L8.55 13.5H15.55L18.3 8.5H6.15ZM5.2 6.5H19.95C20.3333 6.5 20.625 6.67083 20.825 7.0125C21.025 7.35417 21.0333 7.7 20.85 8.05L17.3 14.45C17.1167 14.7833 16.8708 15.0417 16.5625 15.225C16.2542 15.4083 15.9167 15.5 15.55 15.5H8.1L7 17.5H19V19.5H7C6.25 19.5 5.68333 19.1708 5.3 18.5125C4.91667 17.8542 4.9 17.2 5.25 16.55L6.6 14.1L3 6.5H1V4.5H4.25L5.2 6.5Z" fill="#4B5563"/>
</svg>

    ),
  },
  {
    label: "Sản phẩm",
    href: "/seller/products",
    icon: (
      <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 24.5C4.45 24.5 3.97917 24.3042 3.5875 23.9125C3.19583 23.5208 3 23.05 3 22.5V11.225C2.7 11.0417 2.45833 10.8042 2.275 10.5125C2.09167 10.2208 2 9.88333 2 9.5V6.5C2 5.95 2.19583 5.47917 2.5875 5.0875C2.97917 4.69583 3.45 4.5 4 4.5H20C20.55 4.5 21.0208 4.69583 21.4125 5.0875C21.8042 5.47917 22 5.95 22 6.5V9.5C22 9.88333 21.9083 10.2208 21.725 10.5125C21.5417 10.8042 21.3 11.0417 21 11.225V22.5C21 23.05 20.8042 23.5208 20.4125 23.9125C20.0208 24.3042 19.55 24.5 19 24.5H5ZM5 11.5V22.5H19V11.5H5ZM4 9.5H20V6.5H4V9.5ZM9 16.5H15V14.5H9V16.5Z" fill="#4B5563"/>
</svg>


    ),
  },
  {
    label: "Tin nhắn",
    href: "/seller/messages",
    icon: (
      <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 24.5V6.5C2 5.95 2.19583 5.47917 2.5875 5.0875C2.97917 4.69583 3.45 4.5 4 4.5H20C20.55 4.5 21.0208 4.69583 21.4125 5.0875C21.8042 5.47917 22 5.95 22 6.5V18.5C22 19.05 21.8042 19.5208 21.4125 19.9125C21.0208 20.3042 20.55 20.5 20 20.5H6L2 24.5ZM5.15 18.5H20V6.5H4V19.625L5.15 18.5Z" fill="#4B5563"/>
</svg>

    ),
  },
];

const financeMenu = [
  {
    label: "Ví tiền & Rút tiền",
    href: "/seller/wallet",
    icon: (
      <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 24.5V6.5C2 5.95 2.19583 5.47917 2.5875 5.0875C2.97917 4.69583 3.45 4.5 4 4.5H20C20.55 4.5 21.0208 4.69583 21.4125 5.0875C21.8042 5.47917 22 5.95 22 6.5V18.5C22 19.05 21.8042 19.5208 21.4125 19.9125C21.0208 20.3042 20.55 20.5 20 20.5H6L2 24.5ZM5.15 18.5H20V6.5H4V19.625L5.15 18.5Z" fill="#4B5563"/>
</svg>

    ),
  },
  {
    label: "Phân tích doanh thu",
    href: "/seller/analytics",
    icon: (
      <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 24.5V6.5C2 5.95 2.19583 5.47917 2.5875 5.0875C2.97917 4.69583 3.45 4.5 4 4.5H20C20.55 4.5 21.0208 4.69583 21.4125 5.0875C21.8042 5.47917 22 5.95 22 6.5V18.5C22 19.05 21.8042 19.5208 21.4125 19.9125C21.0208 20.3042 20.55 20.5 20 20.5H6L2 24.5ZM5.15 18.5H20V6.5H4V19.625L5.15 18.5Z" fill="#4B5563"/>
</svg>

    ),
  },
];

/* =======================
   COMPONENT
   ======================= */

export default function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-white border-r min-h-full px-4 py-5">
      {/* ===== LOGO ===== */}
      <Link href="/seller" className="flex items-center gap-3 mb-8 px-2">
        <Image
          src="/assets/images/logo.png"
          alt="Z-Energy Logo"
          width={36}
          height={36}
          priority
        />
        <div>
          <p className="font-semibold text-sm">Z-ENERGY</p>
          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Seller
          </span>
        </div>
      </Link>

      {/* ===== QUẢN LÝ BÁN HÀNG ===== */}
      <SidebarSection title="Quản lý bán hàng">
        {mainMenu.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </SidebarSection>

      {/* ===== TÀI CHÍNH ===== */}
      <SidebarSection title="Tài chính & Báo cáo">
        {financeMenu.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </SidebarSection>
    </aside>
  );
}

/* =======================
   SUB COMPONENTS
   ======================= */

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs text-gray-400 uppercase mb-2 px-2">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
        active
          ? "bg-green-100 text-green-700 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
