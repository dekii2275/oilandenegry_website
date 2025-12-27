import SellerHeader from "@/components/layout/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3FFF7] flex flex-col">
      {/* ===== HEADER ===== */}
      <SellerHeader />

      {/* ===== BODY ===== */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <SellerSidebar />

        {/* CONTENT */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
