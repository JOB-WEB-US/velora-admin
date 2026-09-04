"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { CheckCircle2, Image as ImageIcon, Loader2, MessageSquare, Search, Send, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";

type Message = { id: string; conversationId: string; senderType: "CUSTOMER" | "ADMIN"; content?: string | null; imageUrls: string[]; createdAt: string };
type Conversation = { id: string; status: "OPEN" | "CLOSED"; adminUnreadCount: number; lastMessageAt: string; customer: { id: string; name: string; email: string; avatar?: string }; messages: Message[] };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SOCKET_URL = API_URL.replace(/\/api\/v1\/?$/, "");

export default function MessagesPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const token = useAdminAuthStore((state) => state.token);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const selected = conversations.find((item) => item.id === selectedId);

  const loadConversations = async () => {
    const { data } = await apiClient.get("/admin/conversations");
    const list = data.data || [];
    setConversations(list);
    setSelectedId((current) => current || list[0]?.id || "");
    setLoading(false);
  };

  useEffect(() => { loadConversations().catch(() => setLoading(false)); }, []);
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true, auth: { token, scope: "admin" }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("conversation:updated", () => loadConversations().catch(() => {}));
    socket.on("message:new", (message: Message) => {
      if (message.conversationId === selectedId) {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        socket.emit("message:read", selectedId);
      }
    });
    return () => { socket.disconnect(); };
  }, [token, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    apiClient.get(`/admin/conversations/${selectedId}/messages`).then(({ data }) => {
      setMessages(data.data || []);
      socketRef.current?.emit("conversation:join", selectedId);
      socketRef.current?.emit("message:read", selectedId);
      setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, adminUnreadCount: 0 } : item));
    });
  }, [selectedId]);
  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filtered = useMemo(() => conversations.filter((item) => `${item.customer.name} ${item.customer.email}`.toLowerCase().includes(search.toLowerCase())), [conversations, search]);

  const selectImages = async (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).slice(0, 5 - images.length).filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024);
    const encoded = await Promise.all(valid.map((file) => new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); })));
    setImages((current) => [...current, ...encoded].slice(0, 5));
  };

  const send = async () => {
    if (!selectedId || sending || (!text.trim() && !images.length)) return;
    const draftText = text.trim();
    const draftImages = [...images];
    const clientMessageId = crypto.randomUUID();
    const temporaryId = `pending-${clientMessageId}`;
    const optimisticMessage: Message = {
      id: temporaryId, conversationId: selectedId, senderType: "ADMIN",
      content: draftText || null, imageUrls: draftImages, createdAt: new Date().toISOString(),
    };
    setSending(true);
    setMessages((current) => [...current, optimisticMessage]);
    setText("");
    setImages([]);
    try {
      const urls: string[] = [];
      for (const image of draftImages) {
        const { data } = await apiClient.post("/admin/upload", { image });
        urls.push(data.data.url);
      }
      const { data } = await apiClient.post(`/admin/conversations/${selectedId}/messages`, {
        content: draftText, imageUrls: urls, clientMessageId,
      });
      const message = data.data as Message;
      setMessages((current) => current.map((item) => item.id === temporaryId ? message : item).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index));
      loadConversations().catch(() => {});
    } catch (error: any) {
      setMessages((current) => current.filter((item) => item.id !== temporaryId));
      setText(draftText);
      setImages(draftImages);
      alert(error?.response?.data?.message || error?.message || (isVi ? "Không thể gửi tin nhắn" : "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async () => {
    if (!selected) return;
    const status = selected.status === "OPEN" ? "CLOSED" : "OPEN";
    await apiClient.patch(`/admin/conversations/${selected.id}/status`, { status });
    setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, status } : item));
  };

  return <div className="space-y-5">
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
        <MessageSquare className="w-7 h-7 text-blue-600" /> {isVi ? "Tin Nhắn Khách Hàng" : "Customer Support Chat"}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        {isVi ? "Hỗ trợ khách hàng theo thời gian thực và gửi hình ảnh." : "Real-time live messaging and customer assistance."}
      </p>
    </div>
    <div className="h-[calc(100vh-155px)] min-h-[420px] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-[340px_1fr] min-h-0">
      <aside className="border-r border-slate-200 flex flex-col min-w-0 min-h-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isVi ? "Tìm tên hoặc email..." : "Search name or email..."}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">{isVi ? "Chưa có cuộc trò chuyện" : "No conversations found"}</p>
          ) : (
            filtered.map((item) => {
              const last = item.messages?.[0];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 ${selectedId === item.id ? "bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-extrabold text-slate-900 truncate">{item.customer.name}</p>
                    {item.adminUnreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.adminUnreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.customer.email}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">
                    {last?.content || (last?.imageUrls?.length ? (isVi ? "📷 Hình ảnh" : "📷 Image") : (isVi ? "Chưa có tin nhắn" : "No messages yet"))}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>
      <section className="flex flex-col min-w-0 min-h-0">
        {selected ? (
          <>
            <header className="h-20 shrink-0 px-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-slate-900">{selected.customer.name}</p>
                <p className="text-xs text-slate-500">{selected.customer.email}</p>
              </div>
              <button
                onClick={changeStatus}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  selected.status === "OPEN" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {selected.status === "OPEN" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {selected.status === "OPEN" ? (isVi ? "Đang mở · Đóng hội thoại" : "Open · Close chat") : (isVi ? "Đã đóng · Mở lại" : "Closed · Reopen")}
              </button>
            </header>
            <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50 p-5 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderType === "ADMIN" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                    message.senderType === "ADMIN" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                  }`}>
                    {message.imageUrls?.map((url) => (
                      <a href={url} target="_blank" rel="noreferrer" key={url}>
                        <img src={url} alt={isVi ? "Ảnh trò chuyện" : "Attachment"} className="rounded-xl max-h-72 mb-2 object-cover" />
                      </a>
                    ))}
                    {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                    <p className="text-[9px] opacity-60 text-right mt-1">
                      {new Date(message.createdAt).toLocaleString(isVi ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 p-4 border-t border-slate-200 space-y-2">
              {images.length > 0 && (
                <div className="flex gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={isVi ? "Chờ gửi" : "Pending"} className="w-16 h-16 rounded-lg object-cover" />
                      <button onClick={() => setImages((items) => items.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <label className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => selectImages(e.target.files)} />
                </label>
                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={isVi ? "Nhập nội dung trả lời..." : "Type a reply..."}
                  className="flex-1 max-h-28 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={send}
                  disabled={sending || (!text.trim() && !images.length)}
                  className="p-3 rounded-xl bg-blue-600 text-white disabled:opacity-40"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p className="font-bold">{isVi ? "Chọn một cuộc trò chuyện" : "Select a conversation"}</p>
          </div>
        )}
      </section>
    </div>
  </div>;
}
