'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email')

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/')  // về trang chủ
    }, 1500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div>
      <h1>Đăng ký thành công</h1>
      {email && <p>{email}</p>}
      <p>Đang chuyển về trang chủ...</p>
    </div>
  );
}
