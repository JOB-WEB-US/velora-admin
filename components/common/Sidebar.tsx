"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  SlidersHorizontal,
  ShoppingBag,
  Users,
  Key,
  Settings,
  LogOut,
  ChevronLeft,
  ShieldAlert,
  Truck,
  Ticket,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Tổng quan Dashboard", href: "/", icon: LayoutDashboard, adminOnly: true },
  { name: "Quản lý Hàng hóa", href: "/products", icon: Package, adminOnly: true },
  { name: "Danh mục & Menu Trend", href: "/categories", icon: FolderTree, adminOnly: true },
  { name: "Thuộc tính & Biến thể", href: "/attributes", icon: SlidersHorizontal, adminOnly: true },
  { name: "Mã Giảm Giá (Coupons)", href: "/coupons", icon: Ticket, adminOnly: true },
  { name: "Ưu Đãi Bundle & Save", href: "/bundles", icon: Layers, adminOnly: true },
  { name: "Quản Lý Banners", href: "/banners", icon: ImageIcon, adminOnly: true },
  { name: "Quản lý Đơn hàng", href: "/orders", icon: ShoppingBag, shipperAllowed: true },
  { name: "Khách hàng", href: "/customers", icon: Users, adminOnly: true },
  { name: "Admin API Keys", href: "/api-keys", icon: Key, superAdminOnly: true },
  { name: "Cài đặt Hệ thống", href: "/settings", icon: Settings, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAdminAuthStore();

  const isShipper = user?.role === "SHIPPER";

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 288 : 80 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between select-none"
    >
      {/* Sleek Border Toggle Button (Linear / Vercel Style) */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-md flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
        title={isSidebarOpen ? "Thu gọn Sidebar" : "Mở rộng Sidebar"}
      >
        <motion.div
          animate={{ rotate: isSidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Top Section: Brand Header & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center">
          <Link href={isShipper ? "/orders" : "/"} className="flex items-center gap-3.5 overflow-hidden w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20 shrink-0">
              V
            </div>

            <AnimatePresence initial={false}>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className="font-extrabold text-slate-900 text-lg tracking-wide uppercase leading-none">
                    Velora
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                    {isShipper ? "Shipper Fulfillment" : "POD Admin Portal"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            // Shipper can ONLY see /orders
            if (isShipper && !item.shipperAllowed) return null;
            if (item.superAdminOnly && user?.role !== "SUPER_ADMIN") return null;

            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl transition-colors group relative",
                  isSidebarOpen ? "px-3.5 py-3 gap-3.5 text-base" : "p-3 justify-center text-base",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                  )}
                />

                <AnimatePresence initial={false}>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="truncate whitespace-nowrap font-bold"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Collapsed State Hover Tooltip */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 font-bold">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-3 border-t border-slate-100">
        <AnimatePresence initial={false}>
          {isSidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div className="truncate">
                  <p className="text-sm font-extrabold text-slate-900 truncate">{user?.name || "Shipper User"}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    {isShipper ? (
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {user?.role || "SHIPPER"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
