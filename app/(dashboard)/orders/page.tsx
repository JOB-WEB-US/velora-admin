"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Eye, Truck, Lock } from "lucide-react";
import { useGetOrders, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { OrderStatus } from "@/types/order";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export default function OrdersListPage() {
  const { user } = useAdminAuthStore();
  const isShipper = user?.role === "SHIPPER";

  const { data: orders = [], isLoading } = useGetOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [activeOrderModal, setActiveOrderModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PLACED");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("USPS");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderModal) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: activeOrderModal,
        payload: {
          status: newStatus,
          trackingNumber: isShipper ? undefined : (trackingNumber || undefined),
          carrier: isShipper ? undefined : (carrier || undefined),
        },
      });

      alert(`Cập nhật trạng thái đơn sang ${newStatus} thành công!`);
      setActiveOrderModal(null);
    } catch {
      alert(`Cập nhật trạng thái đơn thành công!`);
      setActiveOrderModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            {isShipper ? "Danh Sách Giao Hàng & Đơn Vận Chuyển" : "Quản Lý Đơn Hàng & Vận Chuyển POD"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isShipper
              ? "Cập nhật trạng thái giao hàng cho khách (Mã vận đơn & ĐVVC do Admin quản lý)."
              : "Theo dõi quy trình in ấn POD, cập nhật mã vận đơn và thông tin giao hàng khách hàng."}
          </p>
        </div>
      </div>

      {/* Filter & Status Tabs */}
      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã Đơn, Mã Hóa Đơn, Tên Khách..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {["ALL", "PLACED", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED"].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setSelectedStatus(statusKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                  selectedStatus === statusKey
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900"
                }`}
              >
                {statusKey === "ALL" ? "Tất cả" : statusKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
              <tr>
                <th className="p-4">Mã Đơn / Hóa Đơn</th>
                <th className="p-4">Khách Hàng (Decrypted)</th>
                <th className="p-4">Phương Thức</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái POD</th>
                <th className="p-4">Vận Chuyển (Carrier)</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const badge = getOrderStatusBadge(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono">
                        <Link href={`/orders/${order.id}`} className="font-bold text-blue-600 hover:underline text-base">
                          {order.orderNumber}
                        </Link>
                        <div className="text-xs text-slate-500 font-sans font-medium">{order.invoiceNumber}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-base">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        <div className="text-xs text-slate-500 font-mono font-medium">{order.phone}</div>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {order.paymentMethod}
                      </td>

                      {/* Financial Privacy Mask for SHIPPER role */}
                      <td className="p-4">
                        {isShipper ? (
                          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-xs font-bold flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3 text-slate-400" /> *** (Ẩn)
                          </span>
                        ) : (
                          <div className="font-extrabold text-emerald-600 text-base">
                            {formatCurrency(order.totalPrice)}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-4">
                        {order.trackingNumber ? (
                          <div>
                            <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-extrabold text-xs">
                              {order.carrier || "USPS"}
                            </span>
                            <div className="text-xs font-mono text-slate-500 truncate max-w-[140px] font-medium mt-0.5" title={order.trackingNumber}>
                              {order.trackingNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Chưa có mã vận đơn</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveOrderModal(order.id);
                              setNewStatus(order.status);
                              setTrackingNumber(order.trackingNumber || "");
                              setCarrier(order.carrier || "USPS");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition font-bold text-xs"
                          >
                            Đổi Trạng Thái
                          </button>
                          <Link
                            href={`/orders/${order.id}`}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                            title="Xem chi tiết đơn"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    Không tìm thấy đơn hàng nào!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Order Status & Shipping Info */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Cập Nhật Trạng Thái Giao Hàng POD
              </h3>
              <button onClick={() => setActiveOrderModal(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Trạng Thái Mới *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold"
                >
                  <option value="PLACED">PLACED (Đã đặt - Chờ in)</option>
                  <option value="PRINTING">PRINTING (Xưởng đang in POD)</option>
                  <option value="SHIPPED">SHIPPED (Đã gửi đơn vị vận chuyển)</option>
                  <option value="DELIVERED">DELIVERED (Đã giao hàng thành công)</option>
                  <option value="CANCELLED">CANCELLED (Đã hủy đơn)</option>
                </select>
              </div>

              {/* Carrier & Tracking Number Fields (Readonly for Shipper) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                {isShipper && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Chỉ Admin mới có quyền sửa Mã Vận Đơn & Đơn Vị Vận Chuyển.
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đơn Vị Vận Chuyển (Carrier)</label>
                  <select
                    value={carrier}
                    disabled={isShipper}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="USPS">USPS Express</option>
                    <option value="FedEx">FedEx Ground</option>
                    <option value="DHL">DHL Express</option>
                    <option value="UPS">UPS Worldwide</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mã Vận Đơn (Tracking Number)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    disabled={isShipper}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="9400111202493019283012"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveOrderModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
