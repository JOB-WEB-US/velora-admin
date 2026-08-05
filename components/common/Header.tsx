"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, KeyRound, Package, ShoppingBag, X } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useGetProducts } from "@/lib/hooks/useProducts";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { cn, formatCurrency } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const { isSidebarOpen } = useUIStore();
  const { data: products = [] } = useGetProducts();
  const { data: orders = [] } = useGetOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products and orders based on search query
  const query = searchTerm.trim().toLowerCase();

  const matchedProducts = query
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          p.variants?.some((v) => v.sku.toLowerCase().includes(query))
      )
    : [];

  const matchedOrders = query
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.invoiceNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query)
      )
    : [];

  const hasResults = matchedProducts.length > 0 || matchedOrders.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      if (matchedOrders.length > 0) {
        router.push(`/orders/${matchedOrders[0].id}`);
        setIsOpen(false);
      } else if (matchedProducts.length > 0) {
        router.push(`/products/${matchedProducts[0].id}`);
        setIsOpen(false);
      } else {
        router.push(`/products?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-admin-border transition-all duration-300 flex items-center justify-between px-8 shadow-sm",
        isSidebarOpen ? "left-72" : "left-20"
      )}
    >
      {/* Global Interactive Search Bar */}
      <div ref={searchRef} className="relative w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm đơn hàng, mã SKU, tên sản phẩm..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
        />

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {isOpen && query && (
          <div className="absolute left-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {/* Matched Orders */}
            {matchedOrders.length > 0 && (
              <div className="p-3 space-y-2">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 px-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Đơn Hàng ({matchedOrders.length})
                </span>
                <div className="space-y-1">
                  {matchedOrders.slice(0, 3).map((o) => (
                    <Link
                      key={o.id}
                      href={`/orders/${o.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 font-mono">{o.orderNumber}</p>
                        <p className="text-slate-500 font-medium">{o.customerName} ({o.customerEmail})</p>
                      </div>
                      <span className="font-bold text-emerald-600">{formatCurrency(o.totalPrice)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Products */}
            {matchedProducts.length > 0 && (
              <div className="p-3 space-y-2">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 px-2">
                  <Package className="w-3.5 h-3.5" /> Sản Phẩm & SKU ({matchedProducts.length})
                </span>
                <div className="space-y-1">
                  {matchedProducts.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{p.slug}</p>
                      </div>
                      <span className="font-bold text-emerald-600">{formatCurrency(p.basePrice)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!hasResults && (
              <div className="p-6 text-center text-xs text-slate-500 font-semibold">
                Không tìm thấy kết quả nào cho &quot;<span className="text-slate-900 font-bold">{searchTerm}</span>&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Admin API Key Indicator Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold">
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>API Key Active</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-sans font-extrabold">AES-256</span>
        </div>

        {/* Status Guard Indicator */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-sm text-slate-600">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span className="hidden md:inline font-bold text-slate-900">BE Connected</span>
        </div>
      </div>
    </header>
  );
}
