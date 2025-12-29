// frontend/src/app/profile/PersonalInfo.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Edit3, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import InfoDisplay from "./components/PersonalInfo/InfoDisplay";
import EditInfoModal from "./components/PersonalInfo/EditInfoModal";
import ModalInput from "./components/PersonalInfo/ModalInput";

interface UserProfile {
  full_name: string;
  email: string;
  phone_number: string;
  birthday: string;
  addresses: string[];
}

interface EditForm {
  full_name: string;
  email: string;
  phone_number: string;
  birthday: string;
}

const MOCK_USER_DATA: UserProfile = {
  full_name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone_number: "0912 345 678",
  birthday: "01/01/1995",
  addresses: [
    "123 Đường ABC, Quận 1, TP.HCM",
    "456 Đường XYZ, Quận 7, TP.HCM",
    "Chưa cập nhật",
  ],
};

export default function PersonalInfo() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState<UserProfile>(() => {
    if (user) {
      return {
        full_name: user.name || MOCK_USER_DATA.full_name,
        email: user.email || MOCK_USER_DATA.email,
        phone_number: MOCK_USER_DATA.phone_number,
        birthday: MOCK_USER_DATA.birthday,
        addresses: MOCK_USER_DATA.addresses,
      };
    }
    return MOCK_USER_DATA;
  });

  const [editForm, setEditForm] = useState<EditForm>({
    full_name: profileData.full_name,
    email: profileData.email,
    phone_number: profileData.phone_number,
    birthday: profileData.birthday,
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        full_name: user.name || prev.full_name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === "http://localhost:8000") {
      setUseMockData(true);
    }
  }, []);

  const handleSaveInfo = async () => {
    try {
      if (useMockData) {
        setProfileData((prev) => ({
          ...prev,
          ...editForm,
        }));

        if (user) {
          updateUser({
            name: editForm.full_name,
            email: editForm.email,
          });
        }

        setIsInfoModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      // API call would go here
    } catch (err: any) {
      alert(err.message || "Cập nhật thất bại");
      console.error("Lỗi update profile:", err);
    }
  };

  const handleSaveAddress = async (index: number, newAddress?: string) => {
    try {
      if (!newAddress) {
        newAddress = prompt("Nhập địa chỉ mới:") || "";
        if (!newAddress) return;
      }

      if (useMockData || !process.env.NEXT_PUBLIC_API_URL) {
        const newAddresses = [...profileData.addresses];
        newAddresses[index] = newAddress;
        setProfileData((prev) => ({ ...prev, addresses: newAddresses }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      // API call would go here
    } catch (err: any) {
      alert(err.message || "Cập nhật thất bại");
      console.error("Lỗi update address:", err);
    }
  };

  const handleAddAddress = () => {
    const newAddress = prompt("Nhập địa chỉ mới:");
    if (newAddress) {
      const newAddresses = [...profileData.addresses, newAddress];
      setProfileData((prev) => ({ ...prev, addresses: newAddresses }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDeleteAddress = (index: number) => {
    if (index === 0) {
      alert("Không thể xóa địa chỉ chính!");
      return;
    }

    const newAddresses = profileData.addresses.filter((_, i) => i !== index);
    setProfileData((prev) => ({
      ...prev,
      addresses: newAddresses,
    }));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>

      {useMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Đang hiển thị dữ liệu mẫu. Kết nối backend để xem dữ liệu thực.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#EFEDED] rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-lg font-bold">Thông tin cơ bản</h2>
          <button
            onClick={() => {
              setEditForm({
                full_name: profileData.full_name,
                email: profileData.email,
                phone_number: profileData.phone_number,
                birthday: profileData.birthday,
              });
              setIsInfoModalOpen(true);
            }}
            className="flex items-center gap-1 text-sm font-bold bg-[#D9D9D9] px-4 py-1.5 rounded-lg border border-gray-400 hover:bg-gray-300 transition"
          >
            Chỉnh sửa <Edit3 size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoDisplay label="Họ và tên" value={profileData.full_name} />
          <InfoDisplay label="Email" value={profileData.email} />
          <InfoDisplay label="Số điện thoại" value={profileData.phone_number} />
          <InfoDisplay label="Ngày sinh" value={profileData.birthday} />
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
          {profileData.addresses.map((addr, index) => (
            <div key={index} className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-2">
                Địa chỉ {index + 1}
                {index === 0 && (
                  <span className="text-green-600 ml-2">(Mặc định)</span>
                )}
              </label>
              <div className="bg-[#D9D9D9] p-4 rounded-xl flex justify-between items-center border border-gray-400">
                <span className="text-gray-700">{addr || "Chưa cập nhật"}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveAddress(index)}
                    className="text-sm font-bold text-green-600 hover:text-green-700 px-3 py-1 hover:bg-green-50 rounded"
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
                setEditForm((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
            />
            <ModalInput
              label="Ngày sinh"
              value={editForm.birthday}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditForm((prev) => ({ ...prev, birthday: e.target.value }))
              }
              type="date"
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
