import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- LẤY COOKIES ---
  // Lưu ý: Tên cookie phải khớp với lúc bạn set ở trang Login
  const adminToken = request.cookies.get('adminToken')?.value;
  
  // Seller và User thường dùng chung tên 'accessToken' nhưng khác 'role'
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value; // Ví dụ: 'SELLER' hoặc 'CUSTOMER'

  // =========================================================
  // 1. KHU VỰC ADMIN (/admin)
  // =========================================================
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname.includes('/admin/login');

    // Nếu đã có token Admin mà cố vào trang login -> Đẩy về Dashboard
    if (isLoginPage && adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Nếu chưa có token Admin mà cố vào các trang quản trị -> Đẩy về Login
    if (!isLoginPage && !adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // =========================================================
  // 2. KHU VỰC SELLER (/seller)
  // =========================================================
  if (pathname.startsWith('/seller')) {
    const isLoginPage = pathname.includes('/seller/login');
    const isSeller = userRole === 'SELLER';

    // Đã đăng nhập là Seller rồi thì không cần vào login nữa
    if (isLoginPage && accessToken && isSeller) {
      return NextResponse.redirect(new URL('/seller', request.url));
    }

    // Chưa đăng nhập hoặc không phải Seller (ví dụ User thường cố vào)
    if (!isLoginPage && (!accessToken || !isSeller)) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
  }

  // =========================================================
  // 3. KHU VỰC USER/CUSTOMER (/profile, /cart, /orders)
  // =========================================================
  // Định nghĩa các route cần bảo vệ của người dùng thường
  const protectedUserRoutes = ['/profile', '/my-orders', '/checkout'];
  
  // Kiểm tra xem user có đang vào route bảo vệ không
  const isProtectedRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Nếu chưa đăng nhập -> Đẩy về trang Login chính (kèm link redirect để quay lại sau khi login xong)
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Tiện ích: Login xong tự quay lại trang này
      return NextResponse.redirect(loginUrl);
    }
  }

  // Cho phép đi tiếp nếu không vi phạm các luật trên
  return NextResponse.next();
}

// Cấu hình Matcher để tối ưu hiệu năng
// Middleware chỉ chạy trên các path khớp với pattern này
export const config = {
  matcher: [
    /*
     * Match tất cả request path ngoại trừ:
     * 1. /api (API routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. favicon.ico (favicon file)
     * 5. public files (images, svgs...)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}