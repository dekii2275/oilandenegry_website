"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { jwtDecode } from "jwt-decode";

// Định nghĩa cấu trúc Token
interface DecodedToken {
  sub: string;
  id: number;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  exp: number;
}

export default function LoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gửi dữ liệu (Trim khoảng trắng)
      const payload = {
        email: email.trim(),
        password: password.trim()
      };

      const res = await fetch("https://zenergy.cloud/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Email hoặc mật khẩu không chính xác");
      }

      // 2. Lấy Token
      const token = data.access_token;

      if (token) {
        // 3. Giải mã token để lấy ROLE THẬT
        const decoded: DecodedToken = jwtDecode(token);
        const realRole = decoded.role;

        console.log("User Role detected:", realRole);

        // 4. Lưu Cookie
        if (realRole === "ADMIN") {
          Cookies.set("adminToken", token, { expires: 1 });
        } else {
          Cookies.set("accessToken", token, { expires: 7 });
        }
        Cookies.set("userRole", realRole, { expires: 7 });

        toast.success(`Đăng nhập thành công!`);
        localStorage.setItem("access_token", token);


        // 5. Chuyển hướng theo Role
        if (realRole === "ADMIN") {
          router.push("/admin");
        } else if (realRole === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/"); // Customer về trang chủ
        }
        
        router.refresh();
      } else {
         throw new Error("Không nhận được token xác thực.");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Input Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Email đăng nhập</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>

      {/* Input Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Mật khẩu</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end text-xs text-gray-500">
        <a href="#" className="hover:text-green-600 hover:underline">Quên mật khẩu?</a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Đang xử lý...
          </>
        ) : (
          "Đăng nhập hệ thống"
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <button 
          type="button" 
          onClick={() => router.push('/register')} 
          className="text-green-600 font-bold hover:underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </form>
  );
}