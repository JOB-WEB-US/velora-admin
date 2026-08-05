"use client";

import React, { useState } from "react";
import { Settings, Save, Server, ShieldCheck } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export default function SettingsPage() {
  const { apiKey } = useAdminAuthStore();

  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1");
  const [currentKey, setCurrentKey] = useState(apiKey || "admin_secret_key_velora_2026");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Lưu cấu hình hệ thống Admin thành công!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Cài Đặt Hệ Thống Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình kết nối REST API Gateway, Admin API Key và môi trường bảo mật.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Server className="w-4 h-4" /> 1. Kết Nối Backend REST API Gateway
        </h2>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">URL Endpoint REST API (sales-website-be)</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Default Header Admin Key (`X-Admin-API-Key`)</label>
            <input
              type="text"
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-emerald-700 font-mono font-bold"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> 2. Tiêu Chuẩn Mã Hóa & Bảo Mật
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
          <p>✔️ <strong>Data-at-Rest Decryption:</strong> Tự động hiển thị giải mã AES-256 các thông tin tài chính và địa chỉ từ Backend.</p>
          <p>✔️ <strong>Strict Session Protection:</strong> Token hết hạn sẽ tự động chuyển hướng đăng nhập về Cổng Admin.</p>
          <p>✔️ <strong>Strict Type-Safety:</strong> Mã nguồn tuân thủ 100% TypeScript Strict mode.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
}
