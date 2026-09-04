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
import { useLanguageStore } from "@/store/useLanguageStore";

const POPULAR_EMOJIS = ["🎃", "🎄", "🔥", "❄️", "💀", "🎸", "🎁", "✨", "🤠", "🏈", "🌺", "👕", "⭐", "⚡", "🛍️", "🏷️"];

export default function CategoriesPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";

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
      alert(isTrendingMenu 
        ? (isVi ? "Thêm Menu Trend mới lên Header thành công!" : "New Trending Header Menu added successfully!")
        : (isVi ? "Tạo danh mục sản phẩm mới thành công!" : "New product category created successfully!"));
      setName("");
      setSlug("");
      setIcon("🔥");
      setBadgeText("");
      setIsTrendingMenu(true);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi tạo danh mục!" : "Error creating category!"));
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
      alert(isVi ? "Cập nhật thông tin thành công!" : "Category updated successfully!");
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi cập nhật danh mục!" : "Error updating category!"));
    }
  };

  const handleToggleTrendMenu = async (category: Category) => {
    const nextState = !category.isTrendingMenu;
    const actionText = nextState 
      ? (isVi ? "GHIM LÊN" : "PINNED TO") 
      : (isVi ? "HỦY GHIM KHỎI" : "UNPINNED FROM");

    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { isTrendingMenu: nextState },
      });
      alert(isVi 
        ? `Đã ${actionText} thanh Menu Trend Header thành công!` 
        : `Successfully ${actionText} Header Trending Menu!`);
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi cập nhật trạng thái Menu!" : "Error updating menu status!"));
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
      alert(isVi ? "Lỗi đổi thứ tự menu!" : "Error reordering menu!");
    }
  };

  const handleToggleHide = async (category: Category) => {
    const nextHiddenState = !category.isHidden;
    const actionText = nextHiddenState ? (isVi ? "ẨN" : "HIDE") : (isVi ? "HIỂN THỊ" : "SHOW");
    const confirmMsg = isVi 
      ? (nextHiddenState
          ? `Bạn có chắc muốn ẨN danh mục "${category.name}"?\nTất cả sản phẩm thuộc danh mục này sẽ tự động bị VÔ HIỆU HÓA cho tới khi mở lại danh mục!`
          : `Bật lại danh mục "${category.name}" và KÍCH HOẠT LẠI tất cả sản phẩm liên quan?`)
      : (nextHiddenState
          ? `Are you sure you want to HIDE category "${category.name}"?\nAll products in this category will be locked until restored!`
          : `Restore category "${category.name}" and re-activate related products?`);

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { isHidden: nextHiddenState },
      });
      alert(isVi ? `Đã ${actionText} danh mục thành công!` : `Category ${actionText} successfully!`);
    } catch (err: any) {
      alert(err.message || (isVi ? `Lỗi ${actionText} danh mục!` : `Error updating category visibility!`));
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmMsg = isVi
      ? `Bạn có chắc chắn muốn XÓA danh mục "${category.name}"?\n\n⚠️ LƯU Ý: Các sản phẩm thuộc danh mục này sẽ bị VÔ HIỆU HÓA (chưa chọn danh mục) cho tới khi bạn chọn lại danh mục mới cho từng sản phẩm!`
      : `Are you sure you want to DELETE category "${category.name}"?\n\n⚠️ NOTE: Products in this category will be safely unassigned until reassigned to a new category!`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
      alert(isVi 
        ? `Đã xóa danh mục "${category.name}". Các sản phẩm liên quan đã được vô hiệu hóa an toàn!` 
        : `Deleted category "${category.name}". Related products safely unassigned!`);
    } catch (err: any) {
      alert(err.message || (isVi ? "Lỗi xóa danh mục!" : "Error deleting category!"));
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
            {isVi ? "Quản Lý Menu Trend & Danh Mục Sản Phẩm" : "Seasonal Trend Menus & Product Categories"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isVi 
              ? "Linh hoạt ghim, chỉnh sửa và tạo mới các mục Menu Trend theo mùa (Halloween, Giáng Sinh / Christmas, Black Friday, Summer,...) hiển thị trực tiếp trên thanh Header website khách hàng."
              : "Pin, edit, and curate seasonal trend menus (Halloween, Christmas, Black Friday, Summer, etc.) directly on storefront header navigation."}
          </p>
        </div>

        <button
          onClick={() => {
            setIsTrendingMenu(activeTab === "trends");
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {activeTab === "trends" 
            ? (isVi ? "+ Thêm Menu Trend Mới" : "+ Add Trend Menu") 
            : (isVi ? "+ Thêm Danh Mục Mới" : "+ Add Category")}
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
          <span>{isVi ? `🔥 Menu Trend Trên Header (${trendingCategories.length} menu đang ghim)` : `🔥 Header Trend Menus (${trendingCategories.length} pinned)`}</span>
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
          <span>{isVi ? `📁 Tất Cả Danh Mục Sản Phẩm (${categories.length})` : `📁 All Categories (${categories.length})`}</span>
        </button>
      </div>

      {/* TAB 1: TREND MENU HEADER MANAGEMENT */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Live Storefront Preview Box */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles size={14} /> {isVi ? "Xem Trước Thanh Menu Header Khách Hàng (Live Preview Storefront)" : "Storefront Header Navigation Live Preview"}
              </span>
              <span>Website: http://localhost:3000</span>
            </div>

            {/* Simulated Header Navigation Bar */}
            <div className="bg-[#0c0c0c] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold">
              <span className="text-slate-300">Shop All</span>
              
              {trendingCategories.length === 0 ? (
                <span className="text-slate-500 italic">{isVi ? "(Chưa có menu trend nào được ghim. Bấm \"+ Thêm Menu Trend Mới\" bên dưới)" : "(No trend menus pinned yet. Click \"+ Add Trend Menu\" below)"}</span>
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
                  <Flame className="w-4 h-4 text-[#ff7700]" /> {isVi ? "Danh Sách Menu Trend Đang Hiển Thị Trên Header" : "Pinned Header Trend Menus"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {isVi 
                    ? "Sắp xếp thứ tự hoặc chỉnh sửa nội dung menu trend. Bấm vào nút sản phẩm để quản lý các mẫu áo theo trend đó."
                    : "Reorder or edit seasonal trends. Click product count to manage items in each trend collection."}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsTrendingMenu(true);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> {isVi ? "Thêm Trend Mới (VD: Christmas, Summer...)" : "Add New Trend (E.g. Christmas, Summer...)"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4 text-center w-16">{isVi ? "Thứ Tự" : "Order"}</th>
                    <th className="p-4">{isVi ? "Icon & Tên Menu Trend" : "Icon & Menu Name"}</th>
                    <th className="p-4">{isVi ? "Huy Hiệu (Badge)" : "Badge Tag"}</th>
                    <th className="p-4">{isVi ? "Đường Dẫn FE (/collections/...)" : "Storefront Link (/collections/...)"}</th>
                    <th className="p-4">{isVi ? "Sản Phẩm Trong Trend" : "Products in Trend"}</th>
                    <th className="p-4 text-right">{isVi ? "Hành Động Quản Lý" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        {isVi ? "Đang nạp menu trend từ Database..." : "Loading trend menus from Database..."}
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
                                title={isVi ? "Di chuyển lên trước" : "Move up"}
                              >
                                <ArrowUp size={13} />
                              </button>
                              <span className="font-mono text-xs font-extrabold text-blue-600">{idx + 1}</span>
                              <button
                                onClick={() => handleMoveOrder(c, "down")}
                                disabled={idx === trendingCategories.length - 1}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title={isVi ? "Di chuyển xuống sau" : "Move down"}
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
                              <span className="text-slate-400 text-xs italic">{isVi ? "Không có" : "None"}</span>
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
                              <span>{productCount} {isVi ? "sản phẩm" : "products"}</span>
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
                                title={isVi ? "Sửa tên, icon, badge" : "Edit name, icon, badge"}
                              >
                                <Edit2 className="w-3.5 h-3.5" /> {isVi ? "Sửa Menu" : "Edit"}
                              </button>

                              {/* Unpin Button */}
                              <button
                                onClick={() => handleToggleTrendMenu(c)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition"
                                title={isVi ? "Hủy ghim khỏi Menu Header" : "Unpin from Header"}
                              >
                                {isVi ? "✕ Bỏ Ghim" : "✕ Unpin"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        {isVi 
                          ? "Chưa có menu trend nào được ghim. Bấm \"+ Thêm Menu Trend Mới\" để tạo trend (Christmas, Halloween, ...)."
                          : "No trend menus pinned yet. Click \"+ Add Trend Menu\" to create seasonal collections."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL CATEGORIES MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>{isVi ? "Quy tắc bảo vệ sản phẩm: " : "Product Safety Rule: "}</strong> 
              {isVi 
                ? "Nếu một danh mục bị ẨN hoặc XÓA, tất cả sản phẩm thuộc danh mục đó sẽ lập tức chuyển sang trạng thái Vô hiệu hóa (Locked) cho tới khi danh mục được bật lại hoặc sản phẩm được gán sang danh mục mới."
                : "If a category is HIDDEN or DELETED, all associated products are safely preserved and locked until restored or reassigned."}
            </span>
          </div>

          {/* Categories Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4">{isVi ? "Tên Danh Mục & Icon" : "Category Name & Icon"}</th>
                    <th className="p-4">{isVi ? "Slug Đường Dẫn" : "SEO Slug"}</th>
                    <th className="p-4">{isVi ? "Ghim Menu Trend Header" : "Header Trend Menu"}</th>
                    <th className="p-4">{isVi ? "Trạng Thái (Status)" : "Status"}</th>
                    <th className="p-4">{isVi ? "Số Sản Phẩm" : "Product Count"}</th>
                    <th className="p-4 text-right">{isVi ? "Thao Tác Quản Lý" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        {isVi ? "Đang nạp danh mục sản phẩm từ Database..." : "Loading categories from Database..."}
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
                              <span>{isTrend ? (isVi ? "Đang Ghim Header 🔥" : "Pinned to Header 🔥") : (isVi ? "+ Ghim Header" : "+ Pin to Header")}</span>
                            </button>
                          </td>

                          <td className="p-4">
                            {isHidden ? (
                              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-xs inline-flex items-center gap-1">
                                <EyeOff className="w-3.5 h-3.5" /> {isVi ? "Đã Ẩn (Sp bị khóa)" : "Hidden (Locked)"}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {isVi ? "Hoạt Động" : "Active"}
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-extrabold text-slate-800 text-base font-mono">
                            {productCount} {isVi ? "sản phẩm" : "products"}
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
                                title={isHidden ? (isVi ? "Hiện lại danh mục" : "Show category") : (isVi ? "Ẩn danh mục" : "Hide category")}
                              >
                                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                {isHidden ? (isVi ? "Hiện" : "Show") : (isVi ? "Ẩn" : "Hide")}
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
                                title={isVi ? "Sửa danh mục" : "Edit category"}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                                title={isVi ? "Xóa danh mục" : "Delete category"}
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
                        {isVi ? "Chưa có danh mục nào trong Database." : "No categories in Database."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CATEGORY / TREND MENU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#ff7700]" /> {isVi ? "Thêm Danh Mục / Menu Trend Mới" : "Add New Category / Trend Menu"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Tên Danh Mục / Menu Trend *" : "Category / Trend Menu Name *"}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={isVi ? "Ví dụ: 🎄 Christmas Deals hoặc 🎃 Halloween & Spooky" : "E.g. 🎄 Christmas Deals or 🎃 Halloween & Spooky"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Slug Đường Dẫn (/collections/[slug]) *" : "SEO Slug (/collections/[slug]) *"}</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="christmas / halloween"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isVi ? "Icon Emoji (Chọn nhanh)" : "Icon Emoji (Quick pick)"}</label>
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
                  <label className="font-bold text-slate-700">{isVi ? "Huy Hiệu Tag (Tùy chọn)" : "Badge Tag (Optional)"}</label>
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
                    <Flame size={14} className="text-[#ff7700]" /> {isVi ? "Ghim lên thanh Menu Header của website" : "Pin to website Header Navigation Menu"}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">{isVi ? "Khách hàng sẽ nhìn thấy mục này ngay cạnh nút \"Shop All\"." : "Customers will see this prominently next to \"Shop All\"."}</p>
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
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                  {isVi ? "Tạo Mới & Lưu" : "Create & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY / TREND MENU */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> {isVi ? "Cập Nhật Menu Trend / Danh Mục" : "Edit Trend Menu / Category"}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Tên Menu / Danh Mục *" : "Menu / Category Name *"}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Slug Đường Dẫn (/collections/[slug]) *" : "SEO Slug (/collections/[slug]) *"}</label>
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
                  <label className="font-bold text-slate-700">{isVi ? "Icon Emoji" : "Icon Emoji"}</label>
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
                  <label className="font-bold text-slate-700">{isVi ? "Huy Hiệu (Badge Tag)" : "Badge Tag"}</label>
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
                    <Flame size={14} className="text-[#ff7700]" /> {isVi ? "Ghim lên thanh Menu Header của website" : "Pin to website Header Navigation Menu"}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">{isVi ? "Hiển thị nổi bật trên thanh Navigation Bar của khách hàng." : "Displays prominently on the storefront Navigation Bar."}</p>
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
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                  {isVi ? "Lưu Thay Đổi" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
