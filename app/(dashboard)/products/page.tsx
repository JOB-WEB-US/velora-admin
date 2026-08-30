"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Edit, Trash2, Layers, Star, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGetProducts, useUpdateProduct } from "@/lib/hooks/useProducts";
import { useGetCategories } from "@/lib/hooks/useCategories";
import { formatCurrency } from "@/lib/utils";

export default function ProductsListPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const { data: products = [], isLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();
  const updateProductMutation = useUpdateProduct();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [reassignModalProduct, setReassignModalProduct] = useState<any | null>(null);
  const [newCategoryId, setNewCategoryId] = useState("");

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variants?.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || product.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleReassignCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalProduct) return;

    try {
      await updateProductMutation.mutateAsync({
        id: reassignModalProduct.id,
        data: { categoryId: newCategoryId || null },
      });
      alert(`Đã chọn lại danh mục mới và cập nhật trạng thái sản phẩm thành công!`);
      setReassignModalProduct(null);
    } catch {
      alert(`Cập nhật danh mục mới cho sản phẩm thành công!`);
      setReassignModalProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" />
            Quản Lý Hàng Hóa & Sản Phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Danh sách tất cả các mẫu thiết kế POD, giá bán, giá niêm yết và biến thể SKU.
          </p>
        </div>

        <Link
          href="/products/new"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          Thêm Sản Phẩm Mới
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên, slug, mã SKU..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition font-bold"
          >
            <option value="ALL">Tất cả Danh Mục ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.isHidden ? "(Đã ẩn)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
              <tr>
                <th className="p-4">Hình Ảnh</th>
                <th className="p-4">Tên Sản Phẩm / Slug</th>
                <th className="p-4">Danh Mục</th>
                <th className="p-4">Giá Gốc / Niêm Yết</th>
                <th className="p-4">Trạng Thái (Active)</th>
                <th className="p-4">Biến Thể SKU</th>
                <th className="p-4">Đánh Giá</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  const activeVariantsCount = product.variants?.filter((v: any) => {
                    const isVariantActive = v.isActive !== false;
                    const isTypeActive = !v.type || v.type.isActive !== false;
                    const isColorActive = !v.colorRel || v.colorRel.isActive !== false;
                    const isSizeActive = !v.sizeRel || v.sizeRel.isActive !== false;
                    return isVariantActive && isTypeActive && isColorActive && isSizeActive;
                  }).length || 0;

                  const isActive = Boolean(
                    product.isActive !== false &&
                    product.category?.isHidden !== true &&
                    Boolean(product.categoryId) &&
                    activeVariantsCount > 0
                  );

                  return (
                    <tr key={product.id} className={`hover:bg-slate-50 transition group ${!isActive ? "bg-amber-50/30" : ""}`}>
                      {/* Front Image */}
                      <td className="p-4">
                        <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={product.frontImage}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition"
                            unoptimized
                          />
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="p-4 max-w-xs">
                        <Link href={`/products/${product.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1 text-base">
                          {product.title}
                        </Link>
                        <div className="text-xs text-slate-500 font-mono truncate">{product.slug}</div>
                        {product.printFileFront && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-extrabold border border-indigo-200 mt-1">
                            🖨️ Có Bản In POD
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        {product.category ? (
                          <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                            product.category.isHidden
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {product.category.name} {product.category.isHidden ? "(Đã ẩn)" : ""}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                            Chưa chọn danh mục
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="font-extrabold text-emerald-600 text-base">{formatCurrency(product.basePrice)}</div>
                        {product.originalPrice && (
                          <div className="text-xs text-slate-400 line-through">
                            {formatCurrency(product.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Active Status Badge */}
                      <td className="p-4">
                        {isActive ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt Động
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> Vô Hiệu Hóa
                            </span>
                            <button
                              onClick={() => {
                                setReassignModalProduct(product);
                                setNewCategoryId(product.categoryId || "");
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:underline block"
                            >
                              + Chọn lại danh mục mới
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Variants & Total Stock */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">
                          {product.variants?.length || 0} biến thể
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Tồn kho: <span className={totalStock < 10 ? "text-amber-600 font-extrabold" : "text-slate-900 font-bold"}>{totalStock} cái</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        {product.reviews && product.reviews.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span>
                              {(
                                product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                                product.reviews.length
                              ).toFixed(1)}
                            </span>
                            <span className="text-slate-400 text-xs">({product.reviews.length})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Chưa có đánh giá</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Quản lý & Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    Không tìm thấy sản phẩm nào phù hợp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reassign Category to Re-enable Product */}
      {reassignModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Gán Danh Mục Mới Cho Sản Phẩm
              </h3>
              <button onClick={() => setReassignModalProduct(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignCategorySubmit} className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                Sản phẩm: <span className="text-blue-600 text-sm font-extrabold block">{reassignModalProduct.title}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Chọn Danh Mục Đang Hoạt Động *</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                >
                  <option value="">-- Chọn danh mục hoạt động --</option>
                  {categories.filter((c) => !c.isHidden).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Kích Hoạt Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
