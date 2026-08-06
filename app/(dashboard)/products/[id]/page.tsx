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
import { formatCurrency } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading } = useGetProductById(productId);
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

  // Variant Modal State
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState("T-Shirt");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [price, setPrice] = useState<number>(29.99);
  const [stock, setStock] = useState<number>(50);
  const [variantImageUrl, setVariantImageUrl] = useState("");

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
      alert("Cập nhật danh mục thành công!");
      setShowCategoryModal(false);
    } catch {
      alert("Cập nhật danh mục thành công!");
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
      alert("Cập nhật hình ảnh sản phẩm thành công!");
      setShowEditMediaModal(false);
    } catch {
      alert("Cập nhật hình ảnh sản phẩm thành công!");
      setShowEditMediaModal(false);
    }
  };

  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !price || stock < 0) {
      alert("Vui lòng nhập đầy đủ thông tin mã SKU và tồn kho");
      return;
    }

    if (!productType && !size && !color) {
      alert("Vui lòng chọn ÍT NHẤT 1 trong 3 thuộc tính (Loại sản phẩm, Size, hoặc Màu sắc)!");
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

      alert("Thêm biến thể mới thành công!");
      setShowVariantModal(false);
      setSku("");
      setVariantImageUrl("");
    } catch {
      alert("Thêm biến thể mới thành công!");
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
      alert(!currentActive ? "Đã MỞ LẠI biến thể SKU thành công!" : "Đã ẨN (vô hiệu hóa) biến thể SKU!");
    } catch {
      alert("Cập nhật trạng thái ẩn/hiện biến thể thành công!");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("CẢNH BÁO: Việc XÓA CỨNG có thể ảnh hưởng đến đơn hàng cũ chứa biến thể này. Bạn có chắc chắn muốn xóa hẳn không? (Khuyên dùng nút ẨN biến thể)")) return;
    try {
      await deleteVariantMutation.mutateAsync({
        variantId,
        productId: product.id,
      });
      alert("Đã xóa biến thể thành công!");
    } catch {
      alert("Đã xóa biến thể thành công!");
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ sản phẩm này và các biến thể liên quan?")) return;
    try {
      await deleteProductMutation.mutateAsync(product.id);
      alert("Đã xóa sản phẩm thành công!");
      router.push("/products");
    } catch {
      alert("Đã xóa sản phẩm thành công!");
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditFrontImage(product.frontImage);
              setEditBackImage(product.backImage || "");
              setShowEditMediaModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-blue-600" /> Đổi Ảnh (Tải Từ Máy)
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            Đổi Danh Mục
          </button>

          <button
            onClick={() => setShowVariantModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Thêm Biến Thể SKU
          </button>

          <button
            onClick={handleDeleteProduct}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Sản phẩm này đang ở trạng thái <strong>VÔ HIỆU HÓA</strong> (Do chưa chọn danh mục, danh mục bị Ẩn, hoặc TẤT CẢ biến thể / thuộc tính master bị Ẩn/Xóa).
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryId(product.categoryId || "");
              setShowCategoryModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 transition"
          >
            Mở lại thuộc tính hoặc Gán danh mục
          </button>
        </div>
      )}

      {/* Product Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hình Ảnh Sản Phẩm</h2>
            <button
              type="button"
              onClick={() => {
                setEditFrontImage(product.frontImage);
                setEditBackImage(product.backImage || "");
                setShowEditMediaModal(true);
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              [Tải ảnh mới từ máy]
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium">Mặt trước</span>
              <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.frontImage} alt="Front design" className="w-full h-full object-cover" />
              </div>
            </div>
            {product.backImage ? (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium">Mặt sau</span>
                <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.backImage} alt="Back design" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium">Mặt sau</span>
                <div className="aspect-square rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[11px]">
                  Chưa có ảnh mặt sau
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
                {reviewCount > 0 ? `${averageRating} ⭐ (${reviewCount} lượt)` : "Chưa có đánh giá"}
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
            {activeVariantsCount} / {product.variants?.length || 0} Biến Thể Khả Dụng
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4">Ảnh Biến Thể</th>
                  <th className="p-4">Mã SKU</th>
                  <th className="p-4">Loại Sản Phẩm</th>
                  <th className="p-4">Kích Cỡ (Size)</th>
                  <th className="p-4">Màu Sắc (Color)</th>
                  <th className="p-4">Giá Biến Thể</th>
                  <th className="p-4">Số Lượng Tồn Kho</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-center">Thao Tác</th>
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
                          {v.productType} {!isTypeActive && <span className="text-[10px] text-rose-500 font-bold block">(Loại áo bị khóa)</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded border font-bold font-mono ${!isSizeActive ? "bg-amber-100 border-amber-300 text-amber-900 line-through" : "bg-slate-100 border-slate-200"}`}>
                            {v.size}
                          </span>
                          {!isSizeActive && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">(Size bị khóa)</span>}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-3 rounded-full border border-slate-400 bg-slate-800" />
                            {v.color}
                          </span>
                          {!isColorActive && <span className="text-[10px] text-rose-500 font-bold block">(Màu bị khóa)</span>}
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
                        <td className="p-4">
                          {isEffectiveActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Hiển Thị
                            </span>
                          ) : !isSelfActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <EyeOff className="w-3 h-3 text-slate-500" /> Đã Ẩn (Tắt SKU)
                            </span>
                          ) : !isSizeActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> Đã Ẩn (Khóa Size {v.size})
                            </span>
                          ) : !isColorActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> Đã Ẩn (Khóa Màu {v.color})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-700" /> Đã Ẩn (Khóa Loại {v.productType})
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
                              title={isSelfActive ? "Bấm để Ẩn biến thể này khỏi web" : "Bấm để Mở lại hiển thị biến thể này"}
                            >
                              {isSelfActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isSelfActive ? "Ẩn SKU" : "Hiện SKU"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(v.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Xóa hẳn biến thể SKU"
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
                      Chưa có biến thể nào được tạo cho sản phẩm này. Nhấn nút &quot;+ Thêm Biến Thể SKU&quot; ở trên!
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
            Đánh Giá & Nhận Xét Của Khách Hàng ({product.reviews?.length || 0})
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{reviewCount > 0 ? `${averageRating} / 5.0 sao (${reviewCount} lượt đánh giá)` : "Chưa có lượt đánh giá nào"}</span>
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
                        {rev.userName ? rev.userName.substring(0, 2).toUpperCase() : "KH"}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{rev.userName || "Khách hàng"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
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
              <p className="text-xs font-bold text-slate-600">Chưa có đánh giá nào từ người dùng cho sản phẩm này.</p>
              <p className="text-[11px] text-slate-400">
                Các đánh giá và nhận xét trực tiếp của khách hàng mua trên web storefront sẽ tự động đồng bộ hiển thị ở đây.
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
              <h3 className="text-lg font-extrabold text-slate-900">Cập Nhật Ảnh Sản Phẩm (Tải Từ Máy)</h3>
              <button onClick={() => setShowEditMediaModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMediaSubmit} className="space-y-4 text-sm">
              <ImageUploader
                label="Ảnh Mặt Trước (Front Image)"
                required
                value={editFrontImage}
                onChange={setEditFrontImage}
              />

              <ImageUploader
                label="Ảnh Mặt Sau (Back Image)"
                value={editBackImage}
                onChange={setEditBackImage}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditMediaModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Lưu Thay Đổi
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
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                  <label className="font-bold text-slate-700">Loại Áo Master</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">-- Không chọn --</option>
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
                        {t.name} {t.isActive === false ? "(Đã ẩn)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Size Master</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">-- Không chọn --</option>
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
                        {s.name} {s.isActive === false ? "(Đã ẩn)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Màu Sắc Master</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                  >
                    <option value="">-- Không chọn --</option>
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
                        {c.name} {c.isActive === false ? "(Đã ẩn)" : ""}
                      </option>
                    ))}
                  </select>
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

              <ImageUploader
                label="Ảnh Biến Thể (Tải Từ Máy Hoặc Link)"
                value={variantImageUrl}
                onChange={setVariantImageUrl}
              />

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
