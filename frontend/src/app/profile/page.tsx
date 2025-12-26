// frontend/src/app/profile/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/home/Footer";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

import MyOrders from "./MyOrders";
import PersonalInfo from "./PersonalInfo";
import PaymentSettings from "./PaymentSettings";
import SecuritySettings from "./SecuritySettings";
import ProfileSidebar from "./components/ProfileSidebar";

// Trong page.tsx
type Tab = "info" | "orders" | "payment" | "security";

function ProfileContent() {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab && ["info", "orders", "payment", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
        <ProfileSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
        />
        <section className="flex-1">
          {activeTab === "info" && <PersonalInfo />}
          {activeTab === "orders" && <MyOrders />}
          {activeTab === "payment" && <PaymentSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải trang cá nhân...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
