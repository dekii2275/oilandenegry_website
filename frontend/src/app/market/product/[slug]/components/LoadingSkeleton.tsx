// frontend/src/app/market/product/[slug]/components/LoadingSkeleton.tsx

import { ChevronRight } from "lucide-react";

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8 animate-pulse">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <ChevronRight size={12} className="text-gray-300" />
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <ChevronRight size={12} className="text-gray-300" />
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="ml-auto space-y-3">
                <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="h-6 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
            <div className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="lg:col-span-4 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
