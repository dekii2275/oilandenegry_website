"use client";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import MarketHeader from "./components/MarketHeader";
import MarketStats from "./components/MarketStats";
import MarketChart from "./components/MarketChart";
import MarketAnalysis from "./components/MarketAnalysis";
import MarketNews from "./components/MarketNews";
import MarketTable from "./components/MarketTable";

export default function MarketPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FDFB]">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <MarketHeader />
        <MarketStats />

        {/* Middle Section: Chart & Analysis & News */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Chart Area */}
          <div className="lg:col-span-8">
            <MarketChart />
          </div>

          {/* Analysis & News Column */}
          <div className="lg:col-span-4 space-y-6">
            <MarketAnalysis />
            <MarketNews />
          </div>
        </div>

        {/* Detailed Price Table */}
        <MarketTable />
      </main>

      <Footer />
    </div>
  );
}
