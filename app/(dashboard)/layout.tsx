"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { useUIStore } from "@/store/useUIStore";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  const { language } = useLanguageStore();
  const { user, isAuthenticated, isHydrated, checkAuthSession } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuthSession().then((isAuthed) => {
      if (!isAuthed) {
        router.push("/login");
      }
    });
  }, [checkAuthSession, router]);

  useEffect(() => {
    if (isMounted && isHydrated) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // SHIPPER Role Route Guard: Restricted to /orders and /orders/[id] ONLY
      if (user?.role === "SHIPPER" && !pathname.startsWith("/orders")) {
        router.push("/orders");
      }
    }
  }, [isMounted, isHydrated, isAuthenticated, user, pathname, router]);

  // Show loading spinner while reading session from localStorage
  if (!isMounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-blue-500/30">
            V
          </div>
          <p className="text-sm font-extrabold text-slate-700">
            {language === "vi" ? "Đang khôi phục phiên làm việc..." : "Restoring session..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Prevent flicker for SHIPPER on restricted pages before redirect
  if (user?.role === "SHIPPER" && !pathname.startsWith("/orders")) {
    return null;
  }

  const isShipper = user?.role === "SHIPPER";

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <Sidebar />
      {!isShipper && <Header />}
      <main
        className={cn(
          "pb-12 transition-all duration-300 min-h-screen",
          isShipper ? "pt-8" : "pt-20",
          isSidebarOpen ? "pl-80 pr-8" : "pl-28 pr-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
