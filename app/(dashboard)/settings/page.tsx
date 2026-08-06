"use client";

import React, { useState } from "react";
import { Settings, Save, Server, ShieldCheck, Eye, EyeOff, Lock, AlertTriangle, Copy, Check } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export default function SettingsPage() {
  const { apiKey, setApiKey } = useAdminAuthStore();

  const [apiUrl, setApiUrl] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("custom_api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
      : "http://localhost:5000/api/v1"
  );
  const [currentKey, setCurrentKey] = useState(apiKey || process.env.NEXT_PUBLIC_ADMIN_API_KEY || "velora_admin_secret_api_key_2026");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKey) {
      alert("Vui lòng nhập Admin API Key!");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("custom_api_url", apiUrl);
    }
    setApiKey(currentKey);

    alert("Đã lưu và bảo mật cấu hình hệ thống thành công!");
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Cài Đặt & Bảo Mật Hệ Thống Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình kết nối REST API Gateway và bảo mật ẩn Admin API Key.</p>
        </div>
      </div>

      {/* Security Protection Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-amber-950">Cảnh Báo Bảo Mật Admin API Key:</p>
          <p className="text-amber-800 leading-relaxed font-medium">
            Admin API Key (`X-Admin-API-Key`) là chìa khóa bí mật dùng để xác thực mọi yêu cầu từ giao diện Admin tới máy chủ Backend Gateway.
            Để ngăn chặn rò rỉ khi quay video hoặc chia sẻ màn hình, chìa khóa này được <strong>ẨN MẶC ĐỊNH (`••••••••••••`)</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Server className="w-4 h-4" /> 1. Kết Nối Backend REST API Gateway
        </h2>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">URL Endpoint REST API (sales-website-be)</label>
            <input
              type="text"
              required
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Admin API Key (`X-Admin-API-Key`) *</span>
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Đã bật chế độ bảo vệ ẩn Key
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                required
                value={showKey ? currentKey : "••••••••••••••••••••••••"}
                onChange={(e) => {
                  setCurrentKey(e.target.value);
                  if (!showKey) setShowKey(true);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-24 py-2.5 text-emerald-700 font-mono font-extrabold text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition text-[11px] font-bold flex items-center gap-1 shadow-sm"
                  title={showKey ? "Ẩn mã bí mật" : "Hiện mã bí mật"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                  {showKey ? "Ẩn Key" : "Hiện Key"}
                </button>

                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
                  title="Sao chép Key"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 pt-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> 2. Tiêu Chuẩn Mã Hóa & Bảo Mật Hệ Thống
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 font-medium">
          <p>✔️ <strong>API Key Concealment:</strong> Khóa API bí mật được ẩn hoàn toàn dạng mật khẩu (`••••••••••••`), chống chụp màn hình / dòm ngó.</p>
          <p>✔️ <strong>Data-at-Rest Decryption:</strong> Giải mã AES-256-GCM các thông tin nhạy cảm (Số điện thoại, Địa chỉ, Số tiền) trên giao diện.</p>
          <p>✔️ <strong>Strict Session Protection:</strong> Tự động chặn các yêu cầu không hợp lệ và bảo vệ phiên làm việc người dùng.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu & Áp Dụng Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
}
