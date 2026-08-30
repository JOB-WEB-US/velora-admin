"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  Zap, 
  Truck, 
  ShieldCheck, 
  DollarSign, 
  Tag, 
  Eye,
  Award
} from "lucide-react";

interface BundleTier {
  id: string;
  quantity: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  badgeText: string;
  freeShipping: boolean;
  isPopular: boolean;
}

interface BundleConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  tiers: BundleTier[];
  recommendationStrategy: string;
}

const STRATEGY_PRESETS = [
  {
    id: "standard_apparel",
    name: "⭐ Chuẩn Vàng E-Commerce Mỹ (Khuyên Dùng)",
    description: "Tối ưu hóa lợi nhuận ròng cao nhất. Giữ giá 1 áo nguyên bản, chiết khấu nhẹ 2 áo (10%) và tặng Free Ship ở 3 áo (20%).",
    badge: "RECOMMENDED",
    tiers: [
      { id: "tier-1", quantity: 1, discountType: "percentage" as const, discountValue: 0, badgeText: "", freeShipping: false, isPopular: false },
      { id: "tier-2", quantity: 2, discountType: "percentage" as const, discountValue: 10, badgeText: "🔥 MOST POPULAR", freeShipping: false, isPopular: true },
      { id: "tier-3", quantity: 3, discountType: "percentage" as const, discountValue: 20, badgeText: "🏆 BEST VALUE • FREE SHIPPING", freeShipping: true, isPopular: false },
    ],
  },
  {
    id: "aggressive_volume",
    name: "🚀 Đẩy Mạnh Số Lượng / Xả Kho (Aggressive)",
    description: "Khuyến khích khách mua combo 3-4 áo cho gia đình/bạn bè với chiết khấu sâu hơn.",
    badge: "HIGH VOLUME",
    tiers: [
      { id: "tier-1", quantity: 1, discountType: "percentage" as const, discountValue: 0, badgeText: "", freeShipping: false, isPopular: false },
      { id: "tier-2", quantity: 2, discountType: "percentage" as const, discountValue: 15, badgeText: "🔥 POPULAR", freeShipping: false, isPopular: false },
      { id: "tier-3", quantity: 3, discountType: "percentage" as const, discountValue: 25, badgeText: "🏆 BEST VALUE • FREE SHIPPING", freeShipping: true, isPopular: true },
      { id: "tier-4", quantity: 4, discountType: "percentage" as const, discountValue: 30, badgeText: "💥 VIP FAMILY PACK", freeShipping: true, isPopular: false },
    ],
  },
  {
    id: "fixed_dollar",
    name: "💵 Giảm Giá Tiền Mặt Cố Định ($)",
    description: "Đánh vào tâm lý thấy rõ số tiền được bớt (ví dụ: bớt $5 khi mua 2 áo, bớt $12 khi mua 3 áo).",
    badge: "CASH OFF",
    tiers: [
      { id: "tier-1", quantity: 1, discountType: "fixed" as const, discountValue: 0, badgeText: "", freeShipping: false, isPopular: false },
      { id: "tier-2", quantity: 2, discountType: "fixed" as const, discountValue: 5, badgeText: "🔥 SAVE $5.00", freeShipping: false, isPopular: true },
      { id: "tier-3", quantity: 3, discountType: "fixed" as const, discountValue: 12, badgeText: "🏆 SAVE $12.00 • FREE SHIP", freeShipping: true, isPopular: false },
    ],
  },
];

export default function BundlesManagementPage() {
  const [config, setConfig] = useState<BundleConfig>({
    enabled: true,
    title: "Bundle & Save More!",
    subtitle: "Mix and match any colors & sizes. Volume discount automatically applied!",
    tiers: STRATEGY_PRESETS[0].tiers,
    recommendationStrategy: "standard_apparel",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewSize, setPreviewSize] = useState("L");
  const [previewSelectedTier, setPreviewSelectedTier] = useState(2); // Tier 2 default

  // Base price sample for preview calculations
  const sampleBasePrice = 24.99;

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/settings/bundles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConfig(data.data);
        }
      })
      .catch((err) => console.error("Failed to load bundle config:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyPreset = (preset: typeof STRATEGY_PRESETS[0]) => {
    setConfig({
      ...config,
      recommendationStrategy: preset.id,
      tiers: preset.tiers,
    });
  };

  const handleTierChange = (index: number, field: keyof BundleTier, value: any) => {
    const updatedTiers = [...config.tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setConfig({ ...config, tiers: updatedTiers });
  };

  const handleAddTier = () => {
    const nextQty = config.tiers.length > 0 ? config.tiers[config.tiers.length - 1].quantity + 1 : 1;
    const newTier: BundleTier = {
      id: `tier-${Date.now()}`,
      quantity: nextQty,
      discountType: "percentage",
      discountValue: 25,
      badgeText: `💥 BUY ${nextQty} PACK`,
      freeShipping: true,
      isPopular: false,
    };
    setConfig({ ...config, tiers: [...config.tiers, newTier] });
  };

  const handleRemoveTier = (index: number) => {
    if (config.tiers.length <= 1) {
      alert("Cần giữ ít nhất 1 mốc cấu hình!");
      return;
    }
    const updated = config.tiers.filter((_, i) => i !== index);
    setConfig({ ...config, tiers: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/v1/settings/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi lưu cấu hình.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-blue-600" /> Quản Lý Ưu Đãi Mua Nhiều (Bundle & Save)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập bảng giá chiết khấu theo số lượng (Volume Tiers) để tăng giá trị đơn hàng trung bình (AOV) và lợi nhuận ròng.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? "Đang Lưu..." : "Lưu Cấu Hình"}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Cấu hình Bundle & Save đã được cập nhật thành công và áp dụng trực tiếp lên cửa hàng!</span>
        </div>
      )}

      {/* =========================================================================
          STRATEGY & UNIT ECONOMICS BREAKDOWN GUIDE
          ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Phân Tích Chiến Lược Giá Tối Ưu (Unit Economics Analysis)
            </h2>
            <p className="text-xs text-slate-300 font-medium">Vì sao không cần tăng giá 1 áo mà shop vẫn lãi gấp nhiều lần khi khách mua 2-3 áo?</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Gói mua</th>
                <th className="py-3 px-4">Giá khách trả</th>
                <th className="py-3 px-4">Giá vốn in áo</th>
                <th className="py-3 px-4">Tiền chạy Ads (CAC)</th>
                <th className="py-3 px-4">Tiền Ship & Cổng thanh toán</th>
                <th className="py-3 px-4 text-emerald-400 font-black">LỢI NHUẬN RÒNG BỎ TÚI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">1 Áo (Giá gốc)</td>
                <td className="py-3.5 px-4 font-semibold">$24.99</td>
                <td className="py-3.5 px-4 text-slate-400">-$9.50</td>
                <td className="py-3.5 px-4 text-rose-400 font-bold">-$10.00</td>
                <td className="py-3.5 px-4 text-slate-400">-$4.49</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">$1.00 <span className="text-[10px] text-slate-400 font-normal">(Lãi mỏng)</span></td>
              </tr>
              <tr className="bg-blue-600/10">
                <td className="py-3.5 px-4 font-bold text-blue-400">2 Áo (Giảm 10%) 🔥</td>
                <td className="py-3.5 px-4 font-semibold">$44.98 <span className="text-[10px] text-slate-400">($22.49/áo)</span></td>
                <td className="py-3.5 px-4 text-slate-400">-$19.00</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">-$10.00 <span className="text-[10px] text-slate-400">(Không tốn thêm)</span></td>
                <td className="py-3.5 px-4 text-slate-400">-$5.98</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-base">$10.00 🚀 <span className="text-[10px] text-emerald-300 font-bold">(Lãi gấp 10 lần)</span></td>
              </tr>
              <tr className="bg-emerald-600/10">
                <td className="py-3.5 px-4 font-bold text-amber-400">3 Áo (Giảm 20% + Free Ship) 🏆</td>
                <td className="py-3.5 px-4 font-semibold">$59.97 <span className="text-[10px] text-slate-400">($19.99/áo)</span></td>
                <td className="py-3.5 px-4 text-slate-400">-$28.50</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">-$10.00 <span className="text-[10px] text-slate-400">(Không tốn thêm)</span></td>
                <td className="py-3.5 px-4 text-slate-400">-$6.47</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-base">$15.00 🚀 <span className="text-[10px] text-emerald-300 font-bold">(Lãi gấp 15 lần)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Tiết kiệm 100% chi phí Ads thứ 2:
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bạn không tốn thêm tiền quảng cáo để thuyết phục người khách đó mua thêm chiếc áo thứ 2 hoặc thứ 3.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" /> Tối ưu chi phí vận chuyển gộp:
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bưu điện tính phí ship theo trọng lượng gói hàng, chiếc áo thứ 2 và 3 chỉ tốn thêm ~$1.50 thay vì tính trọn $4.99 mỗi gói.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Khách hàng luôn hài lòng:
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Khách muốn mua 1 áo vẫn mua giá gốc bình thường ($24.99), khách mua combo cảm thấy được ưu đãi khủng.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1-CLICK PRESET TEMPLATES
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Chọn Mẫu Cấu Hình Tối Ưu (1-Click Presets)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Bấm chọn gói mẫu bên dưới để tự động điền các mốc giá chuẩn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STRATEGY_PRESETS.map((preset) => {
            const isCurrentActive = config.recommendationStrategy === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isCurrentActive
                    ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {preset.badge}
                    </span>
                    {isCurrentActive && (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle size={14} /> Đang chọn
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{preset.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{preset.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{preset.tiers.length} Mốc Tiers</span>
                  <span className="text-blue-600">Áp Dụng Mẫu →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE TIER BUILDER & LIVE PREVIEW GRID
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Config Builder Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Main Switches & Title */}
          <div className="space-y-4 pb-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Trạng Thái Widget Bundle & Save
                </label>
                <p className="text-xs text-slate-500">Bật để hiển thị khối ưu đãi này trên trang chi tiết sản phẩm.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  config.enabled
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {config.enabled ? "ĐANG BẬT (ACTIVE)" : "ĐÃ TẮT (OFF)"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tiêu đề Widget
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mô tả phụ
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tiers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Cấu Hình Các Mốc Số Lượng (Tiers)
              </span>
              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Thêm Mốc Mới
              </button>
            </div>

            <div className="space-y-3">
              {config.tiers.map((tier, idx) => (
                <div
                  key={tier.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                      Mốc #{idx + 1}: Mua {tier.quantity} Áo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                      title="Xóa mốc này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Số lượng áo
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.quantity}
                        onChange={(e) => handleTierChange(idx, "quantity", Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Loại giảm
                      </label>
                      <select
                        value={tier.discountType}
                        onChange={(e: any) => handleTierChange(idx, "discountType", e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Tiền mặt ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Mức giảm {tier.discountType === "percentage" ? "(%)" : "($)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={tier.discountValue}
                        onChange={(e) => handleTierChange(idx, "discountValue", Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-600 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Huy hiệu (Badge)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MOST POPULAR"
                        value={tier.badgeText}
                        onChange={(e) => handleTierChange(idx, "badgeText", e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Toggles: Free Shipping & Popular */}
                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={tier.freeShipping}
                        onChange={(e) => handleTierChange(idx, "freeShipping", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Tặng Free Shipping</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={tier.isPopular}
                        onChange={(e) => handleTierChange(idx, "isPopular", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Đánh dấu nổi bật (Highlight)</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Frontend Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" /> Xem Trước Giao Diện Trực Quan (Live Preview)
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Mô phỏng áo $24.99</span>
          </div>

          {/* Dark E-Commerce Product Box Mockup */}
          <div className="bg-[#141414] text-white p-5 rounded-3xl border border-[#282828] shadow-2xl space-y-4">
            
            {/* Header of widget */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-[#ff7700]" /> {config.title}
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Auto-Applied
                </span>
              </div>
              {config.subtitle && (
                <p className="text-[11px] text-gray-400 mt-1">{config.subtitle}</p>
              )}
            </div>

            {/* Tiers List in Product Page */}
            <div className="space-y-2.5">
              {config.tiers.map((tier) => {
                const isSelected = previewSelectedTier === tier.quantity;
                
                // Calculate prices
                const rawTotal = sampleBasePrice * tier.quantity;
                let discountedTotal = rawTotal;
                if (tier.discountType === "percentage") {
                  discountedTotal = rawTotal * (1 - tier.discountValue / 100);
                } else {
                  discountedTotal = Math.max(0, rawTotal - tier.discountValue);
                }
                const pricePerItem = discountedTotal / tier.quantity;
                const savings = rawTotal - discountedTotal;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setPreviewSelectedTier(tier.quantity)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#ff7700] bg-[#ff7700]/10 shadow-lg shadow-[#ff7700]/10"
                        : "border-[#282828] bg-[#1a1a1a] hover:border-[#383838]"
                    }`}
                  >
                    {/* Badge Pill */}
                    {tier.badgeText && (
                      <span className="absolute -top-2.5 right-3 bg-[#a80000] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                        {tier.badgeText}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Left: Radio + Qty */}
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#ff7700] bg-[#ff7700]" : "border-gray-500"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>

                        <div>
                          <div className="text-xs font-black text-white">
                            Buy {tier.quantity} {tier.quantity > 1 ? "Items" : "Item"}
                          </div>
                          {tier.discountValue > 0 && (
                            <div className="text-[10px] text-emerald-400 font-bold">
                              Save {tier.discountType === "percentage" ? `${tier.discountValue}%` : `$${tier.discountValue.toFixed(2)}`}
                              {tier.freeShipping && " • Free Shipping"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Total Price */}
                      <div className="text-right">
                        <div className="text-sm font-black text-[#ff7700]">
                          ${discountedTotal.toFixed(2)}
                        </div>
                        {tier.quantity > 1 && (
                          <div className="text-[10px] text-gray-400 font-medium">
                            (${pricePerItem.toFixed(2)}/each)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Savings summary in preview */}
            {previewSelectedTier > 1 && (
              <div className="p-3 bg-[#181818] border border-[#282828] rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Your Total Savings:</span>
                <span className="text-emerald-400 font-black">
                  +${((sampleBasePrice * previewSelectedTier) - (sampleBasePrice * previewSelectedTier * 0.9)).toFixed(2)} OFF
                </span>
              </div>
            )}

            {/* Add to Cart Action Preview */}
            <button
              type="button"
              className="w-full bg-[#ff7700] text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition"
            >
              Add {previewSelectedTier} Items to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
