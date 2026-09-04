"use client";

import React, { useState } from "react";
import { Plus, Trash2, Wand2, Palette, Ruler, Tag, Layers, Check } from "lucide-react";
import { DraftVariant, ProductVariant } from "@/types/product";
import { ImageUploader } from "./ImageUploader";
import { useGetAttributes } from "@/lib/hooks/useAttributes";
import { useLanguageStore } from "@/store/useLanguageStore";

interface VariantManagerProps {
  variants: (DraftVariant | ProductVariant)[];
  onChange: (updatedVariants: DraftVariant[]) => void;
  basePrice?: number;
  productTitle?: string;
}

export function VariantManager({
  variants,
  onChange,
  basePrice = 29.99,
  productTitle = "PRODUCT",
}: VariantManagerProps) {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const { data: attrData } = useGetAttributes();

  const availableTypes = attrData?.types && attrData.types.length > 0
    ? attrData.types.map((t) => t.name)
    : ["T-Shirt", "Hoodie", "Sweatshirt", "Tank Top", "Long Sleeve"];

  const availableSizes = attrData?.sizes && attrData.sizes.length > 0
    ? attrData.sizes.map((s) => s.name)
    : ["S", "M", "L", "XL", "2XL", "3XL"];

  const availableColors = attrData?.colors && attrData.colors.length > 0
    ? attrData.colors.map((c) => ({ name: c.name, hex: c.hexCode }))
    : [
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Navy", hex: "#1e293b" },
        { name: "Heather Gray", hex: "#94a3b8" },
        { name: "Red", hex: "#ef4444" },
        { name: "Royal Blue", hex: "#2563eb" },
      ];

  const [selectedTypes, setSelectedTypes] = useState<string[]>(["T-Shirt"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Black", "White", "Navy"]);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const generateMatrix = () => {
    if (selectedTypes.length === 0 && selectedSizes.length === 0 && selectedColors.length === 0) {
      alert(isVi ? "Vui lòng chọn ít nhất 1 thuộc tính (Loại sản phẩm, Size, hoặc Màu sắc)!" : "Please select at least 1 attribute (Product Type, Size, or Color)!");
      return;
    }

    const typesToUse = selectedTypes.length > 0 ? selectedTypes : ["N/A"];
    const colorsToUse = selectedColors.length > 0 ? selectedColors : ["N/A"];
    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ["N/A"];

    const newVariants: DraftVariant[] = [];
    const prefix = productTitle.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "POD");

    typesToUse.forEach((type) => {
      colorsToUse.forEach((color) => {
        sizesToUse.forEach((size) => {
          const typeCode = type !== "N/A" ? type.substring(0, 2).toUpperCase() : "NA";
          const colorCode = color !== "N/A" ? color.substring(0, 3).toUpperCase() : "NA";
          const sizeCode = size !== "N/A" ? size : "NA";
          const sku = `${prefix}-${typeCode}-${colorCode}-${sizeCode}`;

          // Avoid duplicating SKU if already exists
          const existing = variants.find((v) => v.sku === sku);
          if (!existing) {
            let priceAdjust = basePrice;
            if (type === "Hoodie") priceAdjust = basePrice + 15;
            if (type === "Sweatshirt") priceAdjust = basePrice + 10;
            if (["2XL", "3XL"].includes(size)) priceAdjust += 2;

            newVariants.push({
              sku,
              productType: type,
              size,
              color,
              price: Number(priceAdjust.toFixed(2)),
              originalPrice: Number((priceAdjust + 10).toFixed(2)),
              stock: 100,
              imageUrl: "",
            });
          }
        });
      });
    });

    onChange([...variants, ...newVariants]);
    setShowMatrixModal(false);
  };

  const handleAddManualRow = () => {
    const sku = `SKU-${Date.now().toString().slice(-6)}`;
    const newRow: DraftVariant = {
      sku,
      productType: availableTypes[0] || "T-Shirt",
      size: availableSizes[1] || "M",
      color: availableColors[0]?.name || "Black",
      price: basePrice,
      stock: 100,
      imageUrl: "",
    };
    onChange([...variants, newRow]);
  };

  const handleRowChange = (index: number, field: keyof DraftVariant, val: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  const handleDeleteRow = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> {isVi ? "Danh Sách Biến Thể Hàng Hóa" : "Product Variant Matrix"} ({variants.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            {isVi ? "Quản lý từ các bảng Master Loại áo, Màu sắc & Kích thước riêng biệt." : "Manage variants from Master Product Types, Colors & Sizes."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMatrixModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200"
          >
            <Wand2 className="w-3.5 h-3.5" /> {isVi ? "Tạo Tự Động Biến Thể (Matrix)" : "Auto-Generate Matrix"}
          </button>
          <button
            type="button"
            onClick={handleAddManualRow}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Plus className="w-3.5 h-3.5" /> {isVi ? "Thêm Thủ Công" : "Add Row Manually"}
          </button>
        </div>
      </div>

      {/* Generator Matrix Modal */}
      {showMatrixModal && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600" /> {isVi ? "Trình Tạo Tổ Hợp Biến Thể Nhanh (Từ Database Master)" : "Quick Variant Matrix Generator (From Database Master)"}
            </h4>
            <button
              type="button"
              onClick={() => setShowMatrixModal(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold"
            >
              {isVi ? "Đóng [X]" : "Close [X]"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Types */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-600" /> {isVi ? `1. Bảng Loại Sản Phẩm (${availableTypes.length})` : `1. Product Types (${availableTypes.length})`}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTypes.map((t) => {
                  const active = selectedTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSelection(t, selectedTypes, setSelectedTypes)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Palette className="w-3 h-3 text-emerald-600" /> {isVi ? `2. Bảng Màu Sắc Master (${availableColors.length})` : `2. Master Colors (${availableColors.length})`}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((c) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleSelection(c.name, selectedColors, setSelectedColors)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Ruler className="w-3 h-3 text-purple-600" /> {isVi ? `3. Bảng Kích Thước Size (${availableSizes.length})` : `3. Size Dimensions (${availableSizes.length})`}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((s) => {
                  const active = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSelection(s, selectedSizes, setSelectedSizes)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        active
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-200/60">
            <span className="text-xs text-blue-900 font-semibold">
              {isVi ? "Dự kiến sinh ra: " : "Estimated combinations: "}
              <strong className="text-blue-700 font-bold">
                {(selectedTypes.length || 1) * (selectedColors.length || 1) * (selectedSizes.length || 1)}
              </strong>{" "}
              {isVi ? "biến thể" : "variants"}
            </span>
            <button
              type="button"
              onClick={generateMatrix}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> {isVi ? "Tạo Biến Thể Ngay" : "Generate Variants Now"}
            </button>
          </div>
        </div>
      )}

      {/* Variant Table */}
      {variants.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-500">{isVi ? "Chưa có biến thể nào được tạo." : "No variants created yet."}</p>
          <p className="text-[11px] text-slate-400">
            {isVi
              ? 'Bấm "Tạo Tự Động Biến Thể" để sinh nhanh các cỡ áo, màu sắc hoặc thêm thủ công.'
              : 'Click "Auto-Generate Matrix" to quickly generate sizes and colors or add rows manually.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-[140px]">{isVi ? "Mã SKU" : "SKU"}</th>
                <th className="p-2.5">{isVi ? "Loại Áo" : "Type"}</th>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">{isVi ? "Màu Sắc" : "Color"}</th>
                <th className="p-2.5 w-24">{isVi ? "Giá ($)" : "Price ($)"}</th>
                <th className="p-2.5 w-20">{isVi ? "Tồn Kho" : "Stock"}</th>
                <th className="p-2.5 min-w-[200px]">{isVi ? "Ảnh Biến Thể" : "Variant Image"}</th>
                <th className="p-2.5 text-center">{isVi ? "Xóa" : "Delete"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-2.5 text-[11px] font-medium text-slate-400">{idx + 1}</td>

                  <td className="p-2.5">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleRowChange(idx, "sku", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-600 transition"
                    />
                  </td>

                  <td className="p-2.5">
                    <select
                      value={v.productType}
                      onChange={(e) => handleRowChange(idx, "productType", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 transition"
                    >
                      {availableTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2.5">
                    <select
                      value={v.size}
                      onChange={(e) => handleRowChange(idx, "size", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 transition"
                    >
                      {availableSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2.5">
                    <select
                      value={v.color}
                      onChange={(e) => handleRowChange(idx, "color", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 transition"
                    >
                      {availableColors.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => handleRowChange(idx, "price", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 transition"
                    />
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleRowChange(idx, "stock", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-900 focus:bg-white focus:border-blue-600 transition"
                    />
                  </td>

                  <td className="p-2.5">
                    <ImageUploader
                      compact
                      value={v.imageUrl || ""}
                      onChange={(url) => handleRowChange(idx, "imageUrl", url)}
                      placeholder={isVi ? "Link/Tải ảnh" : "Image URL/Upload"}
                    />
                  </td>

                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title={isVi ? "Xóa biến thể" : "Delete variant"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
