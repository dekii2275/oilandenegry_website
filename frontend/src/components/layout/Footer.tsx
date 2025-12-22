"use client";

import Link from "next/link";
import { Globe, AtSign, Share2 } from "lucide-react";

const Footer = () => {
  // Dữ liệu các link
  const platformLinks = [
    { href: "/marketplace", label: "Thị trường" },
    { href: "/suppliers", label: "Nhà cung cấp" },
    { href: "/shipping", label: "Vận chuyển" },
    { href: "/pricing", label: "Bảng giá" },
  ];

  const aboutLinks = [
    { href: "/about", label: "Câu chuyện" },
    { href: "/team", label: "Đội ngũ" },
    { href: "/careers", label: "Tuyển dụng" },
    { href: "/contact", label: "Liên hệ" },
  ];

  //   const resourceLinks = [
  //     { href: "/news", label: "Tin tức" },
  //     { href: "/blog", label: "Blog" },
  //     { href: "/faq", label: "FAQ" },
  //     { href: "/support", label: "Hỗ trợ" },
  //   ];

  const legalLinks = [
    { href: "/terms", label: "Điều khoản sử dụng" },
    { href: "/privacy", label: "Chính sách bảo mật" },
    { href: "/compliance", label: "Tuân thủ" },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Grid 5 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Cột 1: Z-ENERGY */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-green-400 mb-4">
              ⚡ Z-ENERGY
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Kết nối thị trường năng lượng toàn cầu với các giải pháp bền vững
              cho một tương lai tốt đẹp hơn. Nền tảng giao dịch B2B hàng đầu về
              xăng dầu và năng lượng.
            </p>

            {/* Các icon */}
            <div className="flex items-center space-x-4 mt-6">
              <Link
                href="https://z-energy.com"
                target="_blank"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              >
                <Globe className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="mailto:info@z-energy.com"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              >
                <AtSign className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="/share"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              >
                <Share2 className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>

          {/* Cột 2: Nền tảng */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Nền tảng</h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Về chúng tôi */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Về chúng tôi</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Pháp lý */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Pháp lý</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Liên hệ và ngôn ngữ */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              © 2025 Z-energy Inc. Bảo lưu mọi quyền
            </p>
            {/* <div className="mt-2 text-sm text-gray-400">
              <Link
                href="tel:+84123456789"
                className="hover:text-green-400 transition mr-4"
              >
                +84 123 456 789
              </Link>
              <Link
                href="mailto:contact@z-energy.com"
                className="hover:text-green-400 transition"
              >
                contact@z-energy.com
              </Link>
            </div> */}
          </div>
          <div className="flex space-x-6">
            <Link
              href="/vi"
              className="text-gray-400 hover:text-green-400 transition"
            >
              Tiếng Việt
            </Link>
            <Link
              href="/en"
              className="text-gray-400 hover:text-green-400 transition"
            >
              English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
