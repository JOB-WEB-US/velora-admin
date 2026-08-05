"use client";

import React, { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, Eye, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks/useCategories";
import { Category } from "@/types/product";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Create Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      await createMutation.mutateAsync({ name, slug });
      alert("Tạo danh mục sản phẩm mới thành công!");
      setName("");
      setSlug("");
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
        data: { name: editName, slug: editSlug },
      });
      alert("Cập nhật danh mục thành công!");
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật danh mục!");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-blue-600" />
            Danh Mục Sản Phẩm POD
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Tạo, cập nhật, ẩn hoặc xóa danh mục. Khi ẩn hoặc xóa danh mục, các sản phẩm liên quan sẽ tự động bị vô hiệu hóa.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> + Thêm Danh Mục Mới
        </button>
      </div>

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
                <th className="p-4">Tên Danh Mục</th>
                <th className="p-4">Slug Đường Dẫn</th>
                <th className="p-4">Trạng Thái (Status)</th>
                <th className="p-4">Số Sản Phẩm Hàng Hóa</th>
                <th className="p-4 text-right">Thao Tác Quản Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Đang nạp danh mục sản phẩm từ Database...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((c) => {
                  const productCount = c._count?.products ?? c.products?.length ?? 0;
                  const isHidden = Boolean(c.isHidden);

                  return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition ${isHidden ? "bg-slate-50/60" : ""}`}>
                      <td className="p-4 font-bold text-slate-900 text-base">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-sm shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs text-blue-600 font-bold">{c.slug}</td>

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
                            {isHidden ? "Hiện Danh Mục" : "Ẩn Danh Mục"}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setEditName(c.name);
                              setEditSlug(c.slug);
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
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Chưa có danh mục nào trong Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Thêm Danh Mục Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Áo Sweatshirt Thu Đông"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug Đường Dẫn *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ao-sweatshirt-thu-dong"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Category */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Cập Nhật Danh Mục</h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug Đường Dẫn *</label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
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
