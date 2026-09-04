"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { useTranslation } from "@/store/useLanguageStore";

const STATUS_COLORS = {
  PLACED: "#2563eb",   // Blue
  PRINTING: "#d97706", // Amber
  SHIPPED: "#7c3aed",  // Purple
  DELIVERED: "#059669",// Emerald
  CANCELLED: "#dc2626",// Rose
};

export default function OrdersStatusPieChart() {
  const { language } = useTranslation();
  const { data: orders = [] } = useGetOrders();

  const STATUS_LABELS = {
    PLACED: language === "vi" ? "PLACED (Mới đặt)" : "PLACED (Order Placed)",
    PRINTING: language === "vi" ? "PRINTING (Đang in)" : "PRINTING (In Production)",
    SHIPPED: language === "vi" ? "SHIPPED (Đã gửi)" : "SHIPPED (In Transit)",
    DELIVERED: language === "vi" ? "DELIVERED (Đã giao)" : "DELIVERED (Completed)",
    CANCELLED: language === "vi" ? "CANCELLED (Đã hủy)" : "CANCELLED (Cancelled)",
  };

  // Compute status distribution dynamically from real orders
  const statusCounts = {
    PLACED: 0,
    PRINTING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status] += 1;
    }
  });

  const pieData = (Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map((statusKey) => ({
    name: STATUS_LABELS[statusKey],
    value: statusCounts[statusKey],
    color: STATUS_COLORS[statusKey],
  }));

  const totalOrders = orders.length;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-purple-600" />
          {language === "vi" ? "Tỉ Lệ Trạng Thái Đơn Hàng POD" : "Order Fulfillment Distribution"}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">
          {language === "vi"
            ? `Phân bổ ${totalOrders} đơn hàng thật từ Database qua 5 giai đoạn.`
            : `Breakdown of ${totalOrders} real database orders across 5 fulfillment stages.`}
        </p>
      </div>

      <div className="h-72 w-full">
        {totalOrders > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-xl font-bold text-slate-900">
                        <span>{payload[0].name}: </span>
                        <span className="font-extrabold text-blue-600">{payload[0].value} {language === "vi" ? "đơn" : "orders"}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value) => <span className="text-xs text-slate-700 font-bold">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
            {language === "vi" ? "Chưa có đơn hàng nào trong csdl." : "No orders recorded in database yet."}
          </div>
        )}
      </div>
    </div>
  );
}
