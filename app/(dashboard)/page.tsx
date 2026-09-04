"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Flame,
  Award,
  Layers,
  Sparkles,
  Percent
} from "lucide-react";
import StatCard from "@/components/common/StatCard";
import RevenueChart from "@/components/features/dashboard/RevenueChart";
import OrdersStatusPieChart from "@/components/features/dashboard/OrdersStatusPieChart";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { useGetProducts } from "@/lib/hooks/useProducts";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";
import { useTranslation } from "@/store/useLanguageStore";

export default function DashboardOverviewPage() {
  const { t, language } = useTranslation();
  const isVi = language === "vi";
  const { data: orders = [] } = useGetOrders();
  const { data: products = [] } = useGetProducts();

  // Timeframe Mode State (Tuần / Tháng / Năm)
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

  // Filter orders by timeframe to compute real growth rates dynamically
  const now = new Date();

  const getFilteredOrders = (isCurrentPeriod: boolean) => {
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (timeframe === "week") {
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
        return isCurrentPeriod ? diffDays <= 7 : diffDays > 7 && diffDays <= 14;
      } else if (timeframe === "month") {
        const currentMonth = now.getMonth();
        const orderMonth = d.getMonth();
        return isCurrentPeriod
          ? orderMonth === currentMonth
          : orderMonth === (currentMonth - 1 + 12) % 12;
      } else {
        const currentYear = now.getFullYear();
        const orderYear = d.getFullYear();
        return isCurrentPeriod ? orderYear === currentYear : orderYear === currentYear - 1;
      }
    });
  };

  const currentOrders = getFilteredOrders(true);
  const prevOrders = getFilteredOrders(false);

  // Dynamic Revenue Growth Calculation
  const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const revenueGrowthRate = prevRevenue > 0
    ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
    : currentRevenue > 0 ? "+100.0" : "0.0";

  // Dynamic Orders Growth Calculation
  const ordersGrowthRate = prevOrders.length > 0
    ? (((currentOrders.length - prevOrders.length) / prevOrders.length) * 100).toFixed(1)
    : currentOrders.length > 0 ? "+100.0" : "0.0";

  // Dynamic Unique Customers Count
  const currentCustomersSet = new Set(currentOrders.map((o) => o.customerEmail).filter(Boolean));
  const prevCustomersSet = new Set(prevOrders.map((o) => o.customerEmail).filter(Boolean));
  const totalCustomersSet = new Set(orders.map((o) => o.customerEmail).filter(Boolean));

  const customerGrowthRate = prevCustomersSet.size > 0
    ? (((currentCustomersSet.size - prevCustomersSet.size) / prevCustomersSet.size) * 100).toFixed(1)
    : currentCustomersSet.size > 0 ? "+100.0" : "0.0";

  // Average Order Value (AOV)
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Delivery Fulfillment Success Rate
  const deliveredOrdersCount = orders.filter((o) => o.status === "DELIVERED").length;
  const fulfillmentRate = orders.length > 0 ? ((deliveredOrdersCount / orders.length) * 100).toFixed(0) : "0";

  // Products Metrics
  const totalVariantsCount = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "PLACED" || o.status === "PRINTING").length;

  const timeframeLabel =
    timeframe === "week"
      ? (isVi ? "So với tuần trước" : "vs last week")
      : timeframe === "month"
      ? (isVi ? "So với tháng trước" : "vs last month")
      : (isVi ? "So với năm trước" : "vs last year");

  // Compute Best Sellers Leaderboard
  const productSalesMap: Record<string, { id: string; title: string; image: string; type: string; totalSold: number; totalRevenue: number }> = {};

  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const pid = item.productId || item.product?.id || item.productType || "pod-item";
      const title = item.product?.title || item.productType || (isVi ? "Sản Phẩm POD" : "POD Product");
      const image = item.product?.frontImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80";
      const type = item.productType || "T-Shirt";
      const qty = item.quantity || 1;
      const rev = (item.price || 0) * qty;

      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { id: pid, title, image, type, totalSold: 0, totalRevenue: 0 };
      }
      productSalesMap[pid].totalSold += qty;
      productSalesMap[pid].totalRevenue += rev;
    });
  });

  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const maxRevenueSeller = bestSellers.length > 0 ? bestSellers[0].totalRevenue || 1 : 1;

  // Revenue by Product Type Breakdown
  const typeSalesMap: Record<string, { type: string; totalRevenue: number; totalSold: number }> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const type = item.productType || "T-Shirt";
      const qty = item.quantity || 1;
      const rev = (item.price || 0) * qty;
      if (!typeSalesMap[type]) {
        typeSalesMap[type] = { type, totalRevenue: 0, totalSold: 0 };
      }
      typeSalesMap[type].totalRevenue += rev;
      typeSalesMap[type].totalSold += qty;
    });
  });
  const typeSalesList = Object.values(typeSalesMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Find Low Stock Variants
  const lowStockItems: { productTitle: string; sku: string; size: string; color: string; stock: number }[] = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.stock < 10) {
        lowStockItems.push({
          productTitle: p.title,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
        });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
              Realtime Metrics
            </span>
            <span className="text-xs text-blue-200 font-bold">{isVi ? "• Cập nhật tự động" : "• Live Auto-sync"}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1.5">{isVi ? "Tổng Quan Doanh Thu & Xưởng In POD" : "Revenue & Fulfillment Overview"}</h1>
          <p className="text-sm text-blue-100 mt-1 font-medium">
            {isVi ? "Hệ thống quản lý sản phẩm, tồn kho và quy trình phân tích kinh doanh đa chiều." : "Real-time sales performance, POD fulfillment workflow and multi-dimensional analytics."}
          </p>
        </div>

        {/* Timeframe Switcher (Tuần / Tháng / Năm) */}
        <div className="flex items-center gap-1.5 bg-blue-800/60 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md self-start md:self-auto">
          <span className="text-xs font-bold text-blue-200 px-2">{isVi ? "Kỳ so sánh:" : "Period:"}</span>
          {(["week", "month", "year"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                timeframe === mode
                  ? "bg-white text-blue-700 shadow-md scale-102"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              {mode === "week" && (isVi ? "Tuần Này" : "This Week")}
              {mode === "month" && (isVi ? "Tháng Này" : "This Month")}
              {mode === "year" && (isVi ? "Năm Nay" : "This Year")}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid - 100% Calculated Dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t("dashboard.totalRevenue")}
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          change={`${Number(revenueGrowthRate) >= 0 ? "+" : ""}${revenueGrowthRate}%`}
          changeType={Number(revenueGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={timeframeLabel}
        />

        <StatCard
          title={t("dashboard.totalOrders")}
          value={orders.length}
          icon={ShoppingBag}
          change={`${Number(ordersGrowthRate) >= 0 ? "+" : ""}${ordersGrowthRate}%`}
          changeType={Number(ordersGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={isVi ? `${pendingOrdersCount} Đơn đang in/chờ • ${timeframeLabel}` : `${pendingOrdersCount} Pending POD • ${timeframeLabel}`}
        />

        <StatCard
          title={isVi ? "Giá Trị Đơn TB (AOV)" : "Average Order Value (AOV)"}
          value={formatCurrency(averageOrderValue)}
          icon={TrendingUp}
          subtitle={isVi ? `Tỷ lệ hoàn tất đơn: ${fulfillmentRate}% (${deliveredOrdersCount}/${orders.length})` : `Fulfillment rate: ${fulfillmentRate}% (${deliveredOrdersCount}/${orders.length})`}
        />

        <StatCard
          title={t("dashboard.totalCustomers")}
          value={totalCustomersSet.size}
          icon={Users}
          change={`${Number(customerGrowthRate) >= 0 ? "+" : ""}${customerGrowthRate}%`}
          changeType={Number(customerGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={isVi ? `${totalVariantsCount} SKU • ${timeframeLabel}` : `${totalVariantsCount} SKUs • ${timeframeLabel}`}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <OrdersStatusPieChart />
        </div>
      </div>

      {/* SECTION: Best-Sellers Leaderboard & Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Top 5 Best Selling Designs (2/3 width) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                {isVi ? "Top Sản Phẩm Bán Chạy Nhất (Best Sellers Leaderboard)" : "Top Best-Selling Products"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isVi ? "Xếp hạng các mẫu áo/sản phẩm tạo ra doanh thu cao nhất trên website." : "Highest grossing product styles across all categories."}
              </p>
            </div>
            <Link href="/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              {isVi ? "Xem kho áo" : "View catalog"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, idx) => {
                const percent = Math.min(100, Math.round((item.totalRevenue / maxRevenueSeller) * 100));
                return (
                  <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0 ? "bg-amber-400 text-black shadow-sm shadow-amber-400/50" :
                          idx === 1 ? "bg-slate-300 text-slate-800" :
                          idx === 2 ? "bg-amber-700 text-white" :
                          "bg-slate-200 text-slate-600"
                        }`}>
                          #{idx + 1}
                        </span>

                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                          <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{isVi ? `Dòng: ${item.type} • Đã bán: ${item.totalSold} cái` : `Type: ${item.type} • Sold: ${item.totalSold}`}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-emerald-600 font-mono block">
                          {formatCurrency(item.totalRevenue)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{percent}% {isVi ? "doanh số" : "sales"}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">{isVi ? "Chưa có dữ liệu sản phẩm bán ra." : "No sales data recorded yet."}</p>
            )}
          </div>
        </div>

        {/* Right: Revenue by Product Type Breakdown (1/3 width) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              {isVi ? "Doanh Thu Theo Dòng Áo" : "Revenue by Product Line"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{isVi ? "Tỷ trọng doanh thu theo từng danh mục áo." : "Sales breakdown across apparel categories."}</p>
          </div>

          <div className="space-y-3">
            {typeSalesList.length > 0 ? (
              typeSalesList.map((t, idx) => {
                const totalRev = totalRevenue || 1;
                const sharePercent = Math.round((t.totalRevenue / totalRev) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800">{t.type} ({t.totalSold} {isVi ? "cái" : "items"})</span>
                      <span className="text-emerald-600 font-mono">{formatCurrency(t.totalRevenue)} ({sharePercent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-blue-600" :
                          idx === 1 ? "bg-purple-600" :
                          idx === 2 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${sharePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">{isVi ? "Chưa có số liệu loại áo." : "No category data available."}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders Table (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              {t("dashboard.recentOrders")}
            </h2>
            <Link href="/orders" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1">
              {t("dashboard.viewAllOrders")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4">{isVi ? "Mã Đơn / Hóa Đơn" : "Order / Invoice #"}</th>
                    <th className="p-4">{t("dashboard.customerName")}</th>
                    <th className="p-4">{t("dashboard.orderTotal")}</th>
                    <th className="p-4">{isVi ? "Trạng Thái POD" : "Fulfillment Status"}</th>
                    <th className="p-4 text-right">{isVi ? "Ngày Đặt" : "Order Date"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {orders.slice(0, 5).map((order) => {
                    const badge = getOrderStatusBadge(order.status, language);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold">
                          <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                          <div className="text-xs text-slate-500 font-sans font-medium">{order.invoiceNumber}</div>
                        </td>
                        <td className="p-4 font-bold">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-slate-500 font-medium">{order.customerEmail}</div>
                        </td>
                        <td className="p-4 font-extrabold text-emerald-600 text-base">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-500 font-semibold text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & System Status (1/3 width) */}
        <div className="space-y-6">
          {/* Low Stock Warning Box */}
          <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />
                {isVi ? "Cảnh Báo Hàng Sắp Hết (Stock < 10)" : "Low Stock Alert (Stock < 10)"}
              </h3>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
                {lowStockItems.length} SKUs
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{item.productTitle}</p>
                      <p className="text-xs text-slate-500 font-mono font-medium">{item.sku} ({item.size} - {item.color})</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold">
                      {isVi ? `Còn ${item.stock} cái` : `${item.stock} left`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4 font-medium">{isVi ? "Tất cả tồn kho mặt hàng đều ổn định!" : "All inventory levels are healthy!"}</p>
              )}
            </div>

            <Link
              href="/products"
              className="block w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center text-xs font-bold text-slate-800 transition"
            >
              {isVi ? "Quản Lý Tồn Kho Chi Tiết" : "Manage Inventory Details"}
            </Link>
          </div>

          {/* Quick POD Workflow Guide Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              {isVi ? "Quy Trình Đơn Hàng POD" : "POD Fulfillment Workflow"}
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span><strong>PLACED:</strong> {isVi ? "Khách hàng mới đặt đơn." : "Customer placed order."}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span><strong>PRINTING:</strong> {isVi ? "Xưởng in ấn thiết kế áo." : "Artwork printing on demand."}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <span><strong>SHIPPED:</strong> {isVi ? "Nhập Tracking & giao cho ĐVVC." : "Carrier in transit with tracking."}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>DELIVERED:</strong> {isVi ? "Hoàn thành đơn hàng." : "Package successfully delivered."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
