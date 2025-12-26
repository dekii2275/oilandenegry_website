// app/security/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/home/Footer";

export default function SecurityPage() {
  const { user } = useAuth();
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    try {
      // API: Thay đổi mật khẩu
      // POST /api/users/change-password
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Đổi mật khẩu thành công!");
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Bảo mật tài khoản</h1>
        {/* Form thay đổi mật khẩu */}
      </div>
      <Footer />
    </div>
  );
}
