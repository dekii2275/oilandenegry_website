import SellerHeader from "@/components/layout/SellerHeader";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3FFF7]">
      {/* HEADER */}
      <SellerHeader />

      {/* CONTENT */}
      <main>{children}</main>
    </div>
  );
}
