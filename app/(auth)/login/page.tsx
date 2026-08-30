"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { apiClient } from "@/lib/api/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, isHydrated } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect to dashboard or orders page if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/");
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Gọi Backend API xác thực email & mật khẩu đã mã hóa Bcrypt
      const { data } = await apiClient.post("/auth/login", { email, password });

      if (data.token && data.user) {
        const userRole = data.user.role;
        if (!["ADMIN", "SUPER_ADMIN", "SHIPPER"].includes(userRole)) {
          setErrorMsg("Tài khoản của bạn không có quyền truy cập vào cổng quản trị.");
          return;
        }

        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: userRole,
            avatar: data.user.avatar,
          },
          data.token
        );

        if (userRole === "SHIPPER") {
          router.push("/orders");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg("Đăng nhập thất bại: Không nhận được token xác thực từ máy chủ.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Email hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Soft background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-500/25">
            V
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Velora Portal</h1>
          <p className="text-xs text-slate-500 font-medium">Cổng Quản Trị Admin & Đơn Vị Vận Chuyển</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" /> Email Tài Khoản *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email quản trị..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" /> Mật Khẩu *
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập Quản Trị"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 font-semibold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Xác thực bảo mật phân quyền Role-Based (RBAC)
        </div>
      </div>
    </div>
  );
}
