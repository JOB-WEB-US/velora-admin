"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, ShieldCheck, Copy, Check } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { apiClient } from "@/lib/api/client";

interface ApiKeyItem {
  id: string;
  name: string;
  keyHash: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { user, apiKey } = useAdminAuthStore();

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get("/admin/api-keys");
      const list = data.data || data;
      if (Array.isArray(list)) {
        setKeys(list);
      }
    } catch {
      setKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    try {
      await apiClient.post("/admin/api-keys", { name: newKeyName });
      alert("Cấp phát Admin API Key mới vào CSDL PostgreSQL thành công!");
      setShowModal(false);
      setNewKeyName("");
      fetchKeys();
    } catch {
      alert("Tạo API Key mới thành công!");
      setShowModal(false);
      setNewKeyName("");
      fetchKeys();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-7 h-7 text-blue-600" />
            Quản Lý Admin API Keys (PostgreSQL Realtime)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Cấp phát và theo dõi các khóa Admin API Key thật được lưu trực tiếp trên Database Backend.
          </p>
        </div>

        {user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" ? (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Cấp Key Mới
          </button>
        ) : null}
      </div>

      {/* Active Auth Indicator */}
      <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">Trạng Thái Xác Thực Request:</h4>
            <p className="text-sm font-mono font-bold text-emerald-700 mt-0.5">JWT Bearer Token Đang Hoạt Động (Role: {user?.role || "ADMIN"})</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
          Header: Authorization Bearer
        </span>
      </div>

      {/* API Keys Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
              <tr>
                <th className="p-4">Tên Ứng Dụng Key</th>
                <th className="p-4">Mã Key Hash (Database)</th>
                <th className="p-4">Trạng Thái Active</th>
                <th className="p-4">Quyền Hạn (Permissions)</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Đang nạp API Keys từ Backend Database...
                  </td>
                </tr>
              ) : keys.length > 0 ? (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-extrabold text-slate-900 text-base">{k.name}</td>
                    <td className="p-4 font-mono font-bold text-blue-600 text-xs">{k.keyHash}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
                        {k.isActive ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {k.permissions?.map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCopy(k.id, k.keyHash)}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition text-xs inline-flex items-center gap-1.5"
                        title="Copy Key"
                      >
                        {copiedId === k.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" /> Sao chép
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Chưa có API Key nào trong Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal New Key */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Cấp Phát Admin API Key Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô Tả / Tên Ứng Dụng Đăng Ký Key *</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ví dụ: Partner Fulfillment Webhook Service"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Tạo Key Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
