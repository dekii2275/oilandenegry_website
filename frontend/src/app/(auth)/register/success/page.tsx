'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 1. Tách logic chính ra một component con
function RegisterSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email');

  useEffect(() => {
    // Tự động chuyển về trang chủ sau 1.5 giây
    const t = setTimeout(() => {
      router.replace('/');
    }, 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold text-green-600">Đăng ký thành công!</h1>
      {email && <p className="text-gray-600">Xin chào, {email}</p>}
      <p className="text-sm text-gray-500 animate-pulse">Đang chuyển về trang chủ...</p>
    </div>
  );
}

// 2. Component chính bọc Suspense để fix lỗi build
export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <RegisterSuccessContent />
    </Suspense>
  );
}