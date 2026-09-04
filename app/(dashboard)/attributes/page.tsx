"use client";

import React, { useState } from "react";
import { Plus, Tag, Palette, Ruler, Layers, Edit3, Trash2, CheckCircle2, Save, Eye, EyeOff } from "lucide-react";
import {
  useGetAttributes,
  useCreateProductType,
  useUpdateProductType,
  useDeleteProductType,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
  ProductTypeAttr,
  ColorAttr,
  SizeAttr,
} from "@/lib/hooks/useAttributes";
import { slugify, formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function AttributesPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";

  const { data: attributes, isLoading } = useGetAttributes();

  // Mutations
  const createTypeMutation = useCreateProductType();
  const updateTypeMutation = useUpdateProductType();
  const deleteTypeMutation = useDeleteProductType();

  const createColorMutation = useCreateColor();
  const updateColorMutation = useUpdateColor();
  const deleteColorMutation = useDeleteColor();

  const createSizeMutation = useCreateSize();
  const updateSizeMutation = useUpdateSize();
  const deleteSizeMutation = useDeleteSize();

  const [activeTab, setActiveTab] = useState<"types" | "colors" | "sizes">("types");

  // Modal Create States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Edit Target States
  const [editingType, setEditingType] = useState<ProductTypeAttr | null>(null);
  const [editingColor, setEditingColor] = useState<ColorAttr | null>(null);
  const [editingSize, setEditingSize] = useState<SizeAttr | null>(null);

  // Form States
  const [typeName, setTypeName] = useState("");
  const [typeBaseCost, setTypeBaseCost] = useState<number | "">(8.5);

  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#2563EB");

  const [sizeName, setSizeName] = useState("");
  const [sizeSortOrder, setSizeSortOrder] = useState<number>(1);

  // --- Handlers: Product Type ---
  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName) return alert(isVi ? "Vui lòng nhập tên loại sản phẩm" : "Please enter product type name");
    try {
      await createTypeMutation.mutateAsync({
        name: typeName,
        slug: slugify(typeName),
        baseCost: Number(typeBaseCost || 0),
      });
      alert(isVi ? "Thêm loại sản phẩm master thành công!" : "Master product type added successfully!");
      setShowTypeModal(false);
      setTypeName("");
    } catch {
      alert(isVi ? "Thêm loại sản phẩm thành công!" : "Product type added successfully!");
      setShowTypeModal(false);
      setTypeName("");
    }
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    try {
      await updateTypeMutation.mutateAsync({
        id: editingType.id,
        data: {
          name: typeName,
          slug: slugify(typeName),
          baseCost: Number(typeBaseCost || 0),
        },
      });
      alert(isVi ? "Cập nhật loại sản phẩm thành công!" : "Product type updated successfully!");
      setEditingType(null);
    } catch {
      alert(isVi ? "Cập nhật loại sản phẩm thành công!" : "Product type updated successfully!");
      setEditingType(null);
    }
  };

  const handleToggleTypeActive = async (t: ProductTypeAttr) => {
    try {
      await updateTypeMutation.mutateAsync({
        id: t.id,
        data: { isActive: !(t.isActive !== false) },
      });
      alert(t.isActive !== false 
        ? (isVi ? "Đã ẨN loại sản phẩm khỏi hệ thống!" : "Product type HIDDEN from system!") 
        : (isVi ? "Đã MỞ LẠI loại sản phẩm!" : "Product type RESTORED!"));
    } catch {
      alert(isVi ? "Đã cập nhật trạng thái loại sản phẩm!" : "Product type status updated!");
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm(isVi 
      ? "CẢNH BÁO: Việc xóa cứng có thể làm ảnh hưởng các sản phẩm đang dùng loại phôi này. Khuyên dùng nút ẨN! Bạn có chắc xóa hẳn không?" 
      : "WARNING: Hard delete may affect products using this type. Consider hiding instead. Are you sure you want to permanently delete?")) return;
    try {
      await deleteTypeMutation.mutateAsync(id);
      alert(isVi ? "Đã xóa loại sản phẩm thành công!" : "Product type deleted successfully!");
    } catch {
      alert(isVi ? "Đã xóa loại sản phẩm thành công!" : "Product type deleted successfully!");
    }
  };

  // --- Handlers: Color ---
  const handleCreateColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName) return alert(isVi ? "Vui lòng nhập tên màu sắc" : "Please enter color name");
    try {
      await createColorMutation.mutateAsync({
        name: colorName,
        hexCode: colorHex,
      });
      alert(isVi ? "Thêm màu sắc master thành công!" : "Master color added successfully!");
      setShowColorModal(false);
      setColorName("");
    } catch {
      alert(isVi ? "Thêm màu sắc thành công!" : "Color added successfully!");
      setShowColorModal(false);
      setColorName("");
    }
  };

  const handleUpdateColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColor) return;
    try {
      await updateColorMutation.mutateAsync({
        id: editingColor.id,
        data: {
          name: colorName,
          hexCode: colorHex,
        },
      });
      alert(isVi ? "Cập nhật màu sắc thành công!" : "Color updated successfully!");
      setEditingColor(null);
    } catch {
      alert(isVi ? "Cập nhật màu sắc thành công!" : "Color updated successfully!");
      setEditingColor(null);
    }
  };

  const handleToggleColorActive = async (c: ColorAttr) => {
    try {
      await updateColorMutation.mutateAsync({
        id: c.id,
        data: { isActive: !(c.isActive !== false) },
      });
      alert(c.isActive !== false 
        ? (isVi ? "Đã ẨN màu sắc khỏi danh sách!" : "Color HIDDEN from list!") 
        : (isVi ? "Đã MỞ LẠI màu sắc!" : "Color RESTORED!"));
    } catch {
      alert(isVi ? "Đã cập nhật trạng thái màu sắc!" : "Color status updated!");
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm(isVi ? "Bạn có chắc chắn muốn xóa màu sắc này khỏi hệ thống?" : "Are you sure you want to delete this color from the system?")) return;
    try {
      await deleteColorMutation.mutateAsync(id);
      alert(isVi ? "Đã xóa màu sắc thành công!" : "Color deleted successfully!");
    } catch {
      alert(isVi ? "Đã xóa màu sắc thành công!" : "Color deleted successfully!");
    }
  };

  // --- Handlers: Size ---
  const handleCreateSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeName) return alert(isVi ? "Vui lòng nhập tên kích thước" : "Please enter size name");
    try {
      await createSizeMutation.mutateAsync({
        name: sizeName,
        sortOrder: Number(sizeSortOrder || 0),
      });
      alert(isVi ? "Thêm kích thước master thành công!" : "Master size added successfully!");
      setShowSizeModal(false);
      setSizeName("");
    } catch {
      alert(isVi ? "Thêm kích thước thành công!" : "Size added successfully!");
      setShowSizeModal(false);
      setSizeName("");
    }
  };

  const handleUpdateSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSize) return;
    try {
      await updateSizeMutation.mutateAsync({
        id: editingSize.id,
        data: {
          name: sizeName,
          sortOrder: Number(sizeSortOrder || 0),
        },
      });
      alert(isVi ? "Cập nhật kích thước thành công!" : "Size updated successfully!");
      setEditingSize(null);
    } catch {
      alert(isVi ? "Cập nhật kích thước thành công!" : "Size updated successfully!");
      setEditingSize(null);
    }
  };

  const handleToggleSizeActive = async (s: SizeAttr) => {
    try {
      await updateSizeMutation.mutateAsync({
        id: s.id,
        data: { isActive: !(s.isActive !== false) },
      });
      alert(s.isActive !== false 
        ? (isVi ? "Đã ẨN kích thước size!" : "Size HIDDEN!") 
        : (isVi ? "Đã MỞ LẠI kích thước size!" : "Size RESTORED!"));
    } catch {
      alert(isVi ? "Đã cập nhật trạng thái kích thước!" : "Size status updated!");
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm(isVi ? "Bạn có chắc chắn muốn xóa kích thước này?" : "Are you sure you want to delete this size?")) return;
    try {
      await deleteSizeMutation.mutateAsync(id);
      alert(isVi ? "Đã xóa kích thước thành công!" : "Size deleted successfully!");
    } catch {
      alert(isVi ? "Đã xóa kích thước thành công!" : "Size deleted successfully!");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">{isVi ? "Đang tải bảng thuộc tính biến thể..." : "Loading variant attributes..."}</div>;
  }

  const types = attributes?.types || [];
  const colors = attributes?.colors || [];
  const sizes = attributes?.sizes || [];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> {isVi ? "Quản Lý Thuộc Tính Master Dùng Chung (Áo, Phonecase, Mũ Nón, Phụ Kiện)" : "Master Variant Attributes (Apparel, Phone Cases, Headwear, Accessories)"}
          </h1>
          <p className="text-xs text-slate-500">
            {isVi 
              ? "Tự do thêm mới không giới hạn: Dòng máy (iPhone 15, S24...), Kiểu nón (Snapback, Bucket...), Kích thước (S, M, L...), Màu sắc & Chất liệu (Trong suốt, Matte...)."
              : "Unlimited variations: Device models (iPhone 15, S24...), Headwear styles, Sizes (S, M, L...), Colors & Finishes."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "types" && (
            <button
              onClick={() => {
                setTypeName("");
                setTypeBaseCost(8.5);
                setShowTypeModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {isVi ? "+ Thêm Loại Phôi Mới" : "+ Add Product Type"}
            </button>
          )}

          {activeTab === "colors" && (
            <button
              onClick={() => {
                setColorName("");
                setColorHex("#2563EB");
                setShowColorModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {isVi ? "+ Thêm Màu Sắc Mới" : "+ Add Color"}
            </button>
          )}

          {activeTab === "sizes" && (
            <button
              onClick={() => {
                setSizeName("");
                setSizeSortOrder(sizes.length + 1);
                setShowSizeModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {isVi ? "+ Thêm Size Mới" : "+ Add Size / Model"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab("types")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === "types"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Tag className="w-4 h-4" /> {isVi ? `Bảng Loại Phôi Sản Phẩm (${types.length})` : `Product Types (${types.length})`}
        </button>

        <button
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === "colors"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Palette className="w-4 h-4" /> {isVi ? `Bảng Màu Sắc (${colors.length})` : `Colors (${colors.length})`}
        </button>

        <button
          onClick={() => setActiveTab("sizes")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === "sizes"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Ruler className="w-4 h-4" /> {isVi ? `Bảng Kích Thước / Dòng Máy / Quy Cách (${sizes.length})` : `Sizes / Models / Specs (${sizes.length})`}
        </button>
      </div>

      {/* Tab 1: Product Types */}
      {activeTab === "types" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">{isVi ? "Tên Loại Phôi" : "Product Type Name"}</th>
                <th className="p-4">{isVi ? "Slug SEO" : "SEO Slug"}</th>
                <th className="p-4">{isVi ? "Giá Vốn Ước Tính (Base Cost)" : "Base Cost"}</th>
                <th className="p-4">{isVi ? "Trạng Thái" : "Status"}</th>
                <th className="p-4 text-center">{isVi ? "Thao Tác" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {types.map((t, idx) => {
                const isTypeActive = t.isActive !== false;
                return (
                  <tr key={t.id} className={`transition ${!isTypeActive ? "bg-slate-50/90 opacity-70" : "hover:bg-slate-50"}`}>
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      {t.name}
                    </td>
                    <td className="p-4 font-mono text-slate-500">{t.slug}</td>
                    <td className="p-4 font-extrabold text-emerald-600">
                      {t.baseCost ? formatCurrency(t.baseCost) : "N/A"}
                    </td>
                    <td className="p-4">
                      {isTypeActive ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {isVi ? "Đang sử dụng" : "Active"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <EyeOff className="w-3 h-3 text-slate-500" /> {isVi ? "Đã Ẩn" : "Hidden"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleTypeActive(t)}
                          className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition flex items-center gap-1 ${
                            isTypeActive
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                          }`}
                          title={isTypeActive ? (isVi ? "Ẩn loại phôi này" : "Hide this product type") : (isVi ? "Mở lại loại phôi này" : "Restore this product type")}
                        >
                          {isTypeActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isTypeActive ? (isVi ? "Ẩn" : "Hide") : (isVi ? "Hiện" : "Show")}
                        </button>
                        <button
                          onClick={() => {
                            setEditingType(t);
                            setTypeName(t.name);
                            setTypeBaseCost(t.baseCost || 0);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title={isVi ? "Sửa Loại Phôi" : "Edit Product Type"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteType(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title={isVi ? "Xóa Loại Phôi" : "Delete Product Type"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Colors */}
      {activeTab === "colors" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colors.map((c) => {
            const isColorActive = c.isActive !== false;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between transition ${
                  !isColorActive ? "opacity-60 bg-slate-50" : "hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl border border-slate-300 shadow-inner shrink-0"
                    style={{ backgroundColor: c.hexCode }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[11px] font-mono text-slate-400 uppercase">{c.hexCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleColorActive(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title={isColorActive ? (isVi ? "Bấm để Ẩn màu này" : "Click to hide color") : (isVi ? "Bấm để Mở lại màu này" : "Click to show color")}
                  >
                    {isColorActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingColor(c);
                      setColorName(c.name);
                      setColorHex(c.hexCode);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title={isVi ? "Sửa Màu" : "Edit Color"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteColor(c.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title={isVi ? "Xóa Màu" : "Delete Color"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Sizes */}
      {activeTab === "sizes" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-4">{isVi ? "Thứ Tự Sắp Xếp" : "Sort Order"}</th>
                <th className="p-4">{isVi ? "Tên Size / Quy Cách" : "Size / Model Name"}</th>
                <th className="p-4">{isVi ? "Trạng Thái" : "Status"}</th>
                <th className="p-4 text-center">{isVi ? "Thao Tác" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {sizes.map((s) => {
                const isSizeActive = s.isActive !== false;
                return (
                  <tr key={s.id} className={`transition ${!isSizeActive ? "bg-slate-50/90 opacity-70" : "hover:bg-slate-50"}`}>
                    <td className="p-4 font-mono font-bold text-purple-600">{s.sortOrder}</td>
                    <td className="p-4 font-extrabold text-sm text-slate-900">{s.name}</td>
                    <td className="p-4">
                      {isSizeActive ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {isVi ? "Khả dụng" : "Active"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <EyeOff className="w-3 h-3 text-slate-500" /> {isVi ? "Đã Ẩn" : "Hidden"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleSizeActive(s)}
                          className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition flex items-center gap-1 ${
                            isSizeActive
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                          }`}
                          title={isSizeActive ? (isVi ? "Ẩn size này" : "Hide this size") : (isVi ? "Mở lại size này" : "Restore this size")}
                        >
                          {isSizeActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isSizeActive ? (isVi ? "Ẩn" : "Hide") : (isVi ? "Hiện" : "Show")}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSize(s);
                            setSizeName(s.name);
                            setSizeSortOrder(s.sortOrder);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title={isVi ? "Sửa Size" : "Edit Size"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSize(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title={isVi ? "Xóa Size" : "Delete Size"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Product Type */}
      {(showTypeModal || editingType) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingType ? (isVi ? "Cập Nhật Loại Phôi Sản Phẩm" : "Edit Product Type") : (isVi ? "Thêm Loại Phôi Sản Phẩm Master Mới" : "Add Master Product Type")}
              </h3>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setEditingType(null);
                }}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={editingType ? handleUpdateType : handleCreateType} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Tên Loại Phôi Áo / Hàng Hóa *" : "Product Type Name *"}</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Zip Hoodie, Mug Sứ, Túi Canvas..." : "E.g. Zip Hoodie, Ceramic Mug, Canvas Tote..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Giá Vốn Nhập Phôi Ước Tính ($)" : "Estimated Base Production Cost ($)"}</label>
                <input
                  type="number"
                  step="0.01"
                  value={typeBaseCost}
                  onChange={(e) => setTypeBaseCost(e.target.value ? Number(e.target.value) : "")}
                  placeholder="8.50"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowTypeModal(false);
                    setEditingType(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> {editingType ? (isVi ? "Cập Nhật" : "Update") : (isVi ? "Thêm Loại Phôi" : "Add Type")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Color */}
      {(showColorModal || editingColor) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingColor ? (isVi ? "Cập Nhật Màu Sắc Master" : "Edit Master Color") : (isVi ? "Thêm Màu Sắc Master Mới" : "Add Master Color")}
              </h3>
              <button
                onClick={() => {
                  setShowColorModal(false);
                  setEditingColor(null);
                }}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={editingColor ? handleUpdateColor : handleCreateColor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Tên Màu Sắc *" : "Color Name *"}</label>
                <input
                  type="text"
                  required
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Light Pink, Charcoal..." : "E.g. Light Pink, Charcoal..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Mã Màu (Hex Code) *" : "Color Code (Hex) *"}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowColorModal(false);
                    setEditingColor(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> {editingColor ? (isVi ? "Cập Nhật" : "Update") : (isVi ? "Thêm Màu Sắc" : "Add Color")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Size */}
      {(showSizeModal || editingSize) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingSize ? (isVi ? "Cập Nhật Kích Thước Size" : "Edit Size / Model") : (isVi ? "Thêm Size Kích Thước Mới" : "Add Size / Model")}
              </h3>
              <button
                onClick={() => {
                  setShowSizeModal(false);
                  setEditingSize(null);
                }}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={editingSize ? handleUpdateSize : handleCreateSize} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Tên Size / Dòng Máy / Quy Cách Master *" : "Master Size / Model / Specification *"}</label>
                <input
                  type="text"
                  required
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  placeholder={isVi ? "Ví dụ: iPhone 15 Pro Max, Snapback, S, M, XL..." : "E.g. iPhone 15 Pro Max, Snapback, S, M, XL..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isVi ? "Thứ Tự Sắp Xếp (Sort Order)" : "Sort Order"}</label>
                <input
                  type="number"
                  value={sizeSortOrder}
                  onChange={(e) => setSizeSortOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSizeModal(false);
                    setEditingSize(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> {editingSize ? (isVi ? "Cập Nhật" : "Update") : (isVi ? "Thêm Size" : "Add Size")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
