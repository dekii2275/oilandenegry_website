"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/news", label: "Tin tức" },
  ];

  // Hàm kiểm tra mục nào đang active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-green-600">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-gray-900"
          >
            <img
              src="/assets/images/logo.png"
              alt="Z-ENERGY Logo"
              className="w-17 h-16 object-contain"
            />
            <span className="text-green-700">Z-ENERGY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center text-sm">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    transition font-medium relative
                    ${
                      active
                        ? "text-green-600 font-bold"
                        : "text-gray-700 hover:text-teal-600"
                    }
                  `}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-green-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6 text-sm font-medium">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className={`
                    transition
                    ${
                      pathname === "/login"
                        ? "text-green-600 font-bold"
                        : "text-gray-700 hover:text-teal-600"
                    }
                  `}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className={`
                    transition
                    ${
                      pathname === "/register"
                        ? "text-green-600 font-bold"
                        : "text-gray-700 hover:text-teal-600"
                    }
                  `}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <div className="relative group">
                <button
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${
                    pathname.startsWith("/profile")
                      ? "bg-green-100 ring-2 ring-green-300"
                      : ""
                  }
                `}
                >
                  <span className="text-lg">👤</span>
                </button>

                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <Link
                    href="/profile"
                    className={`
                      block px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md
                      ${
                        pathname === "/profile"
                          ? "text-green-600 bg-green-50 font-medium"
                          : ""
                      }
                    `}
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 rounded-b-md"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3 border-t pt-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    py-2 px-4 rounded transition
                    ${
                      active
                        ? "text-green-600 bg-green-50 font-bold"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className={`
                    py-2 px-4 rounded transition
                    ${
                      pathname === "/login"
                        ? "text-green-600 bg-green-50 font-bold"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className={`
                    py-2 px-4 rounded transition
                    ${
                      pathname === "/register"
                        ? "text-green-600 bg-green-50 font-bold"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className={`
                    py-2 px-4 rounded transition
                    ${
                      pathname === "/profile"
                        ? "text-green-600 bg-green-50 font-bold"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-red-600 hover:text-red-700 py-2 px-4 rounded hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
