"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifiedSuppliers() {
  const [index, setIndex] = useState(0);

  const suppliers = [
    { id: 1, name: "Apex Energy", rating: 4.9, reviews: 120 },
    { id: 2, name: "SolarWorld", rating: 4.8, reviews: 85 },
    { id: 3, name: "PetroChem", rating: 4.7, reviews: 210 },
    { id: 4, name: "Eco Transport", rating: 4.9, reviews: 56 },
    { id: 5, name: "Global Gas", rating: 4.6, reviews: 92 },
  ];

  const visible = suppliers.slice(index, index + 5);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev + 5 < suppliers.length ? prev + 1 : prev));
  };

  const getSupplierSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Nhà cung cấp đã xác minh
          </h2>

          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-gray-300 hover:border-emerald-600 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-gray-300 hover:border-emerald-600 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition"
            >
              ›
            </button>
          </div>
        </div>

        {/* Suppliers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {visible.map((s) => (
            <Link
              key={s.id}
              href={`/suppliers/${getSupplierSlug(s.name)}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              {/* LOGO SLOT */}
              <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                {/* gắn logo <img /> hoặc SVG vào đây */}
              </div>

              <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-green-600 transition-colors">
                {s.name}
              </h3>

              <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{s.rating}</span>
                <span className="text-gray-400">({s.reviews})</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
