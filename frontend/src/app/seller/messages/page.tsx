"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  MoreVertical,
  Send,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";

/* =======================
   TYPES – BACKEND CONTRACT
   ======================= */

interface Conversation {
  id: string;
  customerName: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
  online?: boolean;
}

interface Message {
  id: string;
  sender: "CUSTOMER" | "SELLER" | "SYSTEM";
  content: string;
  createdAt: string;
}

/* =======================
   PAGE
   ======================= */

export default function MessagesPage() {
  /* ===== STATE (EMPTY) ===== */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  /* =======================
     FETCH DATA – BACKEND
     ======================= */
  useEffect(() => {
    /*
      TODO: BACKEND APIs

      - GET /api/seller/conversations
      - GET /api/seller/conversations/:id/messages

      REALTIME:
      - WebSocket / Socket.IO
      - Event:
        + message:new
        + conversation:update
    */
  }, []);

  /* =======================
     SEND MESSAGE
     ======================= */
  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;

    /*
      TODO:
      - POST /api/seller/messages
      Payload:
        {
          conversationId,
          content
        }
      - Hoặc emit socket event
    */

    setInput("");
  };

  /* =======================
     UI
     ======================= */

  return (
    <div className="p-6 bg-[#F3FFF7] min-h-screen">
      <h1 className="text-xl font-semibold mb-4">
        Chăm sóc khách hàng
      </h1>

      <div className="bg-white rounded-xl overflow-hidden flex h-[650px]">
        {/* ================= LEFT – CONVERSATIONS ================= */}
        <div className="w-[320px] border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                placeholder="Tìm kiếm khách hàng..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-6">
                Chưa có cuộc hội thoại
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversation(c)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-green-50 ${
                    activeConversation?.id === c.id
                      ? "bg-green-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {c.customerName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {c.lastTime}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {c.lastMessage}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ================= RIGHT – CHAT ================= */}
        <div className="flex-1 flex flex-col">
          {/* ===== CHAT HEADER ===== */}
          <div className="border-b px-4 py-3 flex items-center justify-between">
            {activeConversation ? (
              <>
                <div>
                  <p className="font-medium">
                    {activeConversation.customerName}
                  </p>
                  <p className="text-xs text-green-600">
                    Đang hoạt động
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Chọn một cuộc hội thoại
              </p>
            )}
          </div>

          {/* ===== MESSAGES ===== */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6FFFA]">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-10">
                Chưa có tin nhắn
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] text-sm px-4 py-2 rounded-lg ${
                    m.sender === "SELLER"
                      ? "ml-auto bg-green-600 text-white"
                      : m.sender === "SYSTEM"
                      ? "mx-auto bg-gray-100 text-gray-500 text-xs"
                      : "bg-white border"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
          </div>

          {/* ===== INPUT ===== */}
          <div className="border-t p-3 flex items-center gap-2">
            <button className="text-gray-500">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="text-gray-500">
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={handleSend}
              className="bg-green-600 text-white p-2 rounded-full"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
