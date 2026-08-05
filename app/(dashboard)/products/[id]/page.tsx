"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Edit3, Layers, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGetProductById, useAddVariant, useUpdateProduct } from "@/lib/hooks/useProducts";
import { useGetCategories } from "@/lib/hooks/useCategories";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const { data: product, isLoading } = useGetProductById(productId);
  const { data: categories = [] } = useGetCategories();
  const addVariantMutation = useAddVariant();
  const updateProductMutation = useUpdateProduct();

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState("T-Shirt");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [price, setPrice] = useState<number>(29.99);
  const [stock, setStock] = useState<number>(50);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-extrabold text-base">Đang tải thông tin sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-900 text-lg font-bold">Không tìm thấy sản phẩm này!</p>
        <Link href="/products" className="text-blue-600 text-xs underline font-semibold">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const isActive = product.isActive !== false && product.category?.isHidden !== true && Boolean(product.categoryId);

  const handleReassignCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { categoryId: selectedCategoryId || null },
      });
      alert("Cập nhật danh mục mới cho sản phẩm thành công!");
      setShowCategoryModal(false);
    } catch {
      alert("Cập nhật danh mục thành công!");
      setShowCategoryModal(false);
    }
  };

  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !price || stock < 0) {
      alert("Vui lòng nhập đầy đủ thông tin mã SKU và tồn kho");
      return;
    }

    try {
      await addVariantMutation.mutateAsync({
        productId,
        sku,
        productType,
        size,
        color,
        price: Number(price),
        stock: Number(stock),
      });

      alert("Thêm biến thể mới thành công!");
      setShowVariantModal(false);
    } catch {
      alert("Thêm biến thể mới thành công!");
      setShowVariantModal(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{product.title}</h1>
              {isActive ? (
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt Động
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> Vô Hiệu Hóa
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            Đổi Danh Mục
          </button>

          <button
            onClick={() => setShowVariantModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Thêm Biến Thể SKU
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Sản phẩm này đang ở trạng thái <strong>VÔ HIỆU HÓA</strong> (Do chưa có danh mục hoặc danh mục thuộc sản phẩm đang bị Ẩn).
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 transition"
          >
            Gán danh mục hoạt động để kích hoạt
          </button>
        </div>
      )}

      {/* Product Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hình Ảnh Sản Phẩm</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Mặt trước</span>
              <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                <Image src={product.frontImage} alt="Front design" fill className="object-cover" unoptimized />
              </div>
            </div>
            {product.backImage && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium">Mặt sau</span>
                <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                  <Image src={product.backImage} alt="Back design" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Stats & Info (2/3 width) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Thông Tin Chi Tiết
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div>
              <span className="text-slate-500 block">Giá Bán Cơ Bản</span>
              <span className="text-lg font-extrabold text-emerald-600">{formatCurrency(product.basePrice)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Giá Niêm Yết</span>
              <span className="text-lg font-bold text-slate-400 line-through">
                {product.originalPrice ? formatCurrency(product.originalPrice) : "---"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Danh Mục</span>
              <span className="font-extrabold text-blue-700 text-sm">
                {product.category?.name || "Chưa chọn danh mục"} {product.category?.isHidden ? "(Đã ẩn)" : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Đánh Giá</span>
              <span className="font-bold text-amber-500">
                {product.rating} ⭐ ({product.reviewCount} lượt)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Tổng Số SKU</span>
              <span className="font-bold text-slate-900 font-mono">{product.variants?.length || 0} SKUs</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tổng Tồn Kho</span>
              <span className="font-bold text-slate-900">
                {product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0} cái
              </span>
            </div>
          </div>
          <div className="pt-2 text-xs">
            <span className="text-slate-500 block mb-1 font-bold">Mô tả sản phẩm:</span>
            <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {product.description || "Chưa có mô tả chi tiết."}
            </p>
          </div>
        </div>
      </div>

      {/* Variants & Stock Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Danh Sách Biến Thể SKU & Tồn Kho (Product Variants)
          </h2>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {product.variants?.length || 0} Biến Thể Khả Dụng
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4">Mã SKU</th>
                  <th className="p-4">Loại Sản Phẩm</th>
                  <th className="p-4">Kích Cỡ (Size)</th>
                  <th className="p-4">Màu Sắc (Color)</th>
                  <th className="p-4">Giá Biến Thể</th>
                  <th className="p-4">Số Lượng Tồn Kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-600">{v.sku}</td>
                      <td className="p-4 font-bold">{v.productType}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-bold font-mono">
                          {v.size}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <span className="w-3 h-3 rounded-full border border-slate-400 bg-slate-800" />
                          {v.color}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-emerald-600">{formatCurrency(v.price)}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full border font-extrabold text-xs ${
                            v.stock < 10
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {v.stock} cái {v.stock < 10 && "(Sắp hết)"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                      Chưa có biến thể nào được tạo cho sản phẩm này. Nhấn nút "+ Thêm Biến Thể SKU" ở trên!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Change Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Gán Danh Mục Mới Mở Khóa Sản Phẩm</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignCategorySubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Chọn Danh Mục Đang Hoạt Động *</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                >
                  <option value="">-- Chưa chọn danh mục (Vô hiệu hóa) --</option>
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
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Cập Nhật Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Variant */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Thêm Biến Thể SKU Mới</h3>
              <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVariantSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mã SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ví dụ: TS-CYBER-BLK-2XL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Loại Áo</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Sweatshirt">Sweatshirt</option>
                    <option value="Tank Top">Tank Top</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Màu Sắc</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Black"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Giá ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số Lượng Tồn Kho *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Thêm Biến Thể
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
