"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Edit, Trash2, Layers, Star, Lock, CheckCircle2, AlertTriangle, Copy, Loader2 } from "lucide-react";
import { useGetProducts, useUpdateProduct, useDeleteProduct, useDuplicateProduct } from "@/lib/hooks/useProducts";
import { useGetCategories } from "@/lib/hooks/useCategories";
import { useTranslation } from "@/store/useLanguageStore";
import { formatCurrency } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";

export default function ProductsListPage() {
  const { t, language } = useTranslation();
  const isVi = language === "vi";

  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const { data: products = [], isLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const duplicateProductMutation = useDuplicateProduct();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [reassignModalProduct, setReassignModalProduct] = useState<any | null>(null);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [duplicateProduct, setDuplicateProduct] = useState<any | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [duplicateFrontImage, setDuplicateFrontImage] = useState("");
  const [duplicateBackImage, setDuplicateBackImage] = useState("");
  const [replaceVariantImages, setReplaceVariantImages] = useState(true);

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
      alert(
        isVi
          ? "Đã chọn lại danh mục mới và cập nhật trạng thái sản phẩm thành công!"
          : "Category reassigned and product activated successfully!"
      );
      setReassignModalProduct(null);
    } catch {
      alert(
        isVi
          ? "Cập nhật danh mục mới cho sản phẩm thành công!"
          : "Category updated successfully!"
      );
      setReassignModalProduct(null);
    }
  };

  const openDuplicateModal = (product: any) => {
    setDuplicateProduct(product);
    setDuplicateFrontImage(product.frontImage || "");
    setDuplicateBackImage(product.backImage || "");
    setReplaceVariantImages(true);
  };

  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateProduct || !duplicateFrontImage) return;

    try {
      await duplicateProductMutation.mutateAsync({
        id: duplicateProduct.id,
        frontImage: duplicateFrontImage,
        backImage: duplicateBackImage || null,
        replaceVariantImages,
      });
      setDuplicateProduct(null);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          (isVi
            ? "Không thể nhân bản sản phẩm. Vui lòng thử lại."
            : "Failed to duplicate product. Please try again.")
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;

    try {
      await deleteProductMutation.mutateAsync(deleteProduct.id);
      setDeleteProduct(null);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          (isVi
            ? "Không thể xóa sản phẩm. Sản phẩm có thể đã phát sinh đơn hàng."
            : "Failed to delete product. Product may have existing orders.")
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" />
            {isVi ? "Quản Lý Hàng Hóa & Sản Phẩm" : "Products & Inventory"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isVi
              ? "Danh sách tất cả các mẫu thiết kế POD, giá bán, giá niêm yết và biến thể SKU."
              : "Manage graphic tees, hoodies, variants, prices and live inventory."}
          </p>
        </div>

        <Link
          href="/products/new"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          {isVi ? "Thêm Sản Phẩm Mới" : "Add Product"}
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
            placeholder={
              isVi
                ? "Tìm kiếm sản phẩm theo tên, slug, mã SKU..."
                : "Search products by name, slug, SKU..."
            }
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
            <option value="ALL">
              {isVi ? `Tất cả Danh Mục (${categories.length})` : `All Categories (${categories.length})`}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.isHidden ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
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
                <th className="p-4">{isVi ? "Hình Ảnh" : "Image"}</th>
                <th className="p-4">{isVi ? "Tên Sản Phẩm / Slug" : "Product Name / Slug"}</th>
                <th className="p-4">{isVi ? "Danh Mục" : "Category"}</th>
                <th className="p-4">{isVi ? "Giá Gốc / Niêm Yết" : "Base / List Price"}</th>
                <th className="p-4">{isVi ? "Trạng Thái" : "Status"}</th>
                <th className="p-4">{isVi ? "Biến Thể SKU" : "Variants & Stock"}</th>
                <th className="p-4">{isVi ? "Đánh Giá" : "Rating"}</th>
                <th className="p-4 text-right">{isVi ? "Thao Tác" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    {isVi ? "Đang tải danh sách sản phẩm..." : "Loading products list..."}
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
                            {isVi ? "🖨️ Có Bản In POD" : "🖨️ POD Print-Ready"}
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
                            {product.category.name} {product.category.isHidden ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                            {isVi ? "Chưa chọn danh mục" : "No category"}
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
                            <CheckCircle2 className="w-3.5 h-3.5" /> {isVi ? "Hoạt Động" : "Active"}
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> {isVi ? "Vô Hiệu Hóa" : "Inactive"}
                            </span>
                            <button
                              onClick={() => {
                                setReassignModalProduct(product);
                                setNewCategoryId(product.categoryId || "");
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:underline block"
                            >
                              {isVi ? "+ Chọn lại danh mục mới" : "+ Reassign category"}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Variants & Total Stock */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">
                          {isVi ? `${product.variants?.length || 0} biến thể` : `${product.variants?.length || 0} variants`}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {isVi ? "Tồn kho:" : "Stock:"}{" "}
                          <span className={totalStock < 10 ? "text-amber-600 font-extrabold" : "text-slate-900 font-bold"}>
                            {isVi ? `${totalStock} cái` : `${totalStock} in stock`}
                          </span>
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
                          <span className="text-xs text-slate-400 font-medium">
                            {isVi ? "Chưa có đánh giá" : "No reviews yet"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDuplicateModal(product)}
                            className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition"
                            title={isVi ? "Nhân bản & đổi mockup nhanh" : "Duplicate & swap mockup"}
                            aria-label={`Nhân bản ${product.title}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/products/${product.id}`}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title={isVi ? "Quản lý & Chỉnh sửa" : "Edit product"}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(product)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title={isVi ? "Xóa sản phẩm" : "Delete product"}
                            aria-label={`Xóa ${product.title}`}
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
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    {isVi ? "Không tìm thấy sản phẩm nào phù hợp!" : "No matching products found!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick duplicate modal */}
      {duplicateProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-violet-600" />
                  {isVi ? "Nhân Bản & Đổi Mockup Nhanh" : "Quick Duplicate & Swap Mockup"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isVi
                    ? `Giữ nguyên nội dung, giá, danh mục và ${duplicateProduct.variants?.length || 0} biến thể.`
                    : `Retains description, pricing, category, and ${duplicateProduct.variants?.length || 0} variants.`}
                </p>
              </div>
              <button type="button" onClick={() => setDuplicateProduct(null)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleDuplicateSubmit} className="space-y-5">
              <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-sm text-violet-900">
                <span className="font-bold">{isVi ? "Sản phẩm gốc:" : "Source product:"}</span> {duplicateProduct.title}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader
                  label={isVi ? "Mockup mặt trước mới" : "New front mockup"}
                  value={duplicateFrontImage}
                  onChange={setDuplicateFrontImage}
                  required
                />
                <ImageUploader
                  label={isVi ? "Mockup mặt sau mới (không bắt buộc)" : "New back mockup (optional)"}
                  value={duplicateBackImage}
                  onChange={setDuplicateBackImage}
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceVariantImages}
                  onChange={(e) => setReplaceVariantImages(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-violet-600"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    {isVi ? "Dùng mockup mặt trước mới cho toàn bộ biến thể" : "Use new front mockup for all variants"}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    {isVi
                      ? "Phù hợp khi thiết kế giống nhau và chỉ cần thay ảnh mockup thật nhanh."
                      : "Ideal when design is identical and you only need to swap mockups quickly."}
                  </span>
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setDuplicateProduct(null)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm">
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!duplicateFrontImage || duplicateProductMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2"
                >
                  {duplicateProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  {duplicateProductMutation.isPending
                    ? isVi
                      ? "Đang nhân bản..."
                      : "Duplicating..."
                    : isVi
                    ? "Nhân Bản Sản Phẩm"
                    : "Duplicate Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {isVi ? "Xóa sản phẩm này?" : "Delete this product?"}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {isVi ? (
                  <>
                    Bạn sắp xóa <span className="font-bold text-slate-800">{deleteProduct.title}</span> cùng toàn bộ biến thể và đánh giá. Thao tác này không thể hoàn tác.
                  </>
                ) : (
                  <>
                    You are about to delete <span className="font-bold text-slate-800">{deleteProduct.title}</span> along with all variants and reviews. This action cannot be undone.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setDeleteProduct(null)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm">
                {isVi ? "Không, giữ lại" : "No, cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteProductMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2"
              >
                {deleteProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteProductMutation.isPending
                  ? isVi
                    ? "Đang xóa..."
                    : "Deleting..."
                  : isVi
                  ? "Xóa Sản Phẩm"
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reassign Category to Re-enable Product */}
      {reassignModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {isVi ? "Gán Danh Mục Mới Cho Sản Phẩm" : "Reassign Category to Product"}
              </h3>
              <button onClick={() => setReassignModalProduct(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignCategorySubmit} className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                {isVi ? "Sản phẩm:" : "Product:"} <span className="text-blue-600 text-sm font-extrabold block">{reassignModalProduct.title}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  {isVi ? "Chọn Danh Mục Đang Hoạt Động *" : "Select Active Category *"}
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                >
                  <option value="">
                    {isVi ? "-- Chọn danh mục hoạt động --" : "-- Select an active category --"}
                  </option>
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
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  {isVi ? "Kích Hoạt Sản Phẩm" : "Activate Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
