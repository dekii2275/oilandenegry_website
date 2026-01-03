"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Send, Search } from "lucide-react";

type Message = {
  id: string;
  store_id: number;
  customer_id: number;
  sender_role: "CUSTOMER" | "SELLER" | string;
  sender_id: number;
  text: string | null;
  image_url?: string | null;
  created_at: string;
  product_id?: number | null;
  order_id?: number | null;
};

type ThreadSummary = {
  store_id: number;
  customer_id: number;
  customer_name?: string | null;
  customer_avatar_url?: string | null;
  last_message: Message;
};

type InboxResponse = {
  threads: ThreadSummary[];
};

type ThreadResponse = {
  store_id: number;
  customer_id: number;
  messages: Message[];
};

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null
  );
}

function ensureUtc(iso?: string | null) {
  if (!iso) return "";
  // nếu không có timezone (Z / +07:00 / -xx:xx) thì coi là UTC và thêm Z
  const hasTZ = /Z$|[+-]\d{2}:\d{2}$/.test(iso);
  return hasTZ ? iso : `${iso}Z`;
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(ensureUtc(iso));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function normalizeImageUrl(u?: string | null) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (typeof window === "undefined") return u;
  return `${window.location.origin}${u}`;
}

export default function SellerMessagesPage() {
  const API_BASE = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "/api";
    return base.replace(/\/$/, "");
  }, []);

  const [token, setToken] = useState<string | null>(null);

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selected, setSelected] = useState<{ store_id: number; customer_id: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);

  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  const authHeader = useMemo((): HeadersInit | undefined => {
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const fetchInbox = async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch(`${API_BASE}/messages/inbox`, {
        headers: authHeader,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as InboxResponse;
      setThreads(data?.threads || []);
    } catch (e) {
      console.error("fetchInbox error:", e);
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };

  const fetchThread = async (store_id: number, customer_id: number) => {
    setLoadingThread(true);
    try {
      const url = `${API_BASE}/messages/thread?store_id=${store_id}&customer_id=${customer_id}&limit=500`;
      const res = await fetch(url, {
        headers: authHeader,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as ThreadResponse;
      setMessages(data?.messages || []);
      scrollToBottom();
    } catch (e) {
      console.error("fetchThread error:", e);
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const t = setInterval(fetchInbox, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, authHeader]);

  useEffect(() => {
    if (!selected) return;

    fetchThread(selected.store_id, selected.customer_id);
    const t = setInterval(() => fetchThread(selected.store_id, selected.customer_id), 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.store_id, selected?.customer_id, API_BASE, authHeader]);

  const sendText = async () => {
    if (!selected) return;
    const t = text.trim();
    if (!t) return;

    setSending(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body = {
        store_id: selected.store_id,
        customer_id: selected.customer_id,
        text: t,
        image_url: null,
        product_id: null,
        order_id: null,
      };

      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      setText("");
      await fetchThread(selected.store_id, selected.customer_id);
      await fetchInbox();
      scrollToBottom();
    } catch (e) {
      console.error("sendText error:", e);
      alert("Gửi tin nhắn thất bại. Xem console/log backend.");
    } finally {
      setSending(false);
    }
  };

  const uploadAndSendImage = async (file: File) => {
    if (!selected) return;

    setSending(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const fd = new FormData();
      fd.append("store_id", String(selected.store_id));
      fd.append("customer_id", String(selected.customer_id));
      fd.append("file", file);

      const up = await fetch(`${API_BASE}/messages/upload-image`, {
        method: "POST",
        headers, // KHÔNG set Content-Type khi dùng FormData
        body: fd,
        credentials: "include",
      });
      if (!up.ok) throw new Error(await up.text());
      const upData = (await up.json()) as { image_url?: string };

      const image_url = upData?.image_url;
      if (!image_url) throw new Error("No image_url returned");

      // gửi message kèm image_url
      const headers2: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers2["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers: headers2,
        credentials: "include",
        body: JSON.stringify({
          store_id: selected.store_id,
          customer_id: selected.customer_id,
          text: null,
          image_url,
          product_id: null,
          order_id: null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      await fetchThread(selected.store_id, selected.customer_id);
      await fetchInbox();
      scrollToBottom();
    } catch (e) {
      console.error("uploadAndSendImage error:", e);
      alert("Gửi ảnh thất bại. Xem console/log backend.");
    } finally {
      setSending(false);
    }
  };

  const selectedThread = useMemo(() => {
    if (!selected) return null;
    return threads.find(
      (t) => t.store_id === selected.store_id && t.customer_id === selected.customer_id
    );
  }, [threads, selected]);

  const selectedName = useMemo(() => {
    if (!selected) return "";
    return selectedThread?.customer_name || `Customer #${selected.customer_id}`;
  }, [selected, selectedThread]);

  const filteredThreads = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return threads;
    return threads.filter((t) => {
      const name = (t.customer_name || "").toLowerCase();
      return (
        String(t.customer_id).includes(qq) ||
        String(t.store_id).includes(qq) ||
        name.includes(qq)
      );
    });
  }, [threads, q]);

  return (
    <div className="w-full">
      <div className="text-2xl font-semibold mb-6">Chăm sóc khách hàng</div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: conversations */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border p-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên / customer_id / store_id..."
              className="w-full outline-none text-sm"
            />
          </div>

          <div className="mt-4 space-y-2 max-h-[62vh] overflow-auto">
            {loadingThreads && threads.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">Đang tải...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">Chưa có cuộc hội thoại</div>
            ) : (
              filteredThreads.map((t) => {
                const isActive =
                  selected?.store_id === t.store_id && selected?.customer_id === t.customer_id;

                const last = t.last_message;
                const lastText = last?.image_url ? "[Ảnh]" : last?.text ? last.text : "(trống)";

                const displayName = t.customer_name ? t.customer_name : `Customer #${t.customer_id}`;

                return (
                  <button
                    key={`${t.store_id}-${t.customer_id}`}
                    onClick={() => setSelected({ store_id: t.store_id, customer_id: t.customer_id })}
                    className={[
                      "w-full text-left p-3 rounded-xl border transition",
                      isActive ? "border-green-600 bg-green-50" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">
                        {displayName}
                        <span className="text-gray-400 font-normal"> • Store #{t.store_id}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(last?.created_at)}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-1">{lastText}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: thread */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border overflow-hidden">
          <div className="px-4 py-3 border-b text-sm text-gray-600">
            {selected ? (
              <div className="flex items-center justify-between">
                <div>
                  Đang chat với <b>{selectedName}</b> (Store #{selected.store_id})
                </div>
                {loadingThread ? <div className="text-xs text-gray-400">Đang tải...</div> : null}
              </div>
            ) : (
              "Chọn một cuộc hội thoại"
            )}
          </div>

          <div className="h-[58vh] overflow-auto p-4 bg-gray-50">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Chưa chọn hội thoại
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Chưa có tin nhắn
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const isMe = String(m.sender_role).toUpperCase() === "SELLER";
                  const img = normalizeImageUrl(m.image_url ?? null);

                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={[
                          "max-w-[70%] rounded-2xl px-3 py-2 shadow-sm",
                          isMe ? "bg-green-600 text-white" : "bg-white border",
                        ].join(" ")}
                      >
                        {img ? (
                          <div className="mb-2">
                            <img
                              src={img}
                              alt="chat"
                              className="rounded-xl max-h-[260px] object-contain bg-black/5"
                            />
                          </div>
                        ) : null}

                        {m.text ? <div className="text-sm whitespace-pre-wrap">{m.text}</div> : null}

                        <div className={`text-[11px] mt-1 ${isMe ? "text-green-50" : "text-gray-400"}`}>
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* composer */}
          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-xl border hover:bg-gray-50"
                disabled={!selected || sending}
                onClick={() => fileInputRef.current?.click()}
                title="Gửi ảnh"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  uploadAndSendImage(f);
                }}
              />

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border rounded-xl px-3 py-2 outline-none text-sm"
                disabled={!selected || sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendText();
                }}
              />

              <button
                type="button"
                className="p-2 rounded-xl bg-green-600 text-white disabled:opacity-60"
                disabled={!selected || sending || !text.trim()}
                onClick={sendText}
                title="Gửi"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
