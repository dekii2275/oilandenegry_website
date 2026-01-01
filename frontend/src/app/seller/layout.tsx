import React from "react";
// 👇 SỬA LẠI ĐƯỜNG DẪN NÀY CHO ĐÚNG THƯ MỤC
import SellerHeader from "@/components/seller/SellerHeader"; 
import SellerSidebar from "@/components/seller/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3FFF7] flex flex-col">
      {/* ===== HEADER (Nằm ngang trên cùng) ===== */}
      <SellerHeader />

      {/* ===== BODY (Phần dưới Header) ===== */}
      <div className="flex flex-1 items-stretch">
        {/* SIDEBAR (Cột trái) */}
        {/* shrink-0 để đảm bảo sidebar không bị co lại khi nội dung bên phải quá rộng */}
        <div className="shrink-0">
            <SellerSidebar />
        </div>

        {/* CONTENT (Cột phải - Nội dung thay đổi) */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}