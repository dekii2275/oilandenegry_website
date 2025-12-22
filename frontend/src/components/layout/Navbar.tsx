// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/news", label: "Tin tức" },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8 ml-20">
      {" "}
      {/* Thêm ml-20 (5cm) */}
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`transition ${
              isActive
                ? "text-green-600 font-semibold border-b-2 border-green-600 pb-1"
                : "text-gray-700 hover:text-green-600"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
