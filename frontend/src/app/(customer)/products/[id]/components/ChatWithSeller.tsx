"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Image as ImageIcon, Send, Loader2 } from "lucide-react";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type Message = {
  _id?: string;
  id?: string;
  store_id: number;
  customer_id: number;
  sender_role: Role;
  sender_id: number;
  text?: string | null;
  image_url?: string | null;
  product_id?: number | null;
  order_id?: number | null;
  created_at?: string | null; // ISO
};

type AnyMsg = any;

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

// backend đã trả created_at có "Z" rồi, nhưng giữ hàm này để an toàn
function parseIsoToDate(iso?: string | null) {
  if (!iso) return null;
  const s = String(iso).trim();
  if (!s) return null;

  const hasTZ = /([zZ]|[+\-]\d{2}:\d{2})$/.test(s);
  const fixed = hasTZ ? s : `${s}Z`;

  const d = new Date(fixed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatTime(iso?: string | null) {
  const d = parseIsoToDate(iso);
  if (!d) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function cleanText(v?: string | null) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (!s) return "";
  const low = s.toLowerCase();
  if (low === "none" || low === "null" || low === "undefined") return "";
  return s;
}

function normalizeImageUrl(url?: string | null) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u; // /static/... => dùng cùng domain
  return `/${u}`;
}

function normalizeMessage(m: AnyMsg): Message {
  return {
    _id: m._id ?? undefined,
    id: m.id ?? undefined,
    store_id: Number(m.store_id ?? m.storeId ?? 0),
    customer_id: Number(m.customer_id ?? m.customerId ?? 0),
    sender_role: (m.sender_role ?? m.senderRole ?? "CUSTOMER") as Role,
    sender_id: Number(m.sender_id ?? m.senderId ?? 0),
    text: m.text ?? null,
    image_url: m.image_url ?? m.imageUrl ?? null,
    product_id: m.product_id ?? m.productId ?? null,
    order_id: m.order_id ?? m.orderId ?? null,
    created_at: m.created_at ?? m.createdAt ?? null,
  };
}

export default function ChatWithSeller({
  open,
  onClose,
  storeId,
  storeName,
  customerId,
  productId = null,
  orderId = null,
  token, // ✅ thêm: nếu bạn truyền token vào thì sẽ dùng Bearer
}: {
  open: boolean;
  onClose: () => void;
  storeId: number;
  storeName: string;
  customerId: number;
  productId?: number | null;
  orderId?: number | null;
  token?: string | null;
}) {
  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "/api", []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

    const authHeaders = useMemo(() => {
    const h = new Headers();
    if (token && String(token).trim()) {
      h.set("Authorization", `Bearer ${String(token).trim()}`);
    }
    return h;
  }, [token]);



  const scrollBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const fetchMessages = async () => {
    if (!open) return;
    if (!storeId || !customerId) return;

    setLoading(true);
    try {
      const url =
        `${API_BASE}/messages/thread?store_id=${storeId}&customer_id=${customerId}` +
        (productId ? `&product_id=${productId}` : "") +
        (orderId ? `&order_id=${orderId}` : "");

      const res = await fetch(url, {
        headers: authHeaders,
        credentials: "include",
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`fetchMessages failed: ${res.status} ${t}`);
      }

      const data = await res.json();
      const rawList: AnyMsg[] = Array.isArray(data) ? data : data?.messages || [];
      setMessages(rawList.map(normalizeMessage));

      setTimeout(scrollBottom, 50);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, storeId, customerId]);

  useEffect(() => {
    if (open) setTimeout(scrollBottom, 50);
  }, [open, messages.length]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("store_id", String(storeId));
      form.append("customer_id", String(customerId));
      if (productId) form.append("product_id", String(productId));
      if (orderId) form.append("order_id", String(orderId));

      const res = await fetch(`${API_BASE}/messages/upload-image`, {
        method: "POST",
        body: form,
        headers: authHeaders,
        credentials: "include",
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`upload failed ${res.status}: ${t}`);
      }

      const data = await res.json();
      return (data?.image_url as string | undefined) || (data?.imageUrl as string | undefined);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (payload: { text?: string | null; image_url?: string | null }) => {
    if (!storeId || !customerId) return;

    const cleaned = cleanText(payload.text);
    const hasText = cleaned.length > 0;
    const hasImage = !!payload.image_url;

    if (!hasText && !hasImage) return;

    setSending(true);
    try {
      const body = {
        store_id: storeId,
        customer_id: customerId,
        text: hasText ? cleaned : null,
        image_url: hasImage ? payload.image_url : null,
        product_id: productId,
        order_id: orderId,
      };

      const res = await fetch(`${API_BASE}/messages/send`, {
  method: "POST",
  headers: (() => {
    const h = new Headers(authHeaders);
    h.set("Content-Type", "application/json");
    return h;
  })(),
  body: JSON.stringify(body),
  credentials: "include",
});


      if (!res.ok) {
        const t = await res.text();
        throw new Error(`send failed ${res.status}: ${t}`);
      }

      setText("");
      await fetchMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const onPickImage = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) throw new Error("No image_url returned");
      await sendMessage({ text: null, image_url: imageUrl });
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitText = async () => {
    await sendMessage({ text, image_url: null });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-xs text-gray-500">Nhắn tin với</div>
            <div className="font-semibold">{storeName}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="h-[420px] overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Loader2 className="mr-2 animate-spin" size={18} />
              Đang tải...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Chưa có tin nhắn. Gửi tin nhắn đầu tiên nhé.
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((m, idx) => {
                const isMe = m.sender_role === "CUSTOMER" && m.sender_id === customerId;

                const t = cleanText(m.text ?? null);
                const hasText = t.length > 0;

                const img = normalizeImageUrl(m.image_url ?? null);
                const hasImage = !!img;

                return (
                  <div key={m.id || m._id || `${m.created_at || idx}-${idx}`} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        isMe ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {hasImage && (
                        <a href={img!} target="_blank" rel="noreferrer">
                          <img src={img!} alt="chat" className="mb-2 max-h-64 w-full rounded-xl object-cover" />
                        </a>
                      )}

                      {/* ✅ không còn render None */}
                      {hasText && <div className="whitespace-pre-wrap">{t}</div>}

                      <div className={cn("mt-1 text-[11px]", isMe ? "text-white/80" : "text-gray-500")}>
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

        {/* Input */}
        <div className="flex items-center gap-2 border-t px-3 py-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

          <button
            onClick={onPickImage}
            className="rounded-lg p-2 hover:bg-gray-100"
            disabled={uploading || sending}
            title="Gửi ảnh"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitText();
            }}
            disabled={sending}
          />

          <button
            onClick={onSubmitText}
            className="rounded-xl bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-60"
            disabled={sending || uploading}
            title="Gửi"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
