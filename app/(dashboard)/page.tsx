"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, ArrowRight, Truck, CheckCircle2, Clock } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import RevenueChart from "@/components/features/dashboard/RevenueChart";
import OrdersStatusPieChart from "@/components/features/dashboard/OrdersStatusPieChart";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { useGetProducts } from "@/lib/hooks/useProducts";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export default function DashboardOverviewPage() {
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

  // Products Metrics
  const totalVariantsCount = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "PLACED" || o.status === "PRINTING").length;

  const timeframeLabel =
    timeframe === "week"
      ? "So với tuần trước"
      : timeframe === "month"
      ? "So với tháng trước"
      : "So với năm trước";

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
      <div className="p-7 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tổng Quan Bán Hàng & In Ấn POD</h1>
          <p className="text-sm text-blue-100 mt-1 font-medium">
            Hệ thống quản lý sản phẩm, tồn kho kho hàng và quy trình trạng thái đơn hàng POD realtime.
          </p>
        </div>

        {/* Timeframe Switcher (Tuần / Tháng / Năm) */}
        <div className="flex items-center gap-2 bg-blue-700/60 p-1.5 rounded-xl border border-white/20">
          <span className="text-xs font-bold text-blue-100 px-2">Thời gian:</span>
          {(["week", "month", "year"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                timeframe === mode
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-blue-600/50"
              }`}
            >
              {mode === "week" && "Tuần"}
              {mode === "month" && "Tháng"}
              {mode === "year" && "Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid - 100% Calculated Dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          change={`${Number(revenueGrowthRate) >= 0 ? "+" : ""}${revenueGrowthRate}%`}
          changeType={Number(revenueGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={timeframeLabel}
        />

        <StatCard
          title="Tổng Số Đơn Hàng"
          value={orders.length}
          icon={ShoppingBag}
          change={`${Number(ordersGrowthRate) >= 0 ? "+" : ""}${ordersGrowthRate}%`}
          changeType={Number(ordersGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={`${pendingOrdersCount} Đơn đang in/chờ • ${timeframeLabel}`}
        />

        <StatCard
          title="Sản Phẩm Đang Bán"
          value={products.length}
          icon={Package}
          subtitle={`${totalVariantsCount} biến thể SKU kho`}
        />

        <StatCard
          title="Khách Hàng"
          value={totalCustomersSet.size}
          icon={Users}
          change={`${Number(customerGrowthRate) >= 0 ? "+" : ""}${customerGrowthRate}%`}
          changeType={Number(customerGrowthRate) >= 0 ? "positive" : "negative"}
          subtitle={`${totalCustomersSet.size} khách duy nhất • ${timeframeLabel}`}
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

      {/* Main Grid: Recent Orders & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders Table (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              Đơn Hàng Mới Nhất
            </h2>
            <Link href="/orders" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1">
              Xem tất cả đơn <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-4">Mã Đơn / Hóa Đơn</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Tổng Tiền</th>
                    <th className="p-4">Trạng Thái POD</th>
                    <th className="p-4 text-right">Ngày Đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {orders.slice(0, 5).map((order) => {
                    const badge = getOrderStatusBadge(order.status);
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
                Cảnh Báo Hàng Sắp Hết (Stock &lt; 10)
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
                      Còn {item.stock} cái
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4 font-medium">Tất cả tồn kho mặt hàng đều ổn định!</p>
              )}
            </div>

            <Link
              href="/products"
              className="block w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center text-xs font-bold text-slate-800 transition"
            >
              Quản Lý Tồn Kho Chi Tiết
            </Link>
          </div>

          {/* Quick POD Workflow Guide Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Quy Trình Đơn Hàng POD
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span><strong>PLACED:</strong> Khách hàng mới đặt đơn.</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span><strong>PRINTING:</strong> Xưởng in ấn thiết kế áo.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <span><strong>SHIPPED:</strong> Nhập Tracking & giao cho ĐVVC.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>DELIVERED:</strong> Hoàn thành đơn hàng.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
