"use client";

import React from "react";
import { Users, Mail, ShoppingBag } from "lucide-react";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const { data: orders = [], isLoading } = useGetOrders();

  // Group real orders by customer email to derive real customer metrics
  const customerMap: Record<
    string,
    { id: string; name: string; email: string; totalOrders: number; totalSpent: number; firstOrderDate: string }
  > = {};

  orders.forEach((o) => {
    const key = o.customerEmail || o.customerName;
    if (!key) return;

    if (!customerMap[key]) {
      customerMap[key] = {
        id: `cust-${key}`,
        name: o.customerName || "Khách Vãng Lai",
        email: o.customerEmail || "N/A",
        totalOrders: 0,
        totalSpent: 0,
        firstOrderDate: o.createdAt,
      };
    }

    customerMap[key].totalOrders += 1;
    customerMap[key].totalSpent += o.totalPrice || 0;
  });

  const customersList = Object.values(customerMap);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Quản Lý Khách Hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Danh sách khách hàng và tổng quan tích lũy giao dịch từ Database Cloud.
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
              <tr>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Email Liên Hệ</th>
                <th className="p-4">Tổng Số Đơn Hàng</th>
                <th className="p-4">Tổng Chi Tiêu Tích Lũy</th>
                <th className="p-4">Ngày Mua Đơn Đầu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : customersList.length > 0 ? (
                customersList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-base">{c.name}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium flex items-center gap-1.5 mt-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {c.email}
                    </td>
                    <td className="p-4 font-extrabold text-blue-700 font-mono text-base">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        {c.totalOrders} đơn
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 text-base">{formatCurrency(c.totalSpent)}</td>
                    <td className="p-4 text-slate-500 font-mono font-bold text-xs">{formatDate(c.firstOrderDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Chưa có khách hàng nào giao dịch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
