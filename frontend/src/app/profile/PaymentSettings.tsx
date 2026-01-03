// frontend/src/app/profile/PaymentSettings.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  XCircle,
  Wallet,
  Shield,
  AlertCircle,
} from "lucide-react";
import { PaymentMethod, Wallet as WalletType } from "./types";
import { MOCK_PAYMENT_METHODS, MOCK_WALLETS } from "./constants/mockData";
import CreditCardItem from "./components/Payment/CreditCardItem";
import WalletItem from "./components/Payment/WalletItem";
import AddCardModal from "./components/Payment/AddCardModal";
import ConfirmModal from "./components/Payment/ConfirmModal";

export default function PaymentSettings() {
  const [cards, setCards] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [wallets, setWallets] = useState<WalletType[]>(MOCK_WALLETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<
    string | null
  >(null);
  const [addingCard, setAddingCard] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "wallets">("cards");

  const [newCardForm, setNewCardForm] = useState({
    card_number: "",
    expiry_date: "",
    cvv: "",
    card_holder_name: "",
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === "http://localhost:8000") {
      setUseMockData(true);
    }
  }, []);

  const handleDeleteCard = async (cardId: string) => {
    setShowDeleteConfirm(cardId);
  };

  const confirmDeleteCard = async (cardId: string) => {
    try {
      const cardToDelete = cards.find((card) => card.id === cardId);
      if (cardToDelete?.is_default) {
        alert(
          "Không thể xóa thẻ mặc định. Vui lòng đặt thẻ khác làm mặc định trước khi xóa."
        );
        setShowDeleteConfirm(null);
        return;
      }

      if (useMockData) {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
        alert("Đã xóa thẻ thành công (Mock Data)");
      }
    } catch (err: any) {
      alert(err.message || "Xóa thẻ thất bại");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleDisconnectCard = async (cardId: string) => {
    setShowDisconnectConfirm(cardId);
  };

  const confirmDisconnectCard = async (cardId: string) => {
    try {
      const cardToDisconnect = cards.find((card) => card.id === cardId);
      if (cardToDisconnect?.is_default) {
        alert(
          "Không thể hủy liên kết thẻ mặc định. Vui lòng đặt thẻ khác làm mặc định trước."
        );
        setShowDisconnectConfirm(null);
        return;
      }

      if (useMockData) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId ? { ...card, is_active: false } : card
          )
        );
        alert("Đã hủy liên kết thẻ thành công (Mock Data)");
      }
    } catch (err: any) {
      alert(err.message || "Hủy liên kết thẻ thất bại");
    } finally {
      setShowDisconnectConfirm(null);
    }
  };

  const handleReconnectCard = async (cardId: string) => {
    try {
      if (useMockData) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId ? { ...card, is_active: true } : card
          )
        );
        alert("Đã kích hoạt lại thẻ thành công (Mock Data)");
      }
    } catch (err: any) {
      alert(err.message || "Kích hoạt lại thẻ thất bại");
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      const cardToSetDefault = cards.find((card) => card.id === cardId);
      if (!cardToSetDefault?.is_active) {
        alert(
          "Không thể đặt thẻ đã hủy liên kết làm mặc định. Vui lòng kích hoạt lại thẻ trước."
        );
        return;
      }

      if (useMockData) {
        setCards((prev) =>
          prev.map((card) => ({
            ...card,
            is_default: card.id === cardId && card.is_active,
          }))
        );
        alert("Đã đặt thẻ mặc định (Mock Data)");
      }
    } catch (err: any) {
      alert(err.message || "Đặt mặc định thất bại");
    }
  };

  const handleConnectWallet = async (walletType: string) => {
    try {
      if (useMockData) {
        setWallets((prev) =>
          prev.map((wallet) =>
            wallet.type === walletType
              ? {
                  ...wallet,
                  is_linked: true,
                  phone_number: "0912***999",
                  linked_at: new Date().toISOString().split("T")[0],
                  balance: 1000000,
                }
              : wallet
          )
        );
        alert(`Đã kết nối ví ${walletType} (Mock Data)`);
      }
    } catch (err: any) {
      alert(err.message || "Kết nối ví thất bại");
    }
  };

  const handleDisconnectWallet = async (walletType: string) => {
    if (!confirm(`Bạn có chắc muốn hủy liên kết ví ${walletType}?`)) return;
    try {
      if (useMockData) {
        setWallets((prev) =>
          prev.map((wallet) =>
            wallet.type === walletType
              ? {
                  ...wallet,
                  is_linked: false,
                  phone_number: "Chưa kết nối",
                  balance: undefined,
                }
              : wallet
          )
        );
        alert(`Đã hủy liên kết ví ${walletType} (Mock Data)`);
      }
    } catch (err: any) {
      alert(err.message || "Hủy liên kết ví thất bại");
    }
  };

  const handleAddCard = async () => {
    if (
      !newCardForm.card_number ||
      !newCardForm.expiry_date ||
      !newCardForm.cvv ||
      !newCardForm.card_holder_name
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const cardNumber = newCardForm.card_number.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cardNumber)) {
      alert("Số thẻ phải có 16 chữ số");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(newCardForm.expiry_date)) {
      alert("Định dạng ngày hết hạn không đúng (MM/YY)");
      return;
    }

    if (!/^\d{3,4}$/.test(newCardForm.cvv)) {
      alert("CVV phải có 3-4 chữ số");
      return;
    }

    setAddingCard(true);
    try {
      if (useMockData) {
        const newCard: PaymentMethod = {
          id: `card_${Date.now()}`,
          type: newCardForm.card_number.startsWith("4") ? "visa" : "mastercard",
          last_four: cardNumber.slice(-4),
          expiry_month: parseInt(newCardForm.expiry_date.split("/")[0]),
          expiry_year: 2000 + parseInt(newCardForm.expiry_date.split("/")[1]),
          is_default: cards.filter((c) => c.is_active).length === 0,
          is_active: true,
          card_holder_name: newCardForm.card_holder_name,
          bank_name: "Ngân hàng liên kết",
        };
        setCards((prev) => [...prev, newCard]);
        alert("Đã thêm thẻ mới (Mock Data)");
        setShowAddModal(false);
        setNewCardForm({
          card_number: "",
          expiry_date: "",
          cvv: "",
          card_holder_name: "",
        });
      }
    } catch (err: any) {
      alert(err.message || "Thêm thẻ thất bại");
    } finally {
      setAddingCard(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,}).format(amount);
  };

  const activeCards = cards.filter((card) => card.is_active);
  const inactiveCards = cards.filter((card) => !card.is_active);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-800">Thiết lập thanh toán</h1>

      {useMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="text-yellow-400" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Đang hiển thị dữ liệu mẫu. Kết nối backend để xem dữ liệu thực.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab("cards")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 ${
            activeTab === "cards"
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard size={18} />
          Thẻ thanh toán
        </button>
        <button
          onClick={() => setActiveTab("wallets")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 ${
            activeTab === "wallets"
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Wallet size={18} />
          Ví điện tử
        </button>
      </div>

      {activeTab === "cards" && (
        <div className="space-y-6">
          <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CreditCard size={20} /> Thẻ thanh toán đang hoạt động
                <span className="text-sm font-normal text-gray-600">
                  ({activeCards.length} thẻ)
                </span>
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-sm font-bold bg-[#88D0B5] text-white px-4 py-2 rounded-xl hover:bg-[#76b9a1] transition"
              >
                <Plus size={16} /> Thêm thẻ mới
              </button>
            </div>

            {activeCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <CreditCard size={48} className="mx-auto" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Chưa có thẻ thanh toán nào đang hoạt động
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Thêm thẻ để thanh toán nhanh hơn
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#88D0B5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#76b9a1] transition"
                >
                  Thêm thẻ đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCards.map((card) => (
                  <CreditCardItem
                    key={card.id}
                    card={card}
                    useMockData={useMockData}
                    isActive={true}
                    onSetDefault={handleSetDefault}
                    onDisconnect={handleDisconnectCard}
                    onDelete={handleDeleteCard}
                    onReconnect={handleReconnectCard}
                  />
                ))}
              </div>
            )}
          </div>

          {inactiveCards.length > 0 && (
            <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <CreditCard className="text-gray-400" size={20} /> Thẻ đã hủy
                liên kết
                <span className="text-sm font-normal text-gray-600">
                  ({inactiveCards.length} thẻ)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveCards.map((card) => (
                  <CreditCardItem
                    key={card.id}
                    card={card}
                    useMockData={useMockData}
                    isActive={false}
                    onSetDefault={handleSetDefault}
                    onDisconnect={handleDisconnectCard}
                    onDelete={handleDeleteCard}
                    onReconnect={handleReconnectCard}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "wallets" && (
        <div className="bg-[#EFEDED] rounded-[25px] p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Wallet size={20} /> Ví điện tử liên kết
            <span className="text-sm font-normal text-gray-600">
              ({wallets.filter((w) => w.is_linked).length} ví)
            </span>
          </h2>

          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Wallet size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">
                Chưa có ví điện tử nào được liên kết
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <WalletItem
                  key={wallet.id}
                  wallet={wallet}
                  useMockData={useMockData}
                  onConnect={handleConnectWallet}
                  onDisconnect={handleDisconnectWallet}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={16} />
              <p>
                Thông tin thanh toán được bảo mật an toàn theo tiêu chuẩn PCI
                DSS
              </p>
            </div>
          </div>
        </div>
      )}

      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCard={handleAddCard}
        useMockData={useMockData}
        addingCard={addingCard}
      />

      <ConfirmModal
        type="delete"
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() =>
          showDeleteConfirm && confirmDeleteCard(showDeleteConfirm)
        }
        title="Xóa thẻ thanh toán"
        message="Bạn có chắc chắn muốn xóa thẻ này? Hành động này không thể hoàn tác."
        icon={Trash2}
      />

      <ConfirmModal
        type="disconnect"
        isOpen={!!showDisconnectConfirm}
        onClose={() => setShowDisconnectConfirm(null)}
        onConfirm={() =>
          showDisconnectConfirm && confirmDisconnectCard(showDisconnectConfirm)
        }
        title="Hủy liên kết thẻ"
        message="Bạn có chắc muốn hủy liên kết thẻ này? Thẻ sẽ không thể sử dụng cho thanh toán cho đến khi kích hoạt lại."
        icon={XCircle}
      />
    </div>
  );
}
