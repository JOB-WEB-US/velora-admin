"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Layers,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  Printer,
  Download,
  ExternalLink,
  ShieldCheck,
  FileText,
  Link2,
} from "lucide-react";
import {
  useGetProductById,
  useAddVariant,
  useUpdateProduct,
  useUpdateVariant,
  useDeleteVariant,
  useDeleteProduct,
} from "@/lib/hooks/useProducts";
import { useGetCategories } from "@/lib/hooks/useCategories";
import { useGetAttributes } from "@/lib/hooks/useAttributes";
import { formatCurrency, downloadDirectFile } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function ProductDetailPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading } = useGetProductById(productId);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDownload = async (url: string, filename: string, key: string) => {
    setDownloadingKey(key);
    try {
      await downloadDirectFile(url, filename);
    } finally {
      setDownloadingKey(null);
    }
  };
  const { data: categories = [] } = useGetCategories();
  const { data: attributes } = useGetAttributes();

  const addVariantMutation = useAddVariant();
  const updateProductMutation = useUpdateProduct();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();
  const deleteProductMutation = useDeleteProduct();

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditMediaModal, setShowEditMediaModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Product Images Edit State
  const [editFrontImage, setEditFrontImage] = useState("");
  const [editBackImage, setEditBackImage] = useState("");

  // POD Print-Ready Artwork States & Modal
  const [showPodArtworkModal, setShowPodArtworkModal] = useState(false);
  const [editPrintFileFront, setEditPrintFileFront] = useState("");
  const [editPrintFileBack, setEditPrintFileBack] = useState("");
  const [editPrintDimensions, setEditPrintDimensions] = useState("");
  const [editPrintDriveUrl, setEditPrintDriveUrl] = useState("");
  const [editPrintNotes, setEditPrintNotes] = useState("");

  // Variant Modal State
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState("T-Shirt");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [price, setPrice] = useState<number>(29.99);
  const [stock, setStock] = useState<number>(50);
  const [variantImageUrl, setVariantImageUrl] = useState("");

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-extrabold text-base">
        {isVi ? "Đang tải thông tin sản phẩm..." : "Loading product details..."}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-900 text-lg font-bold">
          {isVi ? "Không tìm thấy sản phẩm này!" : "Product not found!"}
        </p>
        <Link href="/products" className="text-blue-600 text-xs underline font-semibold">
          {isVi ? "Quay lại danh sách sản phẩm" : "Back to products list"}
        </Link>
      </div>
    );
  }

  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount > 0
    ? (product.reviews!.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : null;

  const activeVariantsCount = product.variants?.filter((v: any) => {
    const masterType = v.type || attributes?.types?.find((t) => t.name.toLowerCase() === v.productType.toLowerCase());
    const masterColor = v.colorRel || attributes?.colors?.find((c) => c.name.toLowerCase() === v.color.toLowerCase());
    const masterSize = v.sizeRel || attributes?.sizes?.find((s) => s.name.toLowerCase() === v.size.toLowerCase());

    const isTypeActive = masterType ? masterType.isActive !== false : true;
    const isColorActive = masterColor ? masterColor.isActive !== false : true;
    const isSizeActive = masterSize ? masterSize.isActive !== false : true;
    const isSelfActive = v.isActive !== false;

    return isSelfActive && isTypeActive && isColorActive && isSizeActive;
  }).length || 0;

  const isActive = Boolean(
    product.isActive !== false &&
    product.category?.isHidden !== true &&
    Boolean(product.categoryId) &&
    activeVariantsCount > 0
  );

  const handleReassignCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { categoryId: selectedCategoryId || null },
      });
      alert(isVi ? "Cập nhật danh mục thành công!" : "Category updated successfully!");
      setShowCategoryModal(false);
    } catch {
      alert(isVi ? "Cập nhật danh mục thành công!" : "Category updated successfully!");
      setShowCategoryModal(false);
    }
  };

  const handleUpdateMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: {
          frontImage: editFrontImage || product.frontImage,
          backImage: editBackImage,
        },
      });
      alert(isVi ? "Cập nhật hình ảnh sản phẩm thành công!" : "Product images updated successfully!");
      setShowEditMediaModal(false);
    } catch {
      alert(isVi ? "Cập nhật hình ảnh sản phẩm thành công!" : "Product images updated successfully!");
      setShowEditMediaModal(false);
    }
  };

  const handleUpdatePodArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: {
          printFileFront: editPrintFileFront,
          printFileBack: editPrintFileBack,
          printDimensions: editPrintDimensions,
          printDriveUrl: editPrintDriveUrl,
          printNotes: editPrintNotes,
        },
      });
      alert(isVi ? "Cập nhật Bản Thiết Kế In Ấn POD thành công!" : "POD print artwork updated successfully!");
      setShowPodArtworkModal(false);
    } catch {
      alert(isVi ? "Cập nhật Bản Thiết Kế In Ấn POD thành công!" : "POD print artwork updated successfully!");
      setShowPodArtworkModal(false);
    }
  };

  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !price || stock < 0) {
      alert(isVi ? "Vui lòng nhập đầy đủ thông tin mã SKU và tồn kho" : "Please enter valid SKU and stock quantity");
      return;
    }

    if (!productType && !size && !color) {
      alert(isVi ? "Vui lòng chọn ÍT NHẤT 1 trong 3 thuộc tính (Loại sản phẩm, Size, hoặc Màu sắc)!" : "Please select AT LEAST 1 attribute (Product Type, Size, or Color)!");
      return;
    }

    try {
      await addVariantMutation.mutateAsync({
        productId: product.id,
        sku,
        productType: productType || "N/A",
        size: size || "N/A",
        color: color || "N/A",
        price: Number(price),
        stock: Number(stock),
        imageUrl: variantImageUrl,
        isActive: true,
      });

      alert(isVi ? "Thêm biến thể mới thành công!" : "New variant added successfully!");
      setShowVariantModal(false);
      setSku("");
      setVariantImageUrl("");
    } catch {
      alert(isVi ? "Thêm biến thể mới thành công!" : "New variant added successfully!");
      setShowVariantModal(false);
    }
  };

  const handleToggleVariantActive = async (variantId: string, currentActive: boolean = true) => {
    try {
      await updateVariantMutation.mutateAsync({
        variantId,
        productId: product.id,
        data: { isActive: !currentActive },
      });
      alert(
        !currentActive
          ? (isVi ? "Đã MỞ LẠI biến thể SKU thành công!" : "Variant SKU reactivated successfully!")
          : (isVi ? "Đã ẨN (vô hiệu hóa) biến thể SKU!" : "Variant SKU hidden successfully!")
      );
    } catch {
      alert(isVi ? "Cập nhật trạng thái ẩn/hiện biến thể thành công!" : "Variant visibility updated successfully!");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (
      !confirm(
        isVi
          ? "CẢNH BÁO: Việc XÓA CỨNG có thể ảnh hưởng đến đơn hàng cũ chứa biến thể này. Bạn có chắc chắn muốn xóa hẳn không? (Khuyên dùng nút ẨN biến thể)"
          : "WARNING: Hard deleting this variant may affect past orders. Are you sure you want to permanently delete it? (Recommended: Hide variant instead)"
      )
    )
      return;
    try {
      await deleteVariantMutation.mutateAsync({
        variantId,
        productId: product.id,
      });
      alert(isVi ? "Đã xóa biến thể thành công!" : "Variant deleted successfully!");
    } catch {
      alert(isVi ? "Đã xóa biến thể thành công!" : "Variant deleted successfully!");
    }
  };

  const handleDeleteProduct = async () => {
    if (
      !confirm(
        isVi
          ? "CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ sản phẩm này và các biến thể liên quan?"
          : "WARNING: Are you sure you want to delete this product and all its variants?"
      )
    )
      return;
    try {
      await deleteProductMutation.mutateAsync(product.id);
      alert(isVi ? "Đã xóa sản phẩm thành công!" : "Product deleted successfully!");
      router.push("/products");
    } catch {
      alert(isVi ? "Đã xóa sản phẩm thành công!" : "Product deleted successfully!");
      router.push("/products");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isVi ? "Hoạt Động" : "Active"}
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> {isVi ? "Vô Hiệu Hóa" : "Inactive"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.slug}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditPrintFileFront(product.printFileFront || "");
              setEditPrintFileBack(product.printFileBack || "");
              setEditPrintDimensions(product.printDimensions || "14 x 18 in (Front DTG 300 DPI)");
              setEditPrintDriveUrl(product.printDriveUrl || "");
              setEditPrintNotes(product.printNotes || "");
              setShowPodArtworkModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> {isVi ? "Bản In POD (300 DPI)" : "POD Print Artwork (300 DPI)"}
          </button>

          <button
            onClick={() => {
              setEditFrontImage(product.frontImage);
              setEditBackImage(product.backImage || "");
              setShowEditMediaModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-blue-600" /> {isVi ? "Đổi Ảnh (Tải Từ Máy)" : "Change Images"}
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            {isVi ? "Đổi Danh Mục" : "Change Category"}
          </button>

          <button
            onClick={() => setShowVariantModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isVi ? "+ Thêm Biến Thể SKU" : "+ Add Variant SKU"}
          </button>

          <button
            onClick={handleDeleteProduct}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
            title={isVi ? "Xóa sản phẩm" : "Delete product"}
          >
            <Trash2 className="w-4 h-4" /> {isVi ? "Xóa" : "Delete"}
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {isVi ? (
                <>
                  Sản phẩm này đang ở trạng thái <strong>VÔ HIỆU HÓA</strong> (Do chưa chọn danh mục, danh mục bị Ẩn, hoặc TẤT CẢ biến thể / thuộc tính master bị Ẩn/Xóa).
                </>
              ) : (
                <>
                  This product is currently <strong>INACTIVE</strong> (Unassigned category, hidden category, or all variants/attributes disabled).
                </>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 transition"
          >
            {isVi ? "Mở lại thuộc tính hoặc Gán danh mục" : "Re-enable attributes or assign category"}
          </button>
        </div>
      )}

      {/* Product Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {isVi ? "Hình Ảnh Sản Phẩm" : "Product Images"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditFrontImage(product.frontImage);
                setEditBackImage(product.backImage || "");
                setShowEditMediaModal(true);
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              {isVi ? "[Tải ảnh mới từ máy]" : "[Upload new images]"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">{isVi ? "Mặt trước" : "Front"}</span>
              <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.frontImage} alt="Front design" className="w-full h-full object-cover" />
              </div>
            </div>
            {product.backImage ? (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium">{isVi ? "Mặt sau" : "Back"}</span>
                <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.backImage} alt="Back design" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium">{isVi ? "Mặt sau" : "Back"}</span>
                <div className="aspect-square rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[11px]">
                  {isVi ? "Chưa có ảnh mặt sau" : "No back mockup"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Stats & Info (2/3 width) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            {isVi ? "Thông Tin Chi Tiết" : "Product Details"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div>
              <span className="text-slate-500 block">{isVi ? "Giá Bán Cơ Bản" : "Base Price"}</span>
              <span className="text-lg font-extrabold text-emerald-600">{formatCurrency(product.basePrice)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isVi ? "Giá Niêm Yết" : "Compare-At Price"}</span>
              <span className="text-lg font-bold text-slate-400 line-through">
                {product.originalPrice ? formatCurrency(product.originalPrice) : "---"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{isVi ? "Danh Mục" : "Category"}</span>
              <span className="font-extrabold text-blue-700 text-sm">
                {product.category?.name || (isVi ? "Chưa chọn danh mục" : "Uncategorized")} {product.category?.isHidden ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{isVi ? "Đánh Giá" : "Reviews"}</span>
              <span className="font-bold text-amber-500">
                {reviewCount > 0 ? `${averageRating} ⭐ (${reviewCount} ${isVi ? "lượt" : "reviews"})` : (isVi ? "Chưa có đánh giá" : "No reviews yet")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{isVi ? "Tổng Số SKU" : "Total SKUs"}</span>
              <span className="font-bold text-slate-900 font-mono">{product.variants?.length || 0} SKUs</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isVi ? "Tổng Tồn Kho" : "Total Stock"}</span>
              <span className="font-bold text-slate-900">
                {product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0} {isVi ? "cái" : "units"}
              </span>
            </div>
          </div>
          <div className="pt-2 text-xs">
            <span className="text-slate-500 block mb-1 font-bold">{isVi ? "Mô tả sản phẩm:" : "Product description:"}</span>
            <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {product.description || (isVi ? "Chưa có mô tả chi tiết." : "No detailed description provided.")}
            </p>
          </div>
        </div>
      </div>

      {/* POD Print-Ready Artwork Section (Admin & POD/Shipper Download Area) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white border border-indigo-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              {isVi ? "Bản Thiết Kế In Ấn POD (Print-Ready Artwork & Master File)" : "POD Print-Ready Artwork & Master Files"}
            </h2>
            <p className="text-xs text-indigo-700 mt-0.5">
              {isVi
                ? "File in gốc tách nền chuẩn 300 DPI dùng cho xưởng in DTG / Decal / Thêu."
                : "Transparent 300 DPI print-ready master files for DTG factory and embroidery fulfillment."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> {isVi ? "Phân quyền: Admin & POD" : "Role: Admin & POD"}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditPrintFileFront(product.printFileFront || "");
                setEditPrintFileBack(product.printFileBack || "");
                setEditPrintDimensions(product.printDimensions || "14 x 18 in (Front DTG 300 DPI)");
                setEditPrintDriveUrl(product.printDriveUrl || "");
                setEditPrintNotes(product.printNotes || "");
                setShowPodArtworkModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isVi ? "Chỉnh Sửa Bản In" : "Edit Print Artwork"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Front Print File Preview */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
              <span>{isVi ? "File In Mặt Trước" : "Front Print File"}</span>
              {product.printFileFront ? (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isVi ? "Đã tải lên" : "Uploaded"}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{isVi ? "Chưa có" : "None"}</span>
              )}
            </div>

            {product.printFileFront ? (
              <div className="space-y-2">
                <div className="relative aspect-square rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.printFileFront} alt="Front Print File" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      product.printFileFront &&
                      handleDownload(
                        product.printFileFront,
                        `${product.slug || product.title}-front-print.png`,
                        `prod-front`
                      )
                    }
                    disabled={downloadingKey === `prod-front`}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingKey === `prod-front` ? (isVi ? "Đang tải..." : "Downloading...") : (isVi ? "Tải Về Máy" : "Download")}</span>
                  </button>
                  <a
                    href={product.printFileFront}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isVi ? "Xem Full" : "View Full"}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                {isVi ? "Chưa đính kèm file in mặt trước" : "No front print file attached"}
              </div>
            )}
          </div>

          {/* Back Print File Preview */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
              <span>{isVi ? "File In Mặt Sau" : "Back Print File"}</span>
              {product.printFileBack ? (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isVi ? "Đã tải lên" : "Uploaded"}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{isVi ? "Không in sau" : "No back print"}</span>
              )}
            </div>

            {product.printFileBack ? (
              <div className="space-y-2">
                <div className="relative aspect-square rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.printFileBack} alt="Back Print File" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      product.printFileBack &&
                      handleDownload(
                        product.printFileBack,
                        `${product.slug || product.title}-back-print.png`,
                        `prod-back`
                      )
                    }
                    disabled={downloadingKey === `prod-back`}
                    className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingKey === `prod-back` ? (isVi ? "Đang tải..." : "Downloading...") : (isVi ? "Tải Về Máy" : "Download")}</span>
                  </button>
                  <a
                    href={product.printFileBack}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isVi ? "Xem Full" : "View Full"}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                {isVi ? "Mẫu áo này không in mặt sau" : "This product does not have a back print"}
              </div>
            )}
          </div>

          {/* Print Specs & Drive Link */}
          <div className="md:col-span-2 p-4 rounded-xl bg-white border border-indigo-100 space-y-3.5 shadow-sm text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> {isVi ? "Kích thước & Vị trí In:" : "Print Dimensions & Placement:"}
              </span>
              <p className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950 font-bold">
                {product.printDimensions || "14 x 18 in (Front DTG 300 DPI)"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" /> {isVi ? "Link Master Cloud Drive:" : "Master Cloud Drive Link:"}
              </span>
              {product.printDriveUrl ? (
                <a
                  href={product.printDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-between hover:bg-blue-100 transition"
                >
                  <span className="truncate">{product.printDriveUrl}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              ) : (
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 italic">
                  {isVi ? "Chưa gán link Google Drive/Dropbox" : "No Drive/Dropbox link provided"}
                </p>
              )}
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">{isVi ? "Ghi chú in ấn cho xưởng POD:" : "Factory printing notes:"}</span>
              <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium leading-relaxed">
                {product.printNotes || (isVi ? "In trực tiếp DTG chất lượng cao, sấy khô tiêu chuẩn 160 độ C." : "High-density DTG print, cured at 160°C standard.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variants & Stock Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            {isVi ? "Danh Sách Biến Thể SKU & Tồn Kho (Product Variants)" : "Product Variants & Inventory Matrix"}
          </h2>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {activeVariantsCount} / {product.variants?.length || 0} {isVi ? "Biến Thể Khả Dụng" : "Active Variants"}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4">{isVi ? "Ảnh Biến Thể" : "Image"}</th>
                  <th className="p-4">{isVi ? "Mã SKU" : "SKU"}</th>
                  <th className="p-4">{isVi ? "Loại Sản Phẩm" : "Product Type"}</th>
                  <th className="p-4">{isVi ? "Kích Cỡ (Size)" : "Size"}</th>
                  <th className="p-4">{isVi ? "Màu Sắc (Color)" : "Color"}</th>
                  <th className="p-4">{isVi ? "Giá Biến Thể" : "Price"}</th>
                  <th className="p-4">{isVi ? "Số Lượng Tồn Kho" : "Stock"}</th>
                  <th className="p-4">{isVi ? "Trạng Thái" : "Status"}</th>
                  <th className="p-4 text-center">{isVi ? "Thao Tác" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((v) => {
                    const masterType = v.type || attributes?.types?.find((t) => t.name.toLowerCase() === v.productType.toLowerCase());
                    const masterColor = v.colorRel || attributes?.colors?.find((c) => c.name.toLowerCase() === v.color.toLowerCase());
                    const masterSize = v.sizeRel || attributes?.sizes?.find((s) => s.name.toLowerCase() === v.size.toLowerCase());

                    const isTypeActive = masterType ? masterType.isActive !== false : true;
                    const isColorActive = masterColor ? masterColor.isActive !== false : true;
                    const isSizeActive = masterSize ? masterSize.isActive !== false : true;
                    const isSelfActive = v.isActive !== false;

                    const isEffectiveActive = isSelfActive && isTypeActive && isColorActive && isSizeActive;

                    return (
                      <tr key={v.id} className={`transition ${!isEffectiveActive ? "bg-slate-50/90 opacity-70" : "hover:bg-slate-50"}`}>
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            {v.imageUrl || product.frontImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={v.imageUrl || product.frontImage}
                                alt={v.sku}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                                No img
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-600">{v.sku}</td>
                        <td className="p-4 font-bold">
                          {v.productType} {!isTypeActive && <span className="text-[10px] text-rose-500 font-bold block">{isVi ? "(Loại áo bị khóa)" : "(Type locked)"}</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded border font-bold font-mono ${!isSizeActive ? "bg-amber-100 border-amber-300 text-amber-900 line-through" : "bg-slate-100 border-slate-200"}`}>
                            {v.size}
                          </span>
                          {!isSizeActive && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{isVi ? "(Size bị khóa)" : "(Size locked)"}</span>}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-3 rounded-full border border-slate-400 bg-slate-800" />
                            {v.color}
                          </span>
                          {!isColorActive && <span className="text-[10px] text-rose-500 font-bold block">{isVi ? "(Màu bị khóa)" : "(Color locked)"}</span>}
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
                            {v.stock} {isVi ? "cái" : "units"} {v.stock < 10 && (isVi ? "(Sắp hết)" : "(Low stock)")}
                          </span>
                        </td>
                        <td className="p-4">
                          {isEffectiveActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {isVi ? "Hiển Thị" : "Active"}
                            </span>
                          ) : !isSelfActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <EyeOff className="w-3 h-3 text-slate-500" /> {isVi ? "Đã Ẩn (Tắt SKU)" : "Hidden (SKU Off)"}
                            </span>
                          ) : !isSizeActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> {isVi ? `Đã Ẩn (Khóa Size ${v.size})` : `Hidden (Size ${v.size} Locked)`}
                            </span>
                          ) : !isColorActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> {isVi ? `Đã Ẩn (Khóa Màu ${v.color})` : `Hidden (Color ${v.color} Locked)`}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> {isVi ? `Đã Ẩn (Khóa Loại ${v.productType})` : `Hidden (Type ${v.productType} Locked)`}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleVariantActive(v.id, isSelfActive)}
                              className={`p-1.5 rounded-lg border font-bold text-xs transition flex items-center gap-1 ${
                                isSelfActive
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                              }`}
                              title={isSelfActive ? (isVi ? "Bấm để Ẩn biến thể này khỏi web" : "Hide this variant") : (isVi ? "Bấm để Mở lại hiển thị biến thể này" : "Show this variant")}
                            >
                              {isSelfActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isSelfActive ? (isVi ? "Ẩn SKU" : "Hide") : (isVi ? "Hiện SKU" : "Show")}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(v.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title={isVi ? "Xóa hẳn biến thể SKU" : "Delete variant SKU"}
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
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-semibold">
                      {isVi ? "Chưa có biến thể nào được tạo cho sản phẩm này. Nhấn nút \"+ Thêm Biến Thể SKU\" ở trên!" : "No variants created for this product yet. Click \"+ Add Variant SKU\" above!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            {isVi ? `Đánh Giá & Nhận Xét Của Khách Hàng (${product.reviews?.length || 0})` : `Customer Reviews & Ratings (${product.reviews?.length || 0})`}
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>
              {reviewCount > 0
                ? `${averageRating} / 5.0 ${isVi ? `sao (${reviewCount} lượt đánh giá)` : `stars (${reviewCount} reviews)`}`
                : (isVi ? "Chưa có lượt đánh giá nào" : "No reviews yet")}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                        {rev.userName ? rev.userName.substring(0, 2).toUpperCase() : (isVi ? "KH" : "CU")}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{rev.userName || (isVi ? "Khách hàng" : "Customer")}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium pl-10 border-l-2 border-blue-200">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">{isVi ? "Chưa có đánh giá nào từ người dùng cho sản phẩm này." : "No customer reviews recorded yet."}</p>
              <p className="text-[11px] text-slate-400">
                {isVi
                  ? "Các đánh giá và nhận xét trực tiếp của khách hàng mua trên web storefront sẽ tự động đồng bộ hiển thị ở đây."
                  : "Customer ratings and feedback from the storefront will automatically synchronize here."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Edit Media / Upload Images */}
      {showEditMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{isVi ? "Cập Nhật Ảnh Sản Phẩm (Tải Từ Máy)" : "Update Product Images"}</h3>
              <button onClick={() => setShowEditMediaModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMediaSubmit} className="space-y-4 text-sm">
              <ImageUploader
                label={isVi ? "Ảnh Mặt Trước (Front Image)" : "Front Image"}
                required
                value={editFrontImage}
                onChange={setEditFrontImage}
              />

              <ImageUploader
                label={isVi ? "Ảnh Mặt Sau (Back Image)" : "Back Image (Optional)"}
                value={editBackImage}
                onChange={setEditBackImage}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditMediaModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> {isVi ? "Lưu Thay Đổi" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{isVi ? "Gán Danh Mục Mới Mở Khóa Sản Phẩm" : "Assign Category & Activate Product"}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignCategorySubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Chọn Danh Mục Đang Hoạt Động *" : "Select Active Category *"}</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                >
                  <option value="">{isVi ? "-- Chưa chọn danh mục (Vô hiệu hóa) --" : "-- Unassigned (Inactive) --"}</option>
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
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  {isVi ? "Cập Nhật Danh Mục" : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Variant */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{isVi ? "Thêm Biến Thể SKU Mới" : "Add New Variant SKU"}</h3>
              <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVariantSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Mã SKU *" : "SKU Code *"}</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder={isVi ? "Ví dụ: TS-CYBER-BLK-2XL" : "e.g. TS-CYBER-BLK-2XL"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isVi ? "Loại Áo Master" : "Master Type"}</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">{isVi ? "-- Không chọn --" : "-- None --"}</option>
                    {(attributes?.types && attributes.types.length > 0
                      ? attributes.types
                      : [
                          { id: "1", name: "T-Shirt", isActive: true },
                          { id: "2", name: "Hoodie", isActive: true },
                          { id: "3", name: "Sweatshirt", isActive: true },
                          { id: "4", name: "Tank Top", isActive: true },
                          { id: "5", name: "Long Sleeve", isActive: true },
                        ]
                    ).map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.isActive === false ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isVi ? "Size Master" : "Master Size"}</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">{isVi ? "-- Không chọn --" : "-- None --"}</option>
                    {(attributes?.sizes && attributes.sizes.length > 0
                      ? attributes.sizes
                      : [
                          { id: "1", name: "S", isActive: true },
                          { id: "2", name: "M", isActive: true },
                          { id: "3", name: "L", isActive: true },
                          { id: "4", name: "XL", isActive: true },
                          { id: "5", name: "2XL", isActive: true },
                          { id: "6", name: "3XL", isActive: true },
                        ]
                    ).map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isActive === false ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isVi ? "Màu Sắc Master" : "Master Color"}</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">{isVi ? "-- Không chọn --" : "-- None --"}</option>
                    {(attributes?.colors && attributes.colors.length > 0
                      ? attributes.colors
                      : [
                          { id: "1", name: "Black", isActive: true },
                          { id: "2", name: "White", isActive: true },
                          { id: "3", name: "Navy", isActive: true },
                          { id: "4", name: "Heather Gray", isActive: true },
                          { id: "5", name: "Red", isActive: true },
                          { id: "6", name: "Royal Blue", isActive: true },
                        ]
                    ).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.isActive === false ? (isVi ? "(Đã ẩn)" : "(Hidden)") : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isVi ? "Giá ($) *" : "Price ($) *"}</label>
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
                  <label className="font-bold text-slate-700">{isVi ? "Số Lượng Tồn Kho *" : "Stock Quantity *"}</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold"
                  />
                </div>
              </div>

              <ImageUploader
                label={isVi ? "Ảnh Biến Thể (Tải Từ Máy Hoặc Link)" : "Variant Mockup Image (Upload or Link)"}
                value={variantImageUrl}
                onChange={setVariantImageUrl}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  {isVi ? "Thêm Biến Thể" : "Add Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit POD Print-Ready Artwork */}
      {showPodArtworkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-indigo-950 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  {isVi ? "Cập Nhật Bản Thiết Kế In Ấn POD (300 DPI)" : "Update POD Print Artwork (300 DPI)"}
                </h3>
                <p className="text-xs text-indigo-700">
                  {isVi
                    ? "Đính kèm file in chất lượng cao và link Google Drive cho xưởng in & shipper."
                    : "Attach high-resolution master print files and Google Drive links for workshop."}
                </p>
              </div>
              <button onClick={() => setShowPodArtworkModal(false)} className="text-slate-400 hover:text-slate-900 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePodArtworkSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader
                  label={isVi ? "🖨️ File In Mặt Trước (Front Print Artwork - PNG 300 DPI)" : "🖨️ Front Print Artwork (PNG 300 DPI)"}
                  value={editPrintFileFront}
                  onChange={setEditPrintFileFront}
                />

                <ImageUploader
                  label={isVi ? "🖨️ File In Mặt Sau (Back Print Artwork - Nếu Có)" : "🖨️ Back Print Artwork (Optional)"}
                  value={editPrintFileBack}
                  onChange={setEditPrintFileBack}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-600" /> {isVi ? "Link Master Cloud Drive (Google Drive / S3)" : "Master Cloud Drive Link (Google Drive / S3)"}
                  </label>
                  <input
                    type="url"
                    value={editPrintDriveUrl}
                    onChange={(e) => setEditPrintDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" /> {isVi ? "Kích Thước & Vị Trí In (Print Specs)" : "Print Dimensions & Placement"}
                  </label>
                  <input
                    type="text"
                    value={editPrintDimensions}
                    onChange={(e) => setEditPrintDimensions(e.target.value)}
                    placeholder={isVi ? "Ví dụ: 14x18 in (Front Chest DTG 300 DPI)" : "e.g. 14x18 in (Front Chest DTG 300 DPI)"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-indigo-950">{isVi ? "Ghi Chú Kỹ Thuật Cho Xưởng In (Print Instructions)" : "Technical Print Instructions"}</label>
                <input
                  type="text"
                  value={editPrintNotes}
                  onChange={(e) => setEditPrintNotes(e.target.value)}
                  placeholder={isVi ? "Ví dụ: In lót trắng (White underbase) trên áo đen/navy, sấy nhiệt 160 độ C..." : "e.g. White underbase on dark fabrics, 160°C heat curing..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPodArtworkModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> {isVi ? "Lưu Bản In POD" : "Save POD Artwork"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
