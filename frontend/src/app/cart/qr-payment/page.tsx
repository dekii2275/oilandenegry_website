import { Suspense } from "react";
import QrPaymentClient from "./QrPaymentClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center">Đang tải trang thanh toán QR...</div>
      }
    >
      <QrPaymentClient />
    </Suspense>
  );
}
