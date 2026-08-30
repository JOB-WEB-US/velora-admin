"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Save,
  Palette,
  Gauge,
  ChevronUp,
  ChevronDown,
  Layers,
  Tag,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface AnnouncementItem {
  id: string;
  text: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AnnouncementConfig {
  enabled: boolean;
  speed: "normal" | "slow" | "fast";
  bgColor: string;
  textColor: string;
  items: AnnouncementItem[];
}

const COLOR_PRESETS = [
  { name: "Đỏ Đô Sang Trọng", hex: "#a80000" },
  { name: "Đen Tối Giản", hex: "#111111" },
  { name: "Cam Neon Rực Rỡ", hex: "#ff7700" },
  { name: "Xanh Dương Royal", hex: "#1e40af" },
  { name: "Xanh Ngọc Emerald", hex: "#059669" },
  { name: "Tím Hoàng Gia", hex: "#7c3aed" },
  { name: "Hồng Ruby", hex: "#e11d48" },
  { name: "Hổ Phách Autumn", hex: "#b45309" },
];

const TEXT_COLOR_PRESETS = [
  { name: "Trắng Thuần", hex: "#ffffff" },
  { name: "Vàng Kim Gold", hex: "#fbbf24" },
  { name: "Cam Neon", hex: "#ff7700" },
  { name: "Xanh Cyan", hex: "#38bdf8" },
  { name: "Xanh Lime", hex: "#a3e635" },
];

const SUGGESTIONS = [
  {
    category: "Khuyến Mãi & Giảm Giá",
    icon: Tag,
    items: [
      { text: "🔥 10% OFF YOUR ENTIRE ORDER — USE CODE: VELORA10", linkUrl: "/shop" },
      { text: "⚡ FLASH SALE: BUY 2 GET 1 FREE ON ALL GRAPHIC TEES — CODE: B2G1", linkUrl: "/shop" },
      { text: "💥 LIMITED TIME: 15% OFF ALL HOODIES & SWEATSHIRTS — CODE: COZY15", linkUrl: "/shop?type=Hoodie" },
      { text: "🎉 EXTRA 20% OFF FIRST ORDER — SIGN UP TODAY", linkUrl: "/account" },
      { text: "🎁 BUNDLE & SAVE: 15% OFF 2 ITEMS, 20% OFF 3 ITEMS!", linkUrl: "/shop" },
    ],
  },
  {
    category: "Vận Chuyển & Giao Hàng",
    icon: Truck,
    items: [
      { text: "🚚 FREE EXPRESS US SHIPPING ON ORDERS OVER $75", linkUrl: "/pages/order-tracking" },
      { text: "📦 FAST 24-48 HOUR DISPATCH FROM CALIFORNIA & TEXAS", linkUrl: "/pages/order-tracking" },
      { text: "🌍 FAST US & WORLDWIDE SHIPPING — EASY 30-DAY RETURNS", linkUrl: "/pages/order-tracking" },
      { text: "⚡ GUARANTEED ON-TIME DELIVERY FOR HOLIDAY ORDERS", linkUrl: "/pages/order-tracking" },
    ],
  },
  {
    category: "Mùa Lễ Hội & Xu Hướng",
    icon: Sparkles,
    items: [
      { text: "🎃 HALLOWEEN SPOOKY COLLECTION IS LIVE — SHOP NOW", linkUrl: "/collections/halloween" },
      { text: "🎄 CHRISTMAS & HOLIDAY SALE — EXCLUSIVE WINTER APPAREL", linkUrl: "/collections/christmas" },
      { text: "📻 RETRO & VINTAGE 80s/90s ROCK MERCH BACK IN STOCK", linkUrl: "/collections/vintage" },
      { text: "🤠 NEW ARRIVAL: NASHVILLE & COUNTRY MUSIC COLLECTION", linkUrl: "/collections/country-music" },
      { text: "🔥 2026 TRENDING GRAPHIC APPAREL — LIMITED DROPS", linkUrl: "/collections/trending" },
    ],
  },
  {
    category: "Cam Kết Chất Lượng & Uy Tín",
    icon: ShieldCheck,
    items: [
      { text: "⭐ 100% PREMIUM RING-SPUN COTTON & DURABLE DTG PRINTS", linkUrl: "/shop" },
      { text: "🛡️ 30-DAY SATISFACTION GUARANTEE & HASSLE-FREE EXCHANGES", linkUrl: "/shop" },
      { text: "🇺🇸 DESIGNED & PRINTED WITH PRIDE IN THE USA", linkUrl: "/shop" },
    ],
  },
];

const EMOJI_SHORTCUTS = ["🔥", "⭐", "🚚", "⚡", "🎁", "🎃", "🎄", "💥", "📦", "🇺🇸", "🏷️", "📻", "🤠", "🎉", "🛡️"];

export default function AnnouncementsPage() {
  const [config, setConfig] = useState<AnnouncementConfig>({
    enabled: true,
    speed: "normal",
    bgColor: "#a80000",
    textColor: "#ffffff",
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    linkUrl: "/shop",
    isActive: true,
    order: 1,
  });
  const [savingItem, setSavingItem] = useState(false);

  // Active Category Filter for Suggestions
  const [selectedSuggestionCat, setSelectedSuggestionCat] = useState("all");
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/announcements/admin");
      if (res.data?.data) {
        setConfig(res.data.data);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu chữ chạy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    setConfigSavedSuccess(false);

    try {
      await apiClient.put("/announcements/admin/config", {
        enabled: config.enabled,
        speed: config.speed,
        bgColor: config.bgColor,
        textColor: config.textColor,
      });
      setConfigSavedSuccess(true);
      setTimeout(() => setConfigSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu cấu hình!");
    } finally {
      setSavingConfig(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      text: "",
      linkUrl: "/shop",
      isActive: true,
      order: config.items.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      linkUrl: item.linkUrl || "",
      isActive: item.isActive,
      order: item.order,
    });
    setIsModalOpen(true);
  };

  const handleUseSuggestion = (suggestion: { text: string; linkUrl: string }) => {
    setEditingItem(null);
    setFormData({
      text: suggestion.text,
      linkUrl: suggestion.linkUrl,
      isActive: true,
      order: config.items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleQuickAddSuggestion = async (suggestion: { text: string; linkUrl: string }) => {
    try {
      const res = await apiClient.post("/announcements/admin", {
        text: suggestion.text,
        linkUrl: suggestion.linkUrl,
        isActive: true,
        order: config.items.length + 1,
      });

      if (res.data?.data) {
        setConfig((prev) => ({
          ...prev,
          items: [...prev.items, res.data.data],
        }));
        setAddedNotice(`Đã thêm: "${suggestion.text}"`);
        setTimeout(() => setAddedNotice(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm nhanh gợi ý!");
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert("Vui lòng nhập nội dung chữ chạy!");
      return;
    }

    setSavingItem(true);
    try {
      if (editingItem) {
        const res = await apiClient.put(`/announcements/admin/${editingItem.id}`, formData);
        setConfig((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === editingItem.id ? res.data.data : i)),
        }));
      } else {
        const res = await apiClient.post("/announcements/admin", formData);
        setConfig((prev) => ({
          ...prev,
          items: [...prev.items, res.data.data],
        }));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu chữ chạy!");
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleItem = async (item: AnnouncementItem) => {
    try {
      await apiClient.patch(`/announcements/admin/${item.id}/toggle`, {});
      setConfig((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)),
      }));
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái!");
    }
  };

  const handleDeleteItem = async (item: AnnouncementItem) => {
    if (!confirm(`Bạn có chắc muốn xóa dòng chữ chạy: "${item.text}"?`)) return;

    try {
      await apiClient.delete(`/announcements/admin/${item.id}`);
      setConfig((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== item.id),
      }));
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa!");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newItems = [...config.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setConfig((prev) => ({ ...prev, items: reordered }));

    try {
      await apiClient.post("/announcements/admin/reorder", { items: reordered });
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thứ tự:", err);
    }
  };

  const activeItems = config.items.filter((i) => i.isActive);

  const getSpeedClass = () => {
    if (config.speed === "slow") return "animate-marquee-slow";
    if (config.speed === "fast") return "animate-marquee-fast";
    return "animate-marquee";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-7 h-7 text-[#ff7700]" />
            Quản Lý Chữ Chạy Header (Top Bar Announcements)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến thanh khẩu hiệu chữ chạy (Marquee) trên cùng của website, hỗ trợ kho mẫu gợi ý 1-click và xem trước trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAnnouncements}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06800] text-black font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Thêm Dòng Chữ Mới
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {addedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{addedNotice} (Đã thêm vào danh sách và cập nhật ra storefront)!</span>
        </div>
      )}

      {/* 1. Live Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Trình Xem Trước Trực Tiếp Giao Diện Storefront (Live Preview)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {config.enabled ? "● Đang bật trên website" : "○ Đang tắt toàn bộ"}
          </span>
        </div>

        {config.enabled ? (
          <div
            className="w-full py-2 px-4 rounded-xl overflow-hidden font-bold text-xs shadow-inner flex items-center transition-colors duration-300"
            style={{ backgroundColor: config.bgColor, color: config.textColor }}
          >
            {activeItems.length > 0 ? (
              <div className={`flex whitespace-nowrap ${getSpeedClass()}`}>
                {[...activeItems, ...activeItems, ...activeItems].map((item, idx) => (
                  <span key={`${item.id}-${idx}`} className="mx-8 inline-flex items-center gap-2">
                    <span>{item.text}</span>
                    {item.linkUrl && (
                      <span className="text-[10px] opacity-75 font-mono underline">
                        ({item.linkUrl})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className="w-full text-center text-xs opacity-75 py-1">
                ⚠️ Chưa có dòng chữ nào đang được kích hoạt. Hãy bật hoặc thêm mới một dòng chữ bên dưới!
              </div>
            )}
          </div>
        ) : (
          <div className="w-full py-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-400 border border-dashed border-slate-300">
            Thanh chữ chạy Top Bar hiện đang bị tắt. Người dùng vào website sẽ không thấy thanh này.
          </div>
        )}
      </div>

      {/* 2. Appearance & Display Settings */}
      <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              1. Cấu Hình Màu Sắc & Tốc Độ Chạy Chữ
            </h2>
          </div>

          {configSavedSuccess && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={13} /> Đã lưu cấu hình thành công
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Hiển Thị Thanh Top Bar</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Bật hoặc tắt hoàn toàn thanh chữ chạy ở trên cùng của trang chủ và tất cả các trang shop.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                {config.enabled ? "Trạng thái: Bật" : "Trạng thái: Tắt"}
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 accent-[#ff7700] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Gauge size={15} className="text-blue-600" /> Tốc Độ Cuộn Chữ (Marquee Speed)
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Điều chỉnh thời gian một vòng cuộn chạy chữ từ phải qua trái.
              </p>
            </div>
            <div className="mt-4">
              <select
                value={config.speed}
                onChange={(e) => setConfig({ ...config, speed: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="slow">🐢 Chậm rãi (35 giây) — Dễ đọc nội dung dài</option>
                <option value="normal">⚡ Tiêu chuẩn (25 giây) — Mượt mà & Tự nhiên</option>
                <option value="fast">🚀 Nhanh (15 giây) — Sôi động, kích thích mua sắm</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">Màu Chữ (Text Color)</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {TEXT_COLOR_PRESETS.map((tc) => (
                <button
                  key={tc.hex}
                  type="button"
                  onClick={() => setConfig({ ...config, textColor: tc.hex })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                    config.textColor === tc.hex
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: tc.hex }} />
                  {tc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-extrabold text-slate-800 block">
            Màu Nền Thanh Chữ Chạy (Background Color):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {COLOR_PRESETS.map((cp) => (
              <button
                key={cp.hex}
                type="button"
                onClick={() => setConfig({ ...config, bgColor: cp.hex })}
                className={`p-2.5 rounded-xl border transition flex flex-col items-center gap-1.5 ${
                  config.bgColor.toLowerCase() === cp.hex.toLowerCase()
                    ? "border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="w-6 h-6 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: cp.hex }} />
                <span className="text-[11px] font-bold text-slate-800 text-center leading-tight truncate w-full">
                  {cp.name}
                </span>
                <span className="text-[9px] font-mono text-slate-400">{cp.hex}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-slate-600">Hoặc chọn mã màu tùy ý:</span>
            <input
              type="color"
              value={config.bgColor}
              onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={config.bgColor}
              onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 w-28"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingConfig}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {savingConfig ? "Đang lưu..." : "Lưu & Áp Dụng Màu Sắc & Tốc Độ"}
          </button>
        </div>
      </form>

      {/* 3. Suggestions Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              2. Kho Gợi Ý Mẫu Khẩu Hiệu Bán Hàng (1-Click Suggestions)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn nhanh các mẫu câu chữ chạy thu hút khách hàng, kích thích tăng tỷ lệ chuyển đổi và doanh số POD.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSuggestionCat("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedSuggestionCat === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất Cả
            </button>
            {SUGGESTIONS.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedSuggestionCat(cat.category)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedSuggestionCat === cat.category
                    ? "bg-[#ff7700] text-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.category.split(" ")[0]} {cat.category.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUGGESTIONS.filter(
            (cat) => selectedSuggestionCat === "all" || selectedSuggestionCat === cat.category
          ).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon size={15} className="text-[#ff7700]" /> {cat.category}
                </h3>

                <div className="space-y-2">
                  {cat.items.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-200 rounded-xl transition flex items-center justify-between gap-3 group"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{sug.text}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          🔗 Link: {sug.linkUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUseSuggestion(sug)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-[11px] font-bold shadow-sm transition"
                          title="Tùy chỉnh trước khi lưu"
                        >
                          ✨ Sửa & Thêm
                        </button>

                        <button
                          onClick={() => handleQuickAddSuggestion(sug)}
                          className="px-2.5 py-1 rounded-lg bg-[#ff7700] hover:bg-[#e06800] text-black text-[11px] font-extrabold shadow-sm transition flex items-center gap-1"
                          title="Thêm ngay vào danh sách chạy"
                        >
                          <Plus size={13} /> Thêm Ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Announcements List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              3. Danh Sách Các Dòng Chữ Chạy ({config.items.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              (Thứ tự từ trên xuống dưới sẽ chạy lần lượt trên thanh Marquee ngoài website).
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#ff7700] hover:bg-[#e06800] text-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={14} /> Thêm Dòng Chữ
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Đang tải danh sách chữ chạy...
          </div>
        ) : config.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Chưa có dòng chữ chạy nào</p>
            <p className="text-xs text-slate-500">
              Hãy chọn nhanh các mẫu gợi ý ở mục số 2 hoặc nhấn "Thêm Dòng Chữ Mới".
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {config.items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isActive
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="Chuyển lên trước"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === config.items.length - 1}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="Chuyển xuống sau"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-black flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.linkUrl ? (
                        <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                          🔗 {item.linkUrl}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Không gán liên kết)
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.isActive ? "● Đang Kích Hoạt" : "○ Tạm Ẩn"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleItem(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      item.isActive
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {item.isActive ? "Tạm Ẩn" : "Kích Hoạt"}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingItem ? "Chỉnh Sửa Dòng Chữ Chạy" : "Thêm Dòng Chữ Chạy Mới"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập nội dung thông báo và link điều hướng khi khách hàng bấm vào.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chèn Nhanh Biểu Tượng Icon / Emoji:
                </span>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {EMOJI_SHORTCUTS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, text: `${emoji} ${formData.text}` })}
                      className="w-7 h-7 bg-white hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center justify-center text-sm transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Nội Dung Chữ Chạy *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g. 🔥 10% OFF YOUR ENTIRE ORDER — USE CODE: VELORA10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold outline-none focus:border-[#ff7700] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Đường Link Điều Hướng (Target URL khi bấm)
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="e.g. /shop hoặc /collections/halloween hoặc /pages/order-tracking"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-[#ff7700] focus:bg-white"
                />

                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {[
                    { label: "Tất cả SP", url: "/shop" },
                    { label: "Halloween", url: "/collections/halloween" },
                    { label: "Trending", url: "/collections/trending" },
                    { label: "Vintage", url: "/collections/vintage" },
                    { label: "Tra cứu đơn", url: "/pages/order-tracking" },
                  ].map((chip) => (
                    <button
                      key={chip.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, linkUrl: chip.url })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[10px] font-mono border border-slate-200 transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold outline-none focus:border-[#ff7700]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                  <div>
                    <span className="font-bold text-slate-800 block">Kích Hoạt Ngay</span>
                    <span className="text-[11px] text-slate-500">Hiển thị trên Marquee</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-[#ff7700] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-6 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06800] text-black font-extrabold shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingItem ? "Đang lưu..." : editingItem ? "Cập Nhật Dòng Chữ" : "Thêm Dòng Chữ Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

