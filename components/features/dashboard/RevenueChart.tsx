"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart3, LineChart, Sparkles } from "lucide-react";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";

type TimeframeMode = "week" | "month" | "year";
type ChartType = "area" | "bar";

export default function RevenueChart() {
  const { data: orders = [] } = useGetOrders();
  const [mode, setMode] = useState<TimeframeMode>("week");
  const [chartType, setChartType] = useState<ChartType>("area");

  // Compute Weekly Data (Thứ 2 ➔ Chủ Nhật) dynamically from real orders
  const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  const weeklyMap: Record<string, { revenue: number; orders: number }> = {};
  weekDays.forEach((day) => (weeklyMap[day] = { revenue: 0, orders: 0 }));

  // Compute Monthly Data (Tháng 1 ➔ Tháng 12) dynamically from real orders
  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
  months.forEach((m) => (monthlyMap[m] = { revenue: 0, orders: 0 }));

  // Compute Yearly Data dynamically
  const yearlyMap: Record<string, { revenue: number; orders: number }> = {};

  orders.forEach((o) => {
    const d = new Date(o.createdAt);

    // Day of week (0 is Sun, 1 is Mon...)
    const jsDay = d.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Map 1=Mon(0)... 0=Sun(6)
    const dayLabel = weekDays[dayIndex];

    if (dayLabel && weeklyMap[dayLabel]) {
      weeklyMap[dayLabel].revenue += o.totalPrice || 0;
      weeklyMap[dayLabel].orders += 1;
    }

    // Month (0 ➔ 11)
    const monthLabel = `Tháng ${d.getMonth() + 1}`;
    if (monthlyMap[monthLabel]) {
      monthlyMap[monthLabel].revenue += o.totalPrice || 0;
      monthlyMap[monthLabel].orders += 1;
    }

    // Year
    const yearLabel = `${d.getFullYear()}`;
    if (!yearlyMap[yearLabel]) {
      yearlyMap[yearLabel] = { revenue: 0, orders: 0 };
    }
    yearlyMap[yearLabel].revenue += o.totalPrice || 0;
    yearlyMap[yearLabel].orders += 1;
  });

  const weeklyData = weekDays.map((label) => ({
    label,
    revenue: Number(weeklyMap[label].revenue.toFixed(2)),
    orders: weeklyMap[label].orders,
  }));

  const monthlyData = months.map((label) => ({
    label,
    revenue: Number(monthlyMap[label].revenue.toFixed(2)),
    orders: monthlyMap[label].orders,
  }));

  const yearlyData = Object.keys(yearlyMap).map((year) => ({
    label: year,
    revenue: Number(yearlyMap[year].revenue.toFixed(2)),
    orders: yearlyMap[year].orders,
  }));

  let chartData = weeklyData;
  if (mode === "month") chartData = monthlyData;
  if (mode === "year") chartData = yearlyData.length > 0 ? yearlyData : [{ label: "2026", revenue: 0, orders: 0 }];

  const totalRevenueInRange = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrdersInRange = chartData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrdersInRange > 0 ? totalRevenueInRange / totalOrdersInRange : 0;

  // Find peak period in current data
  const peakItem = [...chartData].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Biểu Đồ Doanh Thu & Đơn Hàng Realtime
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Tự động tổng hợp số liệu thực tế từ toàn bộ đơn hàng trong Database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chart Type Toggle (Area vs Bar) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg transition ${
                chartType === "area" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Dạng đường vùng gradient"
            >
              <LineChart size={15} />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg transition ${
                chartType === "bar" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Dạng cột so sánh"
            >
              <BarChart3 size={15} />
            </button>
          </div>

          {/* Timeframe Mode Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mode === "week"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Theo Tuần
            </button>
            <button
              onClick={() => setMode("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mode === "month"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setMode("year")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mode === "year"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Theo Năm
            </button>
          </div>
        </div>
      </div>

      {/* Range Stats Summary Row & Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <span className="text-slate-400 font-bold block">Tổng Doanh Thu:</span>
          <span className="text-lg font-extrabold text-emerald-600 font-mono">{formatCurrency(totalRevenueInRange)}</span>
        </div>

        <div className="space-y-0.5 border-l border-slate-100 pl-4">
          <span className="text-slate-400 font-bold block">Tổng Đơn Hàng:</span>
          <span className="text-lg font-extrabold text-blue-600 font-mono">{totalOrdersInRange} đơn</span>
        </div>

        <div className="space-y-0.5 border-l border-slate-100 pl-4">
          <span className="text-slate-400 font-bold block">Giá Trị Đơn TB (AOV):</span>
          <span className="text-lg font-extrabold text-purple-600 font-mono">{formatCurrency(avgOrderValue)}</span>
        </div>

        <div className="space-y-0.5 border-l border-slate-100 pl-4">
          <span className="text-slate-400 font-bold block flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" /> Cao Điểm Nhất:
          </span>
          <span className="text-sm font-extrabold text-slate-800 truncate block">
            {peakItem && peakItem.revenue > 0 ? `${peakItem.label} (${formatCurrency(peakItem.revenue)})` : "Chưa có"}
          </span>
        </div>
      </div>

      {/* Recharts Area / Bar Chart */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `$${val / 1000}k` : `$${val}`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 shadow-2xl text-xs space-y-1.5">
                        <p className="font-extrabold text-white text-sm border-b border-slate-700 pb-1">{label}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-blue-400 font-medium">💰 Doanh thu:</span>
                          <span className="font-extrabold font-mono text-emerald-400">{formatCurrency(payload[0].value as number)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-emerald-400 font-medium">📦 Đơn hàng:</span>
                          <span className="font-extrabold font-mono text-white">{payload[1]?.value} đơn</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu ($)"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Số đơn"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOrders)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `$${val / 1000}k` : `$${val}`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 shadow-2xl text-xs space-y-1.5">
                        <p className="font-extrabold text-white text-sm border-b border-slate-700 pb-1">{label}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-blue-400 font-medium">💰 Doanh thu:</span>
                          <span className="font-extrabold font-mono text-emerald-400">{formatCurrency(payload[0]?.value as number)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-emerald-400 font-medium">📦 Đơn hàng:</span>
                          <span className="font-extrabold font-mono text-white">{payload[1]?.value} đơn</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" name="Doanh thu ($)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="orders" name="Số đơn" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Visual Chart Legend */}
      <div className="flex items-center justify-center gap-6 pt-1 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-xs" />
          <span>Doanh Thu ($ USD)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
          <span>Số Lượng Đơn Hàng</span>
        </div>
      </div>
    </div>
  );
}
