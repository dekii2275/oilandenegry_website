import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- LẤY COOKIES ---
  const adminToken = request.cookies.get('adminToken')?.value;
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value; // 'SELLER' hoặc 'CUSTOMER'

  // =========================================================
  // 1. KHU VỰC ADMIN (/admin) - Giữ nguyên logic cũ của bạn
  // =========================================================
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname.includes('/admin/login');
    if (isLoginPage && adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!isLoginPage && !adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // =========================================================
  // 2. KHU VỰC SELLER (/seller) - ĐÃ SỬA
  // =========================================================
  if (pathname.startsWith('/seller')) {
    // Không dùng /seller/login nữa, chuyển về /login chính
    const isSeller = userRole === 'SELLER';

    // Nếu chưa đăng nhập hoặc không phải Seller -> Đẩy về trang /login chung
    if (!accessToken || !isSeller) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); 
      return NextResponse.redirect(loginUrl);
    }
    
    // Nếu là Seller mà đang ở trang chủ /seller (không có / đằng sau) 
    // thì cho vào /seller/dashboard nếu bạn có trang đó
    // if (pathname === '/seller') {
    //   return NextResponse.redirect(new URL('/seller/dashboard', request.url));
    // }
  }

  // =========================================================
  // 3. KHU VỰC USER/CUSTOMER (/profile, /cart, /orders)
  // =========================================================
  const protectedUserRoutes = ['/profile', '/my-orders', '/checkout'];
  const isProtectedRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}