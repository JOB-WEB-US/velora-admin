"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Eye, 
  RefreshCw,
  ExternalLink,
  MoveUp,
  MoveDown,
  Sparkle
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguageStore } from "@/store/useLanguageStore";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const PRESET_TEMPLATES = [
  {
    title: "HALLOWEEN SPOOKY SPECIAL 🎃",
    subtitle: "Exclusive Horror Movie Tees & Spooky Apparel On Sale",
    imageUrl: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1600&q=80",
    buttonText: "Shop Halloween Now",
    linkUrl: "/collections/halloween",
  },
  {
    title: "VINTAGE 80s & 90s GRAPHIC TEES 📻",
    subtitle: "Classic Band Merch, Heavy Metal & Retro Streetwear",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&q=80",
    buttonText: "Explore Vintage",
    linkUrl: "/collections/vintage",
  },
  {
    title: "BLACK FRIDAY SUPER SALE — UP TO 50% OFF 🔥",
    subtitle: "Limited Time Door-Buster Deals on Premium Hoodies & Sweatshirts",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    buttonText: "Claim Deals Now",
    linkUrl: "/shop?onlySale=true",
  },
  {
    title: "WINTER & CHRISTMAS WONDERLAND ❄️",
    subtitle: "Cozy Heavyweight Hoodies & Holiday Graphic Apparel",
    imageUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1600&q=80",
    buttonText: "Shop Holiday Collection",
    linkUrl: "/collections/christmas",
  },
];

export default function BannersPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "Shop Now",
    linkUrl: "/shop",
    isActive: true,
    order: 1,
  });

  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/banners/admin");
      if (res.data?.data) {
        setBanners(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1600&q=80",
      buttonText: "Shop Now",
      linkUrl: "/shop",
      isActive: true,
      order: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive,
      order: banner.order,
    });
    setIsModalOpen(true);
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      subtitle: preset.subtitle,
      imageUrl: preset.imageUrl,
      buttonText: preset.buttonText,
      linkUrl: preset.linkUrl,
    }));
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert(isVi ? "Vui lòng điền Tiêu đề và Link ảnh banner!" : "Please provide a Title and Banner Image URL!");
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        await apiClient.put(`/banners/${editingBanner.id}`, formData);
        alert(isVi ? "✅ Cập nhật banner thành công!" : "✅ Banner updated successfully!");
      } else {
        await apiClient.post("/banners", formData);
        alert(isVi ? "✅ Tạo banner mới thành công!" : "✅ New banner created successfully!");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi khi lưu banner!" : "Error saving banner!"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await apiClient.patch(`/banners/${banner.id}/toggle`, {});
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi cập nhật trạng thái!" : "Error updating status!"));
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(isVi ? `Bạn có chắc muốn xóa banner "${banner.title}"?` : `Are you sure you want to delete banner "${banner.title}"?`)) return;

    try {
      await apiClient.delete(`/banners/${banner.id}`);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      alert(isVi ? "✅ Đã xóa banner thành công!" : "✅ Banner deleted successfully!");
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi khi xóa banner!" : "Error deleting banner!"));
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-[#ff7700]" />
            {isVi ? "Quản Lý Banner Trang Chủ (Hero Slider)" : "Home Banner Management (Hero Slider)"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isVi 
              ? "Tùy biến các slide ảnh lớn, khẩu hiệu khuyến mãi và nút bấm điều hướng xuất hiện ở đầu trang chủ shop."
              : "Customize large hero image slides, promotional taglines, and call-to-action buttons on the storefront."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title={isVi ? "Làm mới dữ liệu" : "Refresh data"}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06800] text-black font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> {isVi ? "Thêm Banner Mới" : "Add New Banner"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{isVi ? "Tổng Số Banners" : "Total Banners"}</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{banners.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{isVi ? "Đang Hiển Thị Ngoài Shop" : "Active On Storefront"}</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{activeCount} {isVi ? "slide" : "slides"}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{isVi ? "Thời Gian Chuyển Slide" : "Slide Interval"}</span>
            <span className="text-2xl font-black text-orange-600 mt-1 block">{isVi ? "6 Giây" : "6 Seconds"}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff7700] flex items-center justify-center font-bold">
            <Sparkle size={20} />
          </div>
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            {isVi ? `Danh Sách Slide Banners (${banners.length})` : `Banner Slides List (${banners.length})`}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {isVi ? "(Thứ tự từ nhỏ đến lớn sẽ chạy lần lượt trên web)" : "(Lower order numbers appear first in the carousel)"}
          </span>
        </div>

        {loading ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-medium animate-pulse">
            {isVi ? "Đang tải dữ liệu banners..." : "Loading banner slides..."}
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">{isVi ? "Chưa có banner nào được tạo" : "No banners created yet"}</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700"
            >
              {isVi ? "+ Tạo Slide Đầu Tiên" : "+ Create First Slide"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-white ${
                  b.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
                }`}
              >
                {/* Visual Banner Preview Window */}
                <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-between">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-black/70 backdrop-blur text-white text-[10px] font-black rounded-lg border border-white/20">
                        {isVi ? `Thứ Tự: #${b.order}` : `Order: #${b.order}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.8 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          b.isActive
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {b.isActive ? (isVi ? "● Đang Bật" : "● Active") : (isVi ? "○ Tạm Ẩn" : "○ Inactive")}
                      </span>
                    </div>

                    {/* Bottom Content Preview */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white font-heading leading-tight drop-shadow">
                        {b.title}
                      </h3>
                      {b.subtitle && (
                        <p className="text-xs text-slate-200 mt-1 line-clamp-1 drop-shadow">
                          {b.subtitle}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#a80000] text-white text-[10px] font-bold rounded-lg shadow">
                          {b.buttonText}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono flex items-center gap-0.5">
                          🔗 {b.linkUrl}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        b.isActive
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {b.isActive ? (isVi ? "Tạm Ẩn Slide" : "Deactivate") : (isVi ? "Kích Hoạt Slide" : "Activate")}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition cursor-pointer"
                      title={isVi ? "Chỉnh sửa banner" : "Edit banner"}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition cursor-pointer"
                      title={isVi ? "Xóa banner" : "Delete banner"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingBanner ? (isVi ? "Chỉnh Sửa Banner Slide" : "Edit Banner Slide") : (isVi ? "Tạo Banner Slide Mới" : "Create New Banner Slide")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isVi ? "Điền các thông tin để banner hiển thị đẹp và chuẩn tỉ lệ trên Storefront." : "Provide slide details for proper rendering and aspect ratio on the storefront."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* 1-Click Preset Template Bar */}
            {!editingBanner && (
              <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  {isVi ? "✨ Chọn Nhanh Mẫu Banner Mùa Lễ Hội:" : "✨ Quick Preset Holiday Templates:"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(tpl)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#ff7700] hover:text-[#ff7700] text-left text-[11px] font-bold text-slate-700 transition shadow-sm truncate"
                    >
                      {tpl.title.split(" ")[0]} {tpl.title.split(" ")[1]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  {isVi ? "Tiêu Đề Chính (Headline) *" : "Headline Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isVi ? "Ví dụ: HALLOWEEN COLLECTION 2026" : "e.g. HALLOWEEN COLLECTION 2026"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold outline-none focus:border-[#ff7700] focus:bg-white"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  {isVi ? "Phụ Đề / Khẩu Hiệu (Subtitle)" : "Subtitle / Tagline"}
                </label>
                <input
                  type="text"
                  placeholder={isVi ? "Ví dụ: Spooky & Horror Graphic Apparel Made For Halloween Night" : "e.g. Spooky & Horror Graphic Apparel Made For Halloween Night"}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium outline-none focus:border-[#ff7700] focus:bg-white"
                />
              </div>

              {/* Image URL with live preview */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  {isVi ? "Đường Link Ảnh Banner (Image URL) *" : "Banner Image URL *"}
                </label>
                <input
                  type="url"
                  required
                  placeholder={isVi ? "https://images.unsplash.com/... hoặc link ảnh cdn" : "https://images.unsplash.com/... or CDN image URL"}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-[#ff7700] focus:bg-white"
                />
                {formData.imageUrl && (
                  <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold">
                      Live Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Button Text & Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">
                    {isVi ? "Chữ Trên Nút (CTA Button)" : "CTA Button Text"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? "Ví dụ: Shop Now, Khám Phá Ngay" : "e.g. Shop Now, Explore Trending"}
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold outline-none focus:border-[#ff7700]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">
                    {isVi ? "Link Điều Hướng (Target Link)" : "Target Link URL"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? "Ví dụ: /shop hoặc /collections/halloween" : "e.g. /shop or /collections/halloween"}
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono outline-none focus:border-[#ff7700]"
                  />
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">
                    {isVi ? "Thứ Tự Hiển Thị (Order)" : "Display Order"}
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
                    <span className="font-bold text-slate-800 block">{isVi ? "Kích Hoạt Slide" : "Activate Slide"}</span>
                    <span className="text-[11px] text-slate-500">{isVi ? "Hiển thị ngay trên Storefront" : "Display immediately on Storefront"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-[#ff7700] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  {isVi ? "Hủy Bỏ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06800] text-black font-extrabold shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (isVi ? "Đang lưu..." : "Saving...") : editingBanner ? (isVi ? "Cập Nhật Banner" : "Update Banner") : (isVi ? "Tạo Banner Mới" : "Create Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
