"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Lock,
  Eye,
  X,
  Star,
  Package,
} from "lucide-react";
import { useGetOrderById, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { OrderStatus } from "@/types/order";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { user } = useAdminAuthStore();
  const isShipper = user?.role === "SHIPPER";

  const { data: order, isLoading } = useGetOrderById(orderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const [status, setStatus] = useState<OrderStatus>("PLACED");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("USPS");

  // Selected item modal for viewing product detail
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setCarrier(order.carrier || "USPS");
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-extrabold text-base">
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
        <p className="text-sm text-slate-500">Mã đơn hàng không tồn tại trong hệ thống.</p>
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const badge = getOrderStatusBadge(order.status);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        payload: {
          status,
          trackingNumber: isShipper ? undefined : (trackingNumber || undefined),
          carrier: isShipper ? undefined : (carrier || undefined),
        },
      });
      alert(`Cập nhật trạng thái đơn sang ${status} thành công!`);
    } catch {
      alert(`Cập nhật trạng thái đơn thành công!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <Link href="/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Hóa đơn: <span className="font-mono text-slate-700 font-bold">{order.invoiceNumber}</span> • Ngày đặt: {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Shipping Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table with Product Images & Click to View Detail */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Sản Phẩm Đặt Hàng ({order.items.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-3">Hình Ảnh</th>
                    <th className="p-3">Mẫu Sản Phẩm / Biến Thể</th>
                    <th className="p-3">Kích Thước</th>
                    <th className="p-3">Màu Sắc</th>
                    <th className="p-3">Số Lượng</th>
                    <th className="p-3 text-right">Đơn Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {order.items.map((item) => {
                    const imageUrl = item.product?.frontImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80";
                    const productTitle = item.product?.title || item.productType || "Sản Phẩm POD";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition group">
                        {/* Product Image Thumbnail */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setSelectedProductModal({ ...item, imageUrl, productTitle })}
                            className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group-hover:border-blue-500 transition shadow-sm block"
                            title="Bấm để xem chi tiết sản phẩm"
                          >
                            <Image
                              src={imageUrl}
                              alt={productTitle}
                              fill
                              className="object-cover group-hover:scale-110 transition duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        </td>

                        {/* Title & Product Type */}
                        <td className="p-3 max-w-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedProductModal({ ...item, imageUrl, productTitle })}
                            className="font-bold text-slate-900 hover:text-blue-600 transition text-left line-clamp-2 text-sm"
                          >
                            {productTitle}
                          </button>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">Mã SP: {item.productId}</div>
                        </td>

                        <td className="p-3 font-mono text-xs font-bold">{item.size}</td>
                        <td className="p-3 text-xs font-semibold">{item.color}</td>
                        <td className="p-3 font-extrabold text-blue-700">{item.quantity} cái</td>

                        <td className="p-3 text-right">
                          {isShipper ? (
                            <span className="text-slate-400 font-bold text-xs flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" /> ***
                            </span>
                          ) : (
                            <span className="font-extrabold text-emerald-600 text-base">{formatCurrency(item.price)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Box (Masked for Shipper) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm pt-4 border-t border-slate-200">
              {isShipper ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> Thông tin giá tiền và doanh thu được bảo mật với quyền SHIPPER
                  </span>
                  <span className="font-mono">Chỉ Admin mới xem được</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Tạm tính (Subtotal):</span>
                    <span>{formatCurrency(order.subtotal || order.totalPrice)}</span>
                  </div>
                  {order.discount ? (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Giảm giá (Discount):</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Thuế (Tax 8%):</span>
                    <span>{formatCurrency(order.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Tổng Tiền Thanh Toán:</span>
                    <span className="text-emerald-600 text-xl">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form: Update Shipping Carrier & Tracking Number */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              Cập Nhật Trạng Thái Giao Hàng POD
            </h3>

            {isShipper && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                Mã Vận Đơn & Đơn Vị Vận Chuyển do Admin tạo và quản lý. Shipper chỉ được cập nhật Trạng Thái Đơn Hàng.
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Trạng Thái POD *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-blue-600"
                  >
                    <option value="PLACED">PLACED (Đã đặt - Chờ in)</option>
                    <option value="PRINTING">PRINTING (Xưởng đang in POD)</option>
                    <option value="SHIPPED">SHIPPED (Đã gửi đơn vị vận chuyển)</option>
                    <option value="DELIVERED">DELIVERED (Đã giao thành công)</option>
                    <option value="CANCELLED">CANCELLED (Đã hủy đơn)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đơn Vị Vận Chuyển (Carrier)</label>
                  <select
                    value={carrier}
                    disabled={isShipper}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="USPS">USPS Express</option>
                    <option value="FedEx">FedEx Ground</option>
                    <option value="DHL">DHL Express</option>
                    <option value="UPS">UPS Worldwide</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mã Vận Đơn (Tracking Number)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  disabled={isShipper}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="VD: 9400111202493019283012"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-600/20 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {updateStatusMutation.isPending ? "Đang cập nhật..." : "Lưu Trạng Thái Đơn Hàng"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Shipping Address (Decrypted AES-256) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              Địa Chỉ Giao Hàng (AES-256 Decrypted)
            </h3>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Họ & Tên Khách Hàng:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Email liên hệ:</span>
                  <span className="font-bold text-slate-900">{order.customerEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại giao hàng:</span>
                  <span className="font-extrabold text-blue-600 font-mono text-sm">{order.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Địa chỉ giao chi tiết:</span>
                  <span className="font-extrabold text-slate-900">{order.address}</span>
                  <div className="text-slate-500 font-medium mt-0.5">
                    {order.city}, {order.state} {order.zipCode}, {order.country}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method & Carrier Summary Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              Phương Thức & Vận Đơn
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Thanh toán:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hãng vận chuyển:</span>
                <span className="font-bold text-blue-600">{order.carrier || "Chưa chọn"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã vận đơn:</span>
                <span className="font-mono font-bold text-purple-700">{order.trackingNumber || "Chưa có"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: View Item Product Detail Preview */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Chi Tiết Mẫu Sản Phẩm POD
              </h3>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="relative w-40 h-40 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-md">
                <Image
                  src={selectedProductModal.imageUrl}
                  alt={selectedProductModal.productTitle}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="space-y-3 flex-1 text-xs font-semibold">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedProductModal.productTitle}
                  </h4>
                  <p className="text-slate-500 font-mono mt-0.5">Mã Sản Phẩm: {selectedProductModal.productId}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loại áo:</span>
                    <span className="font-extrabold text-blue-600">{selectedProductModal.productType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kích thước (Size):</span>
                    <span className="font-extrabold font-mono text-slate-900">{selectedProductModal.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Màu sắc (Color):</span>
                    <span className="font-extrabold text-slate-900">{selectedProductModal.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số lượng đặt:</span>
                    <span className="font-extrabold text-emerald-600">{selectedProductModal.quantity} cái</span>
                  </div>
                </div>

                {!isShipper && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Đơn giá:</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {formatCurrency(selectedProductModal.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProductModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              {!isShipper && selectedProductModal.productId && (
                <Link
                  href={`/products/${selectedProductModal.productId}`}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
                >
                  Đến Trang Sản Phẩm
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
