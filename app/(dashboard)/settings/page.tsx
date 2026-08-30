"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Save, 
  Sparkles, 
  CheckCircle2,
  Truck,
  TrendingUp,
  Megaphone,
  ArrowRight
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

const PARTICLE_PRESET_OPTIONS = [
  { id: "halloween", name: "🎃 Halloween & Spooky", icons: ["🎃", "🦇", "👻", "💀", "🕷️"], desc: "Bí ngô ma quái, dơi đêm, ma trơi và mạng nhện" },
  { id: "christmas", name: "❄️ Giáng Sinh & Mùa Đông Tuyết", icons: ["❄️", "🎄", "🔔", "🎁", "⛄", "🎅"], desc: "Bông tuyết trắng rơi, cây thông noel, chuông vàng, quà tặng" },
  { id: "sparkles", name: "✨ Kim Tuyến Lấp Lánh (Magic)", icons: ["✨", "🌟", "💖", "🔥", "💎", "⭐"], desc: "Ngôi sao lấp lánh, kim cương, trái tim phát sáng sang trọng" },
  { id: "autumn", name: "🍂 Mùa Thu Lá Vàng Rơi", icons: ["🍂", "🍁", "🎃", "🌾", "☕"], desc: "Lá phong đỏ, lá vàng mùa thu, ly cà phê ấm áp" },
  { id: "fireworks", name: "🔥 Pháo Hoa Lễ Hội & Năm Mới", icons: ["🎆", "🎇", "✨", "🎉", "🔥", "🥳"], desc: "Pháo hoa rực rỡ, tia lửa mừng năm mới và ngày lễ hội" },
  { id: "sakura", name: "🌸 Hoa Anh Đào Mùa Xuân", icons: ["🌸", "🌺", "✨", "🍃", "💮", "🌷"], desc: "Cánh hoa đào rơi nhẹ nhàng theo làn gió xuân" },
  { id: "sports", name: "🏈 Thể Thao Siêu Sao & Trận Đấu", icons: ["🏈", "🏆", "⚽", "⚡", "🔥"], desc: "Cúp vô địch, bóng bầu dục, bóng đá và lửa nhiệt huyết" },
  { id: "vintage", name: "🎸 Retro & Vintage Rock", icons: ["🎸", "📻", "🎙️", "⚡", "🖤"], desc: "Đàn guitar điện, đài cassette, micro cổ điển" },
];

export default function SettingsPage() {
  // Particle Settings State
  const [selectedTheme, setSelectedTheme] = useState("halloween");
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  const [particleCount, setParticleCount] = useState(16);
  const [customIconsInput, setCustomIconsInput] = useState("");
  const [savingParticles, setSavingParticles] = useState(false);
  const [particleSavedSuccess, setParticleSavedSuccess] = useState(false);

  // Shipping & Free Shipping Threshold State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(75);
  const [standardShippingRate, setStandardShippingRate] = useState(4.99);
  const [expressShippingRate, setExpressShippingRate] = useState(9.99);
  const [shippingBarEnabled, setShippingBarEnabled] = useState(true);
  const [shippingBannerText, setShippingBannerText] = useState("Free Express US Shipping on orders over $75!");
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingSavedSuccess, setShippingSavedSuccess] = useState(false);

  useEffect(() => {
    // Fetch current particle settings from Backend
    apiClient
      .get("/settings/particles")
      .then((res) => {
        if (res.data?.data) {
          const { activeTheme, defaultEnabled: defEn, count, customIcons } = res.data.data;
          setSelectedTheme(activeTheme || "halloween");
          setDefaultEnabled(defEn !== undefined ? defEn : true);
          setParticleCount(count || 16);
          if (customIcons && Array.isArray(customIcons)) {
            setCustomIconsInput(customIcons.join(", "));
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load particle settings:", err);
      });

    // Fetch current shipping settings from Backend
    apiClient
      .get("/settings/shipping")
      .then((res) => {
        if (res.data?.data) {
          const { freeShippingThreshold: fst, standardShippingRate: ssr, expressShippingRate: esr, enabled, bannerText } = res.data.data;
          if (fst !== undefined) setFreeShippingThreshold(fst);
          if (ssr !== undefined) setStandardShippingRate(ssr);
          if (esr !== undefined) setExpressShippingRate(esr);
          if (enabled !== undefined) setShippingBarEnabled(enabled);
          if (bannerText !== undefined) setShippingBannerText(bannerText);
        }
      })
      .catch((err) => {
        console.warn("Could not load shipping settings:", err);
      });
  }, []);

  const handleSaveShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShipping(true);
    setShippingSavedSuccess(false);

    try {
      await apiClient.post("/settings/shipping", {
        freeShippingThreshold: Number(freeShippingThreshold),
        standardShippingRate: Number(standardShippingRate),
        expressShippingRate: Number(expressShippingRate),
        enabled: shippingBarEnabled,
        bannerText: shippingBannerText,
      });

      setShippingSavedSuccess(true);
      setTimeout(() => setShippingSavedSuccess(false), 3500);
      alert("✅ Đã lưu cấu hình Ngưỡng Miễn Phí Vận Chuyển & Phí Ship thành công!");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình vận chuyển!");
    } finally {
      setSavingShipping(false);
    }
  };

  const handleSaveParticleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingParticles(true);
    setParticleSavedSuccess(false);

    try {
      let customIcons: string[] | null = null;
      if (customIconsInput.trim()) {
        customIcons = customIconsInput
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
      }

      await apiClient.post("/settings/particles", {
        activeTheme: selectedTheme,
        defaultEnabled,
        count: Number(particleCount),
        customIcons,
      });

      setParticleSavedSuccess(true);
      setTimeout(() => setParticleSavedSuccess(false), 3500);
      alert("✅ Đã lưu cấu hình hiệu ứng hạt mùa thành công! Người dùng vào website sẽ nhận ngay hiệu ứng này.");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình hiệu ứng!");
    } finally {
      setSavingParticles(false);
    }
  };

  const currentPreset = PARTICLE_PRESET_OPTIONS.find((p) => p.id === selectedTheme) || PARTICLE_PRESET_OPTIONS[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Cài Đặt & Cấu Hình Hệ Thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hiệu ứng animation mùa toàn website và cấu hình chính sách phí vận chuyển / Free Shipping.
          </p>
        </div>
      </div>

      {/* Quick Link Card to Header Announcements Marquee */}
      <Link
        href="/announcements"
        className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border-2 border-orange-200 hover:border-orange-400 transition-all flex items-center justify-between gap-4 group shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7700] text-black flex items-center justify-center font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Megaphone size={24} />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 flex items-center gap-2 group-hover:text-[#ff7700] transition-colors">
              📢 Quản Lý Chữ Chạy Header (Top Bar Announcements)
              <span className="px-2 py-0.5 rounded-full bg-[#ff7700] text-black text-[10px] font-black uppercase">
                Mới
              </span>
            </span>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Tùy biến các khẩu hiệu giảm giá, miễn phí ship, quà tặng trên thanh cuộn chạy chữ ở đầu website với kho mẫu gợi ý 1-click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-extrabold text-orange-600 group-hover:translate-x-1 transition-transform shrink-0">
          <span>Tùy Chỉnh Ngay</span>
          <ArrowRight size={15} />
        </div>
      </Link>

      {/* =========================================================================
          SECTION 1: SEASONAL PARTICLE ANIMATION MANAGER
          ========================================================================= */}
      <form onSubmit={handleSaveParticleSettings} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff7700]" />
              1. Cấu Hình Hiệu Ứng Rơi Theo Mùa Toàn Website (Seasonal Particles)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin chọn chủ đề hiệu ứng mùa (Halloween, Giáng Sinh, Năm Mới, Mùa Thu,...). Khách hàng có nút Bật/Tắt ngay trên thanh Header để trải nghiệm.
            </p>
          </div>

          {particleSavedSuccess && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={13} /> Đã áp dụng thành công
            </span>
          )}
        </div>

        {/* Preset Cards Grid */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
            Chọn Chủ Đề Hiệu Ứng Mùa Đang Áp Dụng:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARTICLE_PRESET_OPTIONS.map((preset) => {
              const isSelected = selectedTheme === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedTheme(preset.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-600/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      {preset.name}
                    </h3>
                    <input
                      type="radio"
                      name="particle_theme"
                      checked={isSelected}
                      onChange={() => setSelectedTheme(preset.id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-1 font-medium">{preset.desc}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-lg">
                    {preset.icons.map((ic, i) => (
                      <span key={i} className="p-1 rounded bg-slate-100/80">{ic}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intensity & Default Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Mật Độ Số Lượng Hạt Rơi</label>
            <select
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold outline-none"
            >
              <option value={10}>🌱 Nhẹ nhàng (10 hạt) - Tối ưu máy cấu hình thấp</option>
              <option value={16}>⚡ Tiêu chuẩn (16 hạt) - Đẹp mắt & mượt mà</option>
              <option value={24}>🎆 Rực rỡ & Đậm nét (24 hạt) - Không khí lễ hội sôi động</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Trạng Thái Mặc Định Cho Khách Mới</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-medium text-slate-700">Mặc định bật hiệu ứng khi khách mới vào shop</span>
              <input
                type="checkbox"
                checked={defaultEnabled}
                onChange={(e) => setDefaultEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-slate-950 text-white rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles size={14} /> Xem Trước Bộ Icon Đang Chọn:
            </span>
            <span className="font-mono text-amber-500 font-bold">{currentPreset.name}</span>
          </div>
          <div className="flex items-center gap-3 text-2xl py-2">
            {currentPreset.icons.map((ic, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                {ic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingParticles}
            className="px-6 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06900] text-black font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {savingParticles ? "Đang lưu..." : "Lưu & Áp Dụng Hiệu Ứng Toàn Shop"}
          </button>
        </div>
      </form>

      {/* =========================================================================
          SECTION 2: SHIPPING RATES & FREE SHIPPING THRESHOLD MANAGER
          ========================================================================= */}
      <form onSubmit={handleSaveShippingSettings} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              2. Cấu Hình Phí Vận Chuyển & Ngưỡng Miễn Phí Ship (Free Shipping Threshold)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cài đặt mức chi tiêu tối thiểu để khách được Free Ship và phí ship mặc định nội địa Mỹ.
            </p>
          </div>

          {shippingSavedSuccess && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={13} /> Đã lưu thành công
            </span>
          )}
        </div>

        {/* Strategy Advice Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Gợi Ý Mức Ngưỡng Tối Ưu Lợi Nhuận:
            </span>
            <span className="bg-blue-600 text-white font-mono font-black text-[10px] px-2.5 py-0.5 rounded-full">
              KHUYÊN DÙNG: $70.00 – $75.00
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            Mốc <strong>$75.00</strong> tương đương <strong>3 chiếc áo thun</strong> (hoặc 1 áo thun + 1 hoodie). Khi khách có 2 áo ($50), họ sẽ cố mua thêm chiếc thứ 3 để được Free Ship. Tiền lời từ chiếc áo thứ 3 sẽ mang lại cho bạn lợi nhuận ròng hơn <strong>$25.00/đơn</strong> mà không lo bị lỗ tiền ship!
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Ngưỡng Đơn Free Ship ($) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-blue-600 font-mono font-black text-base outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
            </div>
            <p className="text-[11px] text-slate-400">Đơn từ mức này trở lên sẽ tự động 0đ phí ship.</p>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Phí Ship Tiêu Chuẩn (Standard) ($)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={standardShippingRate}
                onChange={(e) => setStandardShippingRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold text-base outline-none focus:border-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
            </div>
            <p className="text-[11px] text-slate-400">Áp dụng khi đơn hàng dưới ngưỡng Free Ship.</p>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Phí Ship Hỏa Tốc (Express) ($)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={expressShippingRate}
                onChange={(e) => setExpressShippingRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold text-base outline-none focus:border-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
            </div>
            <p className="text-[11px] text-slate-400">Khách chọn giao nhanh 1-2 ngày.</p>
          </div>
        </div>

        {/* Toggle & Announcement Text */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Khẩu Hiệu / Banner Thông Báo
            </label>
            <input
              type="text"
              value={shippingBannerText}
              onChange={(e) => setShippingBannerText(e.target.value)}
              placeholder="e.g. Free Express US Shipping on orders over $75!"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Thanh Tiến Độ Free Shipping Trong Giỏ Hàng (Cart Drawer)</span>
              <span className="text-[11px] text-slate-500">Hiển thị thông báo "Add $XX more for Free Shipping" và thanh chạy % trong giỏ hàng.</span>
            </div>
            <input
              type="checkbox"
              checked={shippingBarEnabled}
              onChange={(e) => setShippingBarEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingShipping}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {savingShipping ? "Đang lưu..." : "Lưu Cấu Hình Free Shipping"}
          </button>
        </div>
      </form>
    </div>
  );
}

