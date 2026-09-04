"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, CheckCircle2, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguageStore } from "@/store/useLanguageStore";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  compact?: boolean;
  placeholder?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  required = false,
  compact = false,
  placeholder = "https://images.unsplash.com/...",
}: ImageUploaderProps) {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processAndUploadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(isVi ? "Vui lòng chọn định dạng file hình ảnh (PNG, JPG, WEBP...)" : "Please select an image file (PNG, JPG, WEBP...)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        try {
          const res = await apiClient.post("/admin/upload", { image: reader.result });
          if (res.data?.data?.url) {
            onChange(res.data.data.url);
          } else {
            onChange(reader.result);
          }
        } catch {
          // Fallback if network or server error
          onChange(reader.result);
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isUploading ? (
          <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : value ? (
          <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Variant" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
              title={isVi ? "Xóa ảnh" : "Remove image"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition flex-shrink-0"
            title={isVi ? "Thêm ảnh từ máy" : "Upload from device"}
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={value.startsWith("data:") ? (isVi ? "[Ảnh đã tải từ máy]" : "[Device Uploaded Image]") : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                mode === "file" ? "bg-white text-blue-600 shadow-sm font-semibold" : "hover:text-slate-900"
              }`}
            >
              <UploadCloud className="w-3 h-3" /> {isVi ? "Tải từ máy" : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                mode === "url" ? "bg-white text-blue-600 shadow-sm font-semibold" : "hover:text-slate-900"
              }`}
            >
              <LinkIcon className="w-3 h-3" /> {isVi ? "Dán URL" : "Image URL"}
            </button>
          </div>
        </div>
      )}

      {isUploading ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-blue-900">{isVi ? "Đang tải ảnh lên máy chủ Cloudinary CDN..." : "Uploading image to Cloudinary CDN..."}</p>
        </div>
      ) : value ? (
        <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" /> {isVi ? "Đã tải ảnh lên thành công" : "Image uploaded successfully"}
            </div>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              {value.includes("cloudinary") ? `[Cloudinary CDN] ${value}` : value.startsWith("data:") ? `Data URI (${Math.round(value.length / 1024)} KB)` : value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs font-semibold flex items-center gap-1"
          >
            <X className="w-4 h-4" /> {isVi ? "Đổi ảnh" : "Change"}
          </button>
        </div>
      ) : mode === "file" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? "border-blue-500 bg-blue-50/50"
              : "border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isVi ? (
                <>Kéo thả hoặc <span className="text-blue-600 underline">bấm để chọn ảnh từ máy tính</span></>
              ) : (
                <>Drag & drop or <span className="text-blue-600 underline">browse files from device</span></>
              )}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isVi ? "Tự động nén & lưu lên Cloudinary CDN (PNG, JPG, WEBP)" : "Auto-compressed & stored on Cloudinary CDN (PNG, JPG, WEBP)"}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>
      )}
    </div>
  );
}
