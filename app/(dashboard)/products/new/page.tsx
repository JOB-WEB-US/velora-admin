"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, DollarSign, Layers, Printer, ShieldCheck, Link2, FileText } from "lucide-react";
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
  
  // POD Print-Ready Artwork States
  const [printFileFront, setPrintFileFront] = useState("");
  const [printFileBack, setPrintFileBack] = useState("");
  const [printDimensions, setPrintDimensions] = useState("14 x 18 in (Front DTG 300 DPI)");
  const [printDriveUrl, setPrintDriveUrl] = useState("");
  const [printNotes, setPrintNotes] = useState("");

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
    if (!title.trim() || !slug.trim() || !frontImage || !basePrice) {
      alert("Vui lòng điền các thông tin bắt buộc: Tên sản phẩm, Đường dẫn Slug, Giá bán và Ảnh mặt trước (*)");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        basePrice: Number(basePrice),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        frontImage,
        backImage: backImage || undefined,
        printFileFront: printFileFront || undefined,
        printFileBack: printFileBack || undefined,
        printDimensions: printDimensions || undefined,
        printDriveUrl: printDriveUrl || undefined,
        printNotes: printNotes || undefined,
        categoryId: categoryId || undefined,
        isSale,
        isFeatured,
        variants,
      });

      alert("Tạo sản phẩm mới & Bản Thiết Kế In POD thành công!");
      router.push("/products");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng kiểm tra lại.";
      alert(`Lỗi tạo sản phẩm: ${errorMsg}`);
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
              Nhập đầy đủ thông tin mẫu áo, ảnh mockup và đính kèm Bản Thiết Kế In Ấn (300 DPI) cho xưởng POD / Shipper.
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
              <label className="text-xs font-semibold text-slate-700">Danh Mục Sản Phẩm (Tùy Chọn)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
              >
                <option value="">-- Chọn danh mục (Hoặc để trống) --</option>
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

          {/* Section 3: Media Upload (Mockup for Storefront) */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> 3. Ảnh Mockup Trưng Bày (Hiển thị cho Khách xem)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Ảnh Mockup Mặt Trước (Front Mockup)"
              required
              value={frontImage}
              onChange={setFrontImage}
              placeholder="Tải ảnh mockup mặt trước từ máy hoặc dán link URL..."
            />

            <ImageUploader
              label="Ảnh Mockup Mặt Sau (Tùy chọn - Nếu có)"
              value={backImage}
              onChange={setBackImage}
              placeholder="Tải ảnh mockup mặt sau từ máy hoặc dán link URL..."
            />
          </div>

          {/* Section 4: Print-Ready Artwork for POD / Shipper (Admin & Shipper Only) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Printer className="w-4 h-4 text-indigo-600" /> 4. Bản Thiết Kế In Ấn POD (Tùy Chọn - Điền Hoặc Bổ Sung Sau)
                </h2>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Tải file in tách nền (PNG 300 DPI / PDF vector) để xưởng in POD & Shipper tải về in trực tiếp lên áo.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-extrabold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Bảo mật: Chỉ Admin & POD thấy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                label="🖨️ File In Mặt Trước (Tùy chọn - PNG 300 DPI / Vector)"
                value={printFileFront}
                onChange={setPrintFileFront}
                placeholder="Tải file in mặt trước tách nền 300 DPI..."
              />

              <ImageUploader
                label="🖨️ File In Mặt Sau (Tùy chọn - Nếu có)"
                value={printFileBack}
                onChange={setPrintFileBack}
                placeholder="Tải file in mặt sau tách nền 300 DPI..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600" /> Link Master Cloud Drive (Tùy chọn - Google Drive / S3)
                </label>
                <input
                  type="url"
                  value={printDriveUrl}
                  onChange={(e) => setPrintDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-white border border-indigo-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Kích Thước & Vị Trí In (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={printDimensions}
                  onChange={(e) => setPrintDimensions(e.target.value)}
                  placeholder="Ví dụ: 14 x 18 in (Front DTG 300 DPI)"
                  className="w-full bg-white border border-indigo-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-950">Ghi Chú Kỹ Thuật Cho Xưởng In (Tùy chọn)</label>
              <input
                type="text"
                value={printNotes}
                onChange={(e) => setPrintNotes(e.target.value)}
                placeholder="Ví dụ: In lót trắng (White underbase) trên áo đen/navy, kiểm tra canh giữa ngực áo..."
                className="w-full bg-white border border-indigo-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* Section 5: Variants */}
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 5. Biến Thể Hàng Hóa (Product Variants)
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
            {createProductMutation.isPending ? "Đang Lưu..." : "Lưu Sản Phẩm & Bản In Mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
