"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Eye, Truck, Lock, Sparkles, AlertCircle } from "lucide-react";
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
  const [modalTracking, setModalTracking] = useState("");
  const [modalCarrier, setModalCarrier] = useState("USPS");

  const generateRandomTracking = (chosenCarrier: string = modalCarrier) => {
    const digits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const shortDigits = Math.floor(10000000 + Math.random() * 90000000).toString();

    switch (chosenCarrier) {
      case "USPS":
        return `940011189956${digits.slice(0, 10)}`;
      case "FedEx":
        return `7890${digits.slice(0, 8)}`;
      case "UPS":
        return `1Z999AA101${digits.slice(0, 8)}`;
      case "DHL":
        return `DHL${digits.slice(0, 10)}`;
      case "GHTK":
        return `S${shortDigits}.VN`;
      case "ViettelPost":
        return `VTP${shortDigits}VN`;
      default:
        return `TRK-${Date.now().toString().slice(-8)}`;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const activeOrder = orders.find((o) => o.id === activeOrderModal);
  const isStatusOrTrackingChanged = activeOrder
    ? newStatus !== activeOrder.status ||
      modalTracking.trim() !== (activeOrder.trackingNumber || "") ||
      modalCarrier !== (activeOrder.carrier || "USPS")
    : false;

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderModal || !isStatusOrTrackingChanged) return;

    if (newStatus === "SHIPPED" && !modalTracking.trim()) {
      alert("⚠️ Vui lòng nhập hoặc tạo Mã Vận Đơn trước khi chuyển trạng thái sang SHIPPED (Đã gửi đơn vị vận chuyển)!");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: activeOrderModal,
        payload: {
          status: newStatus,
          trackingNumber: modalTracking.trim() ? modalTracking.trim() : undefined,
          carrier: modalCarrier || undefined,
        },
      });

      alert(`Cập nhật trạng thái đơn sang ${newStatus} thành công!`);
      setActiveOrderModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || `Cập nhật trạng thái đơn thất bại!`);
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
                              setModalTracking(order.trackingNumber || "");
                              setModalCarrier(order.carrier || "USPS");
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

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Trạng Thái Mới *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-blue-600"
                >
                  <option value="PLACED">PLACED (Đã đặt - Chờ in)</option>
                  <option value="PRINTING">PRINTING (Xưởng đang in POD)</option>
                  <option value="SHIPPED">SHIPPED (Đã gửi đơn vị vận chuyển)</option>
                  <option value="DELIVERED">DELIVERED (Đã giao hàng thành công)</option>
                  <option value="CANCELLED">CANCELLED (Đã hủy đơn)</option>
                </select>
              </div>

              {/* Carrier & Tracking Input if SHIPPED or already tracked */}
              {(newStatus === "SHIPPED" || modalTracking || activeOrder?.trackingNumber) && (
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Đơn Vị Vận Chuyển</label>
                    <select
                      value={modalCarrier}
                      onChange={(e) => {
                        const newC = e.target.value;
                        setModalCarrier(newC);
                        if (!modalTracking) {
                          setModalTracking(generateRandomTracking(newC));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    >
                      <option value="USPS">USPS Express (Mỹ)</option>
                      <option value="FedEx">FedEx Ground (Mỹ & Toàn Cầu)</option>
                      <option value="DHL">DHL Express (Quốc Tế)</option>
                      <option value="UPS">UPS Worldwide (Mỹ)</option>
                      <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK - VN)</option>
                      <option value="ViettelPost">Viettel Post (VN)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Mã Vận Đơn (Tracking)</label>
                      <button
                        type="button"
                        onClick={() => setModalTracking(generateRandomTracking(modalCarrier))}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600" /> Tạo Mã ({modalCarrier})
                      </button>
                    </div>
                    <input
                      type="text"
                      value={modalTracking}
                      onChange={(e) => setModalTracking(e.target.value)}
                      placeholder="VD: 9400111202493019283012..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Status Hint */}
              {newStatus === "SHIPPED" && !modalTracking.trim() && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Bắt buộc nhập Mã Vận Đơn khi chuyển sang SHIPPED.
                </p>
              )}
              {newStatus === "PRINTING" && (
                <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  ℹ️ Đơn hàng chuyển sang xưởng in POD, chưa bắt buộc mã vận đơn.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveOrderModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    updateStatusMutation.isPending ||
                    !isStatusOrTrackingChanged ||
                    (newStatus === "SHIPPED" && !modalTracking.trim())
                  }
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isStatusOrTrackingChanged &&
                    !updateStatusMutation.isPending &&
                    !(newStatus === "SHIPPED" && !modalTracking.trim())
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                      : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {updateStatusMutation.isPending ? "Đang cập nhật..." : "Cập Nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
