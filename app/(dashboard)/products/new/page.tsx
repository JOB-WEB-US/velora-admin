"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, DollarSign, Layers } from "lucide-react";
import { useGetCategories } from "@/lib/hooks/useCategories";
import { useCreateProduct } from "@/lib/hooks/useProducts";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";
import { VariantManager } from "@/components/VariantManager";
import { DraftVariant } from "@/types/product";

export default function CreateProductPage() {
  const router = useRouter();
  const { data: categories = [] } = useGetCategories();
  const createProductMutation = useCreateProduct();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">(29.99);
  const [originalPrice, setOriginalPrice] = useState<number | "">(39.99);
  const [frontImage, setFrontImage] = useState("");
  const [backImage, setBackImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSale, setIsSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [variants, setVariants] = useState<DraftVariant[]>([]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !frontImage || !categoryId || !basePrice) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        title,
        slug,
        description,
        basePrice: Number(basePrice),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        frontImage,
        backImage,
        categoryId,
        isSale,
        isFeatured,
        variants,
      });

      alert("Tạo sản phẩm mới & biến thể thành công!");
      router.push("/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Tạo sản phẩm thành công!");
      router.push("/products");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tạo Sản Phẩm POD Mới</h1>
            <p className="text-xs text-slate-500">
              Nhập đầy đủ thông tin mẫu thiết kế, hình ảnh từ máy tính & quản lý biến thể.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
          {/* Section 1: Basic Info */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 1. Thông Tin Cơ Bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tên Sản Phẩm *</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Ví dụ: Vintage Cyberpunk Graphic T-Shirt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Slug (Đường dẫn SEO) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vintage-cyberpunk-graphic-t-shirt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Mô Tả Chi Tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chất liệu vải, kiểu dáng, công nghệ in ấn DTG HD..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Section 2: Pricing & Category */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> 2. Giá Cả & Phân Loại
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Giá Bán Chuẩn ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="29.99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Giá Gốc / Niêm Yết ($)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="39.99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Danh Mục Sản Phẩm *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              Nổi Bật (Is Featured)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isSale}
                onChange={(e) => setIsSale(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded"
              />
              Đang Giảm Giá (Is Sale)
            </label>
          </div>

          {/* Section 3: Media Upload */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> 3. Hình Ảnh Sản Phẩm (Tải Từ Máy Hoặc Dán Link)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Ảnh Mặt Trước (Front Image)"
              required
              value={frontImage}
              onChange={setFrontImage}
              placeholder="Tải ảnh mặt trước từ máy hoặc dán link URL..."
            />

            <ImageUploader
              label="Ảnh Mặt Sau (Back Image)"
              value={backImage}
              onChange={setBackImage}
              placeholder="Tải ảnh mặt sau từ máy hoặc dán link URL..."
            />
          </div>

          {/* Section 4: Variants */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 4. Biến Thể Hàng Hóa (Product Variants)
          </h2>

          <VariantManager
            variants={variants}
            onChange={setVariants}
            basePrice={Number(basePrice) || 29.99}
            productTitle={title}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Hủy Bỏ
          </Link>
          <button
            type="submit"
            disabled={createProductMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createProductMutation.isPending ? "Đang Lưu..." : "Lưu Sản Phẩm Mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
