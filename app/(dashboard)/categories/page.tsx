"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Tag,
  Package,
  Layers,
  ChevronRight
} from "lucide-react";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks/useCategories";
import { Category } from "@/types/product";

const POPULAR_EMOJIS = ["🎃", "🎄", "🔥", "❄️", "💀", "🎸", "🎁", "✨", "🤠", "🏈", "🌺", "👕", "⭐", "⚡", "🛍️", "🏷️"];

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Active Main Tab: 'trends' | 'categories'
  const [activeTab, setActiveTab] = useState<"trends" | "categories">("trends");

  // Create Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("🔥");
  const [badgeText, setBadgeText] = useState("");
  const [isTrendingMenu, setIsTrendingMenu] = useState(true);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editBadgeText, setEditBadgeText] = useState("");
  const [editIsTrendingMenu, setEditIsTrendingMenu] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/^[^\w\s]+\s*/, "") // Strip leading emojis for clean slug
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      await createMutation.mutateAsync({ 
        name: name.trim(), 
        slug: slug.trim(), 
        icon: icon.trim() || null,
        badgeText: badgeText.trim() || null,
        isTrendingMenu,
        menuOrder: categories.length + 1
      });
      alert(isTrendingMenu ? "Thêm Menu Trend mới lên Header thành công!" : "Tạo danh mục sản phẩm mới thành công!");
      setName("");
      setSlug("");
      setIcon("🔥");
      setBadgeText("");
      setIsTrendingMenu(true);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Lỗi tạo danh mục!");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName || !editSlug) return;

    try {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        data: { 
          name: editName.trim(), 
          slug: editSlug.trim(),
          icon: editIcon.trim() || null,
          badgeText: editBadgeText.trim() || null,
          isTrendingMenu: editIsTrendingMenu
        },
      });
      alert("Cập nhật thông tin thành công!");
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật danh mục!");
    }
  };

  const handleToggleTrendMenu = async (category: Category) => {
    const nextState = !category.isTrendingMenu;
    const actionText = nextState ? "GHIM LÊN" : "HỦY GHIM KHỎI";

    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { isTrendingMenu: nextState },
      });
      alert(`Đã ${actionText} thanh Menu Trend Header thành công!`);
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái Menu!");
    }
  };

  const handleMoveOrder = async (category: Category, direction: "up" | "down") => {
    const trendList = categories.filter((c) => c.isTrendingMenu).sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));
    const currentIndex = trendList.findIndex((c) => c.id === category.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= trendList.length) return;

    const targetCat = trendList[targetIndex];
    const currentOrder = category.menuOrder || 0;
    const targetOrder = targetCat.menuOrder || 0;

    try {
      await Promise.all([
        updateMutation.mutateAsync({ id: category.id, data: { menuOrder: targetOrder } }),
        updateMutation.mutateAsync({ id: targetCat.id, data: { menuOrder: currentOrder } }),
      ]);
    } catch (err: any) {
      alert("Lỗi đổi thứ tự menu!");
    }
  };

  const handleToggleHide = async (category: Category) => {
    const nextHiddenState = !category.isHidden;
    const actionText = nextHiddenState ? "ẨN" : "HIỂN THỊ";
    const confirmMsg = nextHiddenState
      ? `Bạn có chắc muốn ${actionText} danh mục "${category.name}"?\nTất cả sản phẩm thuộc danh mục này sẽ tự động bị VÔ HIỆU HÓA cho tới khi mở lại danh mục!`
      : `Bật lại danh mục "${category.name}" và KÍCH HOẠT LẠI tất cả sản phẩm liên quan?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { isHidden: nextHiddenState },
      });
      alert(`Đã ${actionText} danh mục thành công!`);
    } catch (err: any) {
      alert(err.message || `Lỗi ${actionText} danh mục!`);
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn XÓA danh mục "${category.name}"?\n\n⚠️ LƯU Ý: Các sản phẩm thuộc danh mục này sẽ bị VÔ HIỆU HÓA (chưa chọn danh mục) cho tới khi bạn chọn lại danh mục mới cho từng sản phẩm!`
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
      alert(`Đã xóa danh mục "${category.name}". Các sản phẩm liên quan đã được vô hiệu hóa an toàn!`);
    } catch (err: any) {
      alert(err.message || "Lỗi xóa danh mục!");
    }
  };

  const trendingCategories = categories
    .filter((c) => c.isTrendingMenu)
    .sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-[#ff7700]" />
            Quản Lý Menu Trend & Danh Mục Sản Phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Linh hoạt ghim, chỉnh sửa và tạo mới các mục Menu Trend theo mùa (Halloween, Giáng Sinh / Christmas, Black Friday, Summer,...) hiển thị trực tiếp trên thanh Header website khách hàng.
          </p>
        </div>

        <button
          onClick={() => {
            setIsTrendingMenu(activeTab === "trends");
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {activeTab === "trends" ? "+ Thêm Menu Trend Mới" : "+ Thêm Danh Mục Mới"}
        </button>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("trends")}
          className={`pb-3.5 px-2 text-sm font-extrabold flex items-center gap-2 transition relative ${
            activeTab === "trends"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Flame className="w-4 h-4 text-[#ff7700]" />
          <span>🔥 Menu Trend Trên Header ({trendingCategories.length} menu đang ghim)</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3.5 px-2 text-sm font-extrabold flex items-center gap-2 transition relative ${
            activeTab === "categories"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FolderTree className="w-4 h-4 text-slate-600" />
          <span>📁 Tất Cả Danh Mục Sản Phẩm ({categories.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TREND MENU HEADER MANAGEMENT
          ========================================================================= */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Live Storefront Preview Box */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles size={14} /> Xem Trước Thanh Menu Header Khách Hàng (Live Preview Storefront)
              </span>
              <span>Website: http://localhost:3000</span>
            </div>

            {/* Simulated Header Navigation Bar */}
            <div className="bg-[#0c0c0c] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold">
              <span className="text-slate-300">Shop All</span>
              
              {trendingCategories.length === 0 ? (
                <span className="text-slate-500 italic">(Chưa có menu trend nào được ghim. Bấm "+ Thêm Menu Trend Mới" bên dưới)</span>
              ) : (
                trendingCategories.map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 text-[#ff7700] font-extrabold bg-[#ff7700]/10 px-3 py-1 rounded-lg border border-[#ff7700]/30 shadow-sm animate-in fade-in duration-200">
                    <span className="text-base">{t.icon || "🔥"}</span>
                    <span>{t.name.replace(/^[^\w\s]+\s*/, "")}</span>
                    {t.badgeText && (
                      <span className="bg-[#a80000] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        {t.badgeText}
                      </span>
                    )}
                  </div>
                ))
              )}

              <span className="text-slate-300 flex items-center gap-1">Collections ▾</span>
              <span className="text-slate-300 flex items-center gap-1">Product Types ▾</span>
              <span className="text-slate-300">Track Order</span>
            </div>
          </div>

          {/* Trending Categories Cards / Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ff7700]" /> Danh Sách Menu Trend Đang Hiển Thị Trên Header
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Sắp xếp thứ tự hoặc chỉnh sửa nội dung menu trend. Bấm vào nút sản phẩm để quản lý các mẫu áo theo trend đó.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsTrendingMenu(true);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Thêm Trend Mới (VD: Christmas, Summer...)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4 text-center w-16">Thứ Tự</th>
                    <th className="p-4">Icon & Tên Menu Trend</th>
                    <th className="p-4">Huy Hiệu (Badge)</th>
                    <th className="p-4">Đường Dẫn FE (/collections/...)</th>
                    <th className="p-4">Sản Phẩm Trong Trend</th>
                    <th className="p-4 text-right">Hành Động Quản Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        Đang nạp menu trend từ Database...
                      </td>
                    </tr>
                  ) : trendingCategories.length > 0 ? (
                    trendingCategories.map((c, idx) => {
                      const productCount = c._count?.products ?? c.products?.length ?? 0;
                      const isHidden = Boolean(c.isHidden);

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          {/* Order Stepper */}
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => handleMoveOrder(c, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Di chuyển lên trước"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <span className="font-mono text-xs font-extrabold text-blue-600">{idx + 1}</span>
                              <button
                                onClick={() => handleMoveOrder(c, "down")}
                                disabled={idx === trendingCategories.length - 1}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Di chuyển xuống sau"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          </td>

                          {/* Menu Name & Icon */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 rounded-xl bg-amber-50 border border-amber-200">{c.icon || "🔥"}</span>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-base">{c.name}</h4>
                                <span className="text-xs text-slate-500 font-mono font-medium">ID: {c.id.substring(0, 8)}...</span>
                              </div>
                            </div>
                          </td>

                          {/* Badge Text */}
                          <td className="p-4">
                            {c.badgeText ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider">
                                {c.badgeText}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Không có</span>
                            )}
                          </td>

                          {/* Slug / Link */}
                          <td className="p-4">
                            <a
                              href={`http://localhost:3000/collections/${c.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              /collections/{c.slug} <ExternalLink size={12} />
                            </a>
                          </td>

                          {/* Product Count & Jump */}
                          <td className="p-4">
                            <Link
                              href={`/products`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold transition"
                            >
                              <Package size={13} />
                              <span>{productCount} sản phẩm</span>
                            </Link>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingCategory(c);
                                  setEditName(c.name);
                                  setEditSlug(c.slug);
                                  setEditIcon(c.icon || "🔥");
                                  setEditBadgeText(c.badgeText || "");
                                  setEditIsTrendingMenu(Boolean(c.isTrendingMenu));
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1"
                                title="Sửa tên, icon, badge"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Sửa Menu
                              </button>

                              {/* Unpin Button */}
                              <button
                                onClick={() => handleToggleTrendMenu(c)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition"
                                title="Hủy ghim khỏi Menu Header"
                              >
                                ✕ Bỏ Ghim
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        Chưa có menu trend nào được ghim. Bấm "+ Thêm Menu Trend Mới" để tạo trend (Christmas, Halloween, ...).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ALL CATEGORIES MANAGEMENT
          ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Quy tắc bảo vệ sản phẩm:</strong> Nếu một danh mục bị <strong>ẨN</strong> hoặc <strong>XÓA</strong>, tất cả sản phẩm thuộc danh mục đó sẽ lập tức chuyển sang trạng thái <strong>Vô hiệu hóa (Locked)</strong> cho tới khi danh mục được bật lại hoặc sản phẩm được gán sang danh mục mới.
            </span>
          </div>

          {/* Categories Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4">Tên Danh Mục & Icon</th>
                    <th className="p-4">Slug Đường Dẫn</th>
                    <th className="p-4">Ghim Menu Trend Header</th>
                    <th className="p-4">Trạng Thái (Status)</th>
                    <th className="p-4">Số Sản Phẩm</th>
                    <th className="p-4 text-right">Thao Tác Quản Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        Đang nạp danh mục sản phẩm từ Database...
                      </td>
                    </tr>
                  ) : categories.length > 0 ? (
                    categories.map((c) => {
                      const productCount = c._count?.products ?? c.products?.length ?? 0;
                      const isHidden = Boolean(c.isHidden);
                      const isTrend = Boolean(c.isTrendingMenu);

                      return (
                        <tr key={c.id} className={`hover:bg-slate-50 transition ${isHidden ? "bg-slate-50/60" : ""}`}>
                          <td className="p-4 font-bold text-slate-900 text-base">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl p-1.5 rounded-lg bg-blue-50 border border-blue-100">{c.icon || "🏷️"}</span>
                              <span>{c.name}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs text-blue-600 font-bold">{c.slug}</td>

                          {/* Ghim Trend Toggle */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleTrendMenu(c)}
                              className={`px-3 py-1 rounded-full font-extrabold text-xs inline-flex items-center gap-1.5 transition ${
                                isTrend
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              <Flame size={13} className={isTrend ? "text-[#ff7700]" : "text-slate-400"} />
                              <span>{isTrend ? "Đang Ghim Header 🔥" : "+ Ghim Header"}</span>
                            </button>
                          </td>

                          <td className="p-4">
                            {isHidden ? (
                              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-xs inline-flex items-center gap-1">
                                <EyeOff className="w-3.5 h-3.5" /> Đã Ẩn (Sp bị khóa)
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt Động
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-extrabold text-slate-800 text-base font-mono">
                            {productCount} sản phẩm
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Hide/Show Button */}
                              <button
                                onClick={() => handleToggleHide(c)}
                                className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition flex items-center gap-1 ${
                                  isHidden
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white"
                                }`}
                                title={isHidden ? "Hiện lại danh mục" : "Ẩn danh mục"}
                              >
                                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                {isHidden ? "Hiện" : "Ẩn"}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingCategory(c);
                                  setEditName(c.name);
                                  setEditSlug(c.slug);
                                  setEditIcon(c.icon || "🏷️");
                                  setEditBadgeText(c.badgeText || "");
                                  setEditIsTrendingMenu(Boolean(c.isTrendingMenu));
                                }}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                                title="Sửa danh mục"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                                title="Xóa danh mục"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        Chưa có danh mục nào trong Database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW CATEGORY / TREND MENU
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#ff7700]" /> Thêm Danh Mục / Menu Trend Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên Danh Mục / Menu Trend *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: 🎄 Christmas Deals hoặc 🎃 Halloween & Spooky"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug Đường Dẫn (/collections/[slug]) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="christmas hoặc halloween"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Icon Emoji (Chọn nhanh)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="🎄"
                      className="w-16 text-center text-xl bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 font-bold"
                    />
                    <div className="flex-1 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {POPULAR_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIcon(em)}
                          className="w-7 h-7 text-sm rounded bg-slate-100 hover:bg-amber-100 transition"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Huy Hiệu Tag (Tùy chọn)</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="HOT, NEW, SALE, -20%"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Ghim Lên Header */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <Flame size={14} className="text-[#ff7700]" /> Ghim lên thanh Menu Header của website
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Khách hàng sẽ nhìn thấy mục này ngay cạnh nút "Shop All".</p>
                </div>
                <input
                  type="checkbox"
                  checked={isTrendingMenu}
                  onChange={(e) => setIsTrendingMenu(e.target.checked)}
                  className="w-5 h-5 accent-[#ff7700] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                  Tạo Mới & Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT CATEGORY / TREND MENU
          ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Cập Nhật Menu Trend / Danh Mục
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên Menu / Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug Đường Dẫn (/collections/[slug]) *</label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Icon Emoji</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="w-16 text-center text-xl bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 font-bold"
                    />
                    <div className="flex-1 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {POPULAR_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setEditIcon(em)}
                          className="w-7 h-7 text-sm rounded bg-slate-100 hover:bg-amber-100 transition"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Huy Hiệu (Badge Tag)</label>
                  <input
                    type="text"
                    value={editBadgeText}
                    onChange={(e) => setEditBadgeText(e.target.value)}
                    placeholder="HOT, NEW, SALE, -20%"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Ghim Lên Header */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <Flame size={14} className="text-[#ff7700]" /> Ghim lên thanh Menu Header của website
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Hiển thị nổi bật trên thanh Navigation Bar của khách hàng.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editIsTrendingMenu}
                  onChange={(e) => setEditIsTrendingMenu(e.target.checked)}
                  className="w-5 h-5 accent-[#ff7700] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

