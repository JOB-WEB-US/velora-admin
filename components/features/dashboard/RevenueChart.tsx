"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";

type TimeframeMode = "week" | "month" | "year";

export default function RevenueChart() {
  const { data: orders = [] } = useGetOrders();
  const [mode, setMode] = useState<TimeframeMode>("week");

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

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Biểu Đồ Doanh Thu & Đơn Hàng Realtime (Từ API)
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Tự động tổng hợp từ dữ liệu đơn hàng thật trong Database PostgreSQL.
          </p>
        </div>

        {/* Timeframe Mode Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setMode("week")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition ${
              mode === "week"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Theo Tuần
          </button>
          <button
            onClick={() => setMode("month")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition ${
              mode === "month"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Theo Tháng
          </button>
          <button
            onClick={() => setMode("year")}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition ${
              mode === "year"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Theo Năm
          </button>
        </div>
      </div>

      {/* Range Stats Summary Row */}
      <div className="flex items-center gap-8 text-sm border-b border-slate-100 pb-3">
        <div>
          <span className="text-slate-500 block font-medium">Tổng Doanh Thu Khoảng Lọc:</span>
          <span className="text-xl font-extrabold text-emerald-600">{formatCurrency(totalRevenueInRange)}</span>
        </div>
        <div className="border-l border-slate-200 pl-8">
          <span className="text-slate-500 block font-medium">Tổng Đơn Hàng:</span>
          <span className="text-xl font-extrabold text-blue-600">{totalOrdersInRange} đơn</span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" stroke="#475569" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#475569"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (val >= 1000 ? `$${val / 1000}k` : `$${val}`)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-900 text-sm">{label}</p>
                      <p className="text-blue-600 font-bold">
                        Doanh thu: {formatCurrency(payload[0].value as number)}
                      </p>
                      <p className="text-emerald-600 font-bold">
                        Đơn hàng: {payload[1]?.value} đơn
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
