"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit3, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import InfoDisplay from "./components/PersonalInfo/InfoDisplay";
import EditInfoModal from "./components/PersonalInfo/EditInfoModal";
import ModalInput from "./components/PersonalInfo/ModalInput";
import { API_ENDPOINTS } from "@/lib/api";

interface UserProfile {
  full_name: string | null;
  email: string | null;
  phone_number?: string | null;
  // backend /api/users/me hiện trả UserResponse không có addresses,
  // nên tạm giữ UI này như local state (hoặc bạn tự nối thêm API /api/addresses sau)
  addresses?: string[] | null;
}

interface EditForm {
  full_name: string;
  email: string;
  phone_number: string;
}

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  return raw.replace(/\/+$/, "");
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("zenergy_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    null
  );
}

/**
 * Fix lỗi /api/api khi:
 *   baseUrl = https://domain/api
 *   path   = /api/xxx
 */
function buildUrl(baseUrl: string, path: string): string {
  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;

  const base = (baseUrl || "").replace(/\/+$/, "");
  if (!base) return path; // allow relative call if needed

  const p = path.startsWith("/") ? path : `/${path}`;

  // Nếu base kết thúc bằng /api và path bắt đầu bằng /api/... thì bỏ 1 cái /api
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    return `${base}${p.slice(4)}`; // "/api".length = 4 => "/users/me"
  }

  return `${base}${p}`;
}

async function apiFetch<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const url = buildUrl(baseUrl, path);
  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

export default function PersonalInfo() {
  const { user, updateUser } = useAuth();

  const baseUrl = useMemo(() => getBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [profileData, setProfileData] = useState<UserProfile>({
    full_name: null,
    email: null,
    phone_number: null,
    addresses: ["Chưa cập nhật"],
  });

  const [editForm, setEditForm] = useState<EditForm>({
    full_name: "",
    email: "",
    phone_number: "",
  });

  const flashSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  // Sync nhanh name/email từ auth context (nếu có)
  useEffect(() => {
    if (!user) return;
    setProfileData((prev) => ({
      ...prev,
      full_name: user.name ?? prev.full_name,
      email: user.email ?? prev.email,
    }));
  }, [user]);

  // Fetch profile thật từ backend (GET /api/users/me)
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        setHasToken(!!token);

        if (!token) {
          setLoading(false);
          return;
        }

        const data = await apiFetch<any>(baseUrl, API_ENDPOINTS.USERS.PROFILE, { method: "GET" });

        // UserResponse: {id,email,full_name,role,is_verified,is_approved,avatar_url}
        const merged: UserProfile = {
          full_name: data.full_name ?? data.name ?? null,
          email: data.email ?? null,
          phone_number: data.phone_number ?? data.phone ?? null,
          // backend hiện không trả addresses ở users/me -> giữ local
          addresses: profileData.addresses ?? ["Chưa cập nhật"],
        };

        setProfileData(merged);
        setEditForm({
          full_name: merged.full_name ?? "",
          email: merged.email ?? "",
          phone_number: merged.phone_number ?? "",
        });

        // cập nhật auth context để header/avatar dùng được
        if (user) {
          updateUser({
            name: merged.full_name ?? "",
            email: merged.email ?? "",
          });
        }
      } catch (e) {
        console.error("Fetch profile failed:", e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveInfo = async () => {
    try {
      const payload: any = {
        full_name: editForm.full_name || null,
        // Nếu backend KHÔNG cho đổi email, bạn có thể bỏ dòng dưới
        email: editForm.email || null,
        phone_number: editForm.phone_number || null,
      };

      const updated = await apiFetch<any>(baseUrl, API_ENDPOINTS.USERS.PROFILE, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setProfileData((prev) => ({
        ...prev,
        full_name: updated.full_name ?? prev.full_name ?? null,
        email: updated.email ?? prev.email ?? null,
        phone_number: updated.phone_number ?? prev.phone_number ?? null,
      }));

      if (user) {
        updateUser({
          name: updated.full_name ?? editForm.full_name,
          email: updated.email ?? editForm.email,
        });
      }

      setIsInfoModalOpen(false);
      flashSuccess();
    } catch (err: any) {
      if (String(err?.message || "").includes("NO_TOKEN")) {
        alert("Bạn cần đăng nhập lại để cập nhật thông tin.");
        setHasToken(false);
        return;
      }
      alert(err?.message || "Cập nhật thất bại");
      console.error("Update profile failed:", err);
    }
  };

  const handleAddAddress = async () => {
    const addr = prompt("Nhập địa chỉ mới:");
    if (!addr) return;

    // Tạm thời chỉ update local UI (vì users/me không hỗ trợ addresses theo OpenAPI hiện tại)
    setProfileData((prev) => ({
      ...prev,
      addresses: [...(prev.addresses ?? []), addr],
    }));
    flashSuccess();
  };

  const handleSaveAddress = async (index: number, newAddress?: string) => {
    const addr = newAddress ?? (prompt("Nhập địa chỉ mới:") || "");
    if (!addr) return;

    setProfileData((prev) => {
      const next = [...(prev.addresses ?? [])];
      next[index] = addr;
      return { ...prev, addresses: next };
    });
    flashSuccess();
  };

  const handleDeleteAddress = (index: number) => {
    if (index === 0) {
      alert("Không thể xóa địa chỉ chính!");
      return;
    }
    setProfileData((prev) => {
      const next = [...(prev.addresses ?? [])];
      next.splice(index, 1);
      return { ...prev, addresses: next };
    });
    flashSuccess();
  };

  if (loading) {
    return <div className="text-gray-600">Đang tải thông tin...</div>;
  }

  if (!hasToken) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-yellow-700">
          Bạn chưa đăng nhập (không có token). Hãy đăng nhập lại để xem/cập nhật thông tin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>

      <div className="bg-[#EFEDED] rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-lg font-bold">Thông tin cơ bản</h2>
          <button
            onClick={() => {
              setEditForm({
                full_name: profileData.full_name ?? "",
                email: profileData.email ?? "",
                phone_number: profileData.phone_number ?? "",
              });
              setIsInfoModalOpen(true);
            }}
            className="flex items-center gap-1 text-sm font-bold bg-[#D9D9D9] px-4 py-1.5 rounded-lg border border-gray-400 hover:bg-gray-300 transition"
          >
            Chỉnh sửa <Edit3 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoDisplay label="Họ và tên" value={profileData.full_name || "Chưa cập nhật"} />
          <InfoDisplay label="Email" value={profileData.email || "Chưa cập nhật"} />
          <InfoDisplay label="Số điện thoại" value={profileData.phone_number || "Chưa cập nhật"} />
        </div>
      </div>

      <div className="bg-[#EFEDED] rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-lg font-bold">Địa chỉ đặt hàng</h2>
          <button
            onClick={handleAddAddress}
            className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <span className="text-lg">+</span> Thêm địa chỉ
          </button>
        </div>

        <div className="space-y-4">
          {(profileData.addresses ?? ["Chưa cập nhật"]).map((addr, index) => (
            <div key={index} className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-2">
                Địa chỉ {index + 1}
                {index === 0 && <span className="text-green-600 ml-2">(Mặc định)</span>}
              </label>

              <div className="bg-[#D9D9D9] p-4 rounded-xl flex justify-between items-center border border-gray-400">
                <span className="text-gray-700">{addr || "Chưa cập nhật"}</span>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveAddress(index)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded"
                  >
                    Sửa
                  </button>
                  {index > 0 && (
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="text-sm font-bold text-red-600 hover:text-red-700 px-3 py-1 hover:bg-red-50 rounded"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isInfoModalOpen && (
        <EditInfoModal
          title="Cập nhật thông tin"
          onClose={() => setIsInfoModalOpen(false)}
          onSave={handleSaveInfo}
        >
          <div className="space-y-4">
            <ModalInput
              label="Họ và tên"
              value={editForm.full_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
            <ModalInput
              label="Email"
              value={editForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
              type="email"
            />
            <ModalInput
              label="Số điện thoại"
              value={editForm.phone_number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditForm((prev) => ({ ...prev, phone_number: e.target.value }))
              }
            />
          </div>
        </EditInfoModal>
      )}

      {showSuccess && (
        <div className="fixed bottom-10 right-10 flex items-center bg-white border-l-8 border-[#66B16A] shadow-2xl p-6 rounded-lg animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="text-[#66B16A] mr-3" size={24} />
          <h3 className="text-lg font-bold">Cập nhật thông tin thành công !</h3>
        </div>
      )}
    </div>
  );
}
