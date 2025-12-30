// frontend/src/app/market/product/[slug]/components/NotFoundState.tsx

import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function NotFoundState() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Package className="text-gray-400" size={48} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Sản phẩm không tồn tại
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Sản phẩm bạn đang tìm kiếm không có trong hệ thống hoặc đã bị xóa.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/market"
          className="px-6 py-3 bg-[#71C291] text-white font-bold rounded-xl hover:bg-[#5da97b] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Quay lại thị trường
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
