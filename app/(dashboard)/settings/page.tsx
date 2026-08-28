"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Server, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sparkles, 
  Flame, 
  CheckCircle2 
} from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
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
  const { apiKey, setApiKey } = useAdminAuthStore();

  const [apiUrl, setApiUrl] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("custom_api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
      : "http://localhost:5000/api/v1"
  );
  const [currentKey, setCurrentKey] = useState(apiKey || process.env.NEXT_PUBLIC_ADMIN_API_KEY || "velora_admin_secret_api_key_2026");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Particle Settings State
  const [selectedTheme, setSelectedTheme] = useState("halloween");
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  const [particleCount, setParticleCount] = useState(16);
  const [customIconsInput, setCustomIconsInput] = useState("");
  const [savingParticles, setSavingParticles] = useState(false);
  const [particleSavedSuccess, setParticleSavedSuccess] = useState(false);

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
  }, []);

  const handleSaveBackend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKey) {
      alert("Vui lòng nhập Admin API Key!");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("custom_api_url", apiUrl);
    }
    setApiKey(currentKey);

    alert("Đã lưu và bảo mật cấu hình kết nối thành công!");
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

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Quản lý hiệu ứng animation mùa toàn website, kết nối REST API Gateway và bảo mật Admin API Key.
          </p>
        </div>
      </div>

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
          SECTION 2: BACKEND CONNECTION & API KEY
          ========================================================================= */}
      {/* Security Protection Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-amber-950">Cảnh Báo Bảo Mật Admin API Key:</p>
          <p className="text-amber-800 leading-relaxed font-medium">
            Admin API Key (`X-Admin-API-Key`) là chìa khóa bí mật dùng để xác thực mọi yêu cầu từ giao diện Admin tới máy chủ Backend Gateway.
            Để ngăn chặn rò rỉ khi quay video hoặc chia sẻ màn hình, chìa khóa này được <strong>ẨN MẶC ĐỊNH (`••••••••••••`)</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveBackend} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Server className="w-4 h-4" /> 2. Kết Nối Backend REST API Gateway
        </h2>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">URL Endpoint REST API (sales-website-be)</label>
            <input
              type="text"
              required
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Admin API Key (`X-Admin-API-Key`) *</span>
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Đã bật chế độ bảo vệ ẩn Key
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                required
                value={showKey ? currentKey : "••••••••••••••••••••••••"}
                onChange={(e) => {
                  setCurrentKey(e.target.value);
                  if (!showKey) setShowKey(true);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-24 py-2.5 text-emerald-700 font-mono font-extrabold text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                  title={showKey ? "Ẩn mã bí mật" : "Hiện mã bí mật"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                  {showKey ? "Ẩn Key" : "Hiện Key"}
                </button>

                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm cursor-pointer"
                  title="Sao chép Key"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> 3. Tiêu Chuẩn Mã Hóa & Bảo Mật Hệ Thống
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 font-medium">
          <p>✔️ <strong>API Key Concealment:</strong> Khóa API bí mật được ẩn hoàn toàn dạng mật khẩu (`••••••••••••`), chống chụp màn hình / dòm ngó.</p>
          <p>✔️ <strong>Data-at-Rest Decryption:</strong> Giải mã AES-256-GCM các thông tin nhạy cảm (Số điện thoại, Địa chỉ, Số tiền) trên giao diện.</p>
          <p>✔️ <strong>Strict Session Protection:</strong> Tự động chặn các yêu cầu không hợp lệ và bảo vệ phiên làm việc người dùng.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer">
            <Save className="w-4 h-4" /> Lưu & Áp Dụng Cấu Hình Kết Nối
          </button>
        </div>
      </form>
    </div>
  );
}

