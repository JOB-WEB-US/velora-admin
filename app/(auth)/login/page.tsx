"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { apiClient } from "@/lib/api/client";
import { useTranslation } from "@/store/useLanguageStore";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setAuth, isAuthenticated, isHydrated, checkAuthSession } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check existing session and redirect
  useEffect(() => {
    checkAuthSession().then((isAuthed) => {
      if (isAuthed) {
        router.push("/");
      }
    });
  }, [checkAuthSession, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data } = await apiClient.post("/auth/login", { email, password });

      if (data.token && data.user) {
        const userRole = data.user.role;
        if (!["ADMIN", "SUPER_ADMIN", "SHIPPER"].includes(userRole)) {
          setErrorMsg(t("login.roleError"));
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
        setErrorMsg(t("login.tokenError"));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t("login.invalidCreds"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Language Switcher in top right */}
        <div className="absolute top-5 right-5 z-20">
          <LanguageSwitcher />
        </div>

        {/* Soft background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-500/25">
            V
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("login.title")}</h1>
          <p className="text-xs text-slate-500 font-medium">{t("login.subtitle")}</p>
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
              <Mail className="w-4 h-4 text-blue-600" /> {t("login.emailLabel")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" /> {t("login.passwordLabel")}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? t("login.hidePassword") : t("login.showPassword")}
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          >
            {loading ? t("login.loggingIn") : t("login.loginBtn")} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 font-semibold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t("login.securityNote")}
        </div>
      </div>
    </div>
  );
}
