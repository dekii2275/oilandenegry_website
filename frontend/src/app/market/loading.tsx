export default function MarketLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FDFB]">
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 p-5 rounded-[24px] animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-[400px] bg-gray-100 rounded-[32px] animate-pulse mb-8"></div>
      </div>
    </div>
  );
}
