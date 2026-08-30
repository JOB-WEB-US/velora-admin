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
  Package,
  Printer,
  Download,
  ExternalLink,
  ShieldCheck,
  FileText,
  Link2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useGetOrderById, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { OrderStatus } from "@/types/order";
import { formatCurrency, formatDate, getOrderStatusBadge, downloadDirectFile } from "@/lib/utils";

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
  const [isTrackingUnlocked, setIsTrackingUnlocked] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDownload = async (url: string, filename: string, key: string) => {
    setDownloadingKey(key);
    try {
      await downloadDirectFile(url, filename);
    } finally {
      setDownloadingKey(null);
    }
  };

  // Selected item modal for viewing product detail & print artwork
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);

  const generateRandomTracking = (chosenCarrier: string = carrier) => {
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

  const handleRandomizeTracking = () => {
    setTrackingNumber(generateRandomTracking(carrier));
  };

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setCarrier(order.carrier || "USPS");
      setIsTrackingUnlocked(false);
    }
  }, [order]);

  const initialStatus = order?.status;
  const initialTracking = order?.trackingNumber || "";
  const initialCarrier = order?.carrier || "USPS";

  const isAlreadyFulfilled = Boolean(order?.trackingNumber && (order.status === "SHIPPED" || order.status === "DELIVERED"));
  const isTrackingFieldLocked = isAlreadyFulfilled && !isTrackingUnlocked;

  const isChanged = Boolean(
    order &&
      (status !== initialStatus ||
        trackingNumber.trim() !== initialTracking ||
        carrier !== initialCarrier)
  );

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
    if (!isChanged) {
      return;
    }

    // Require tracking number if moving to SHIPPED
    if (status === "SHIPPED" && !trackingNumber.trim()) {
      alert("⚠️ Vui lòng nhập hoặc bấm '🎲 Tạo Mã Ngẫu Nhiên' để cấp Mã Vận Đơn trước khi chuyển trạng thái sang SHIPPED (Đã gửi đơn vị vận chuyển)!");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        payload: {
          status,
          trackingNumber: trackingNumber ? trackingNumber.trim() : undefined,
          carrier: carrier || undefined,
        },
      });
      alert(`Cập nhật đơn hàng thành công (Trạng thái: ${status}, Vận đơn: ${trackingNumber.trim() || "Chưa có"})!`);
    } catch (err: any) {
      alert(err.response?.data?.message || `Cập nhật trạng thái đơn thất bại!`);
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

        {/* Security Role Tag */}
        <div className="flex items-center gap-2">
          {isShipper ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-extrabold shadow-sm">
              <Truck className="w-4 h-4 text-purple-600" /> Cổng Điều Phối SHIPPER / POD
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Cổng Quản Trị ADMIN
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Shipping Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table with Product Images & POD Print-Ready Downloads */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Sản Phẩm Cần In & Giao ({order.items.length})
              </h3>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-indigo-600" /> File In Gốc (300 DPI)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-3">Hình Ảnh</th>
                    <th className="p-3">Mẫu Áo / Biến Thể</th>
                    <th className="p-3">Size / Màu</th>
                    <th className="p-3">SL</th>
                    <th className="p-3">File In POD (300 DPI)</th>
                    <th className="p-3 text-right">Đơn Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                  {order.items.map((item) => {
                    const imageUrl = item.product?.frontImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80";
                    const productTitle = item.product?.title || item.productType || "Sản Phẩm POD";
                    const printFront = item.product?.printFileFront;
                    const printBack = item.product?.printFileBack;
                    const driveUrl = item.product?.printDriveUrl;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition group">
                        {/* Product Image Thumbnail */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setSelectedProductModal({ ...item, imageUrl, productTitle })}
                            className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group-hover:border-blue-500 transition shadow-sm block"
                            title="Bấm để xem chi tiết & File in"
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
                            className="font-bold text-slate-900 hover:text-blue-600 transition text-left line-clamp-2 text-xs"
                          >
                            {productTitle}
                          </button>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Loại: <span className="text-blue-700 font-bold">{item.productType}</span>
                          </div>
                        </td>

                        <td className="p-3 text-xs">
                          <div className="font-mono font-bold text-slate-900">{item.size}</div>
                          <div className="text-slate-500 font-medium text-[11px]">{item.color}</div>
                        </td>

                        <td className="p-3 font-extrabold text-blue-700 text-xs">x{item.quantity}</td>

                        {/* POD Print File Download Cell */}
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5 text-[11px]">
                            {printFront ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(
                                      printFront,
                                      `${order.orderNumber}-${productTitle}-front-print.png`,
                                      `table-front-${item.id}`
                                    )
                                  }
                                  disabled={downloadingKey === `table-front-${item.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Tải trực tiếp file in mặt trước về máy"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>
                                    {downloadingKey === `table-front-${item.id}` ? "Đang tải..." : "Tải Mặt Trước"}
                                  </span>
                                </button>
                                <a
                                  href={printFront}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                  title="Xem trước ảnh gốc trong tab mới"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(imageUrl, `${order.orderNumber}-${productTitle}-mockup.png`, `table-mockup-${item.id}`)
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-[10px] cursor-pointer"
                                >
                                  <Download className="w-2.5 h-2.5" /> Mockup
                                </button>
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-slate-500 hover:text-slate-900"
                                  title="Xem mockup"
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {printBack && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(
                                      printBack,
                                      `${order.orderNumber}-${productTitle}-back-print.png`,
                                      `table-back-${item.id}`
                                    )
                                  }
                                  disabled={downloadingKey === `table-back-${item.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Tải trực tiếp file in mặt sau về máy"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>
                                    {downloadingKey === `table-back-${item.id}` ? "Đang tải..." : "Tải Mặt Sau"}
                                  </span>
                                </button>
                                <a
                                  href={printBack}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                  title="Xem trước ảnh gốc trong tab mới"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}

                            {driveUrl && (
                              <a
                                href={driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold text-[10px] pt-0.5"
                              >
                                <ExternalLink className="w-2.5 h-2.5" /> Master Drive
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          {isShipper ? (
                            <span className="text-slate-400 font-bold text-xs flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" /> ***
                            </span>
                          ) : (
                            <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(item.price)}</span>
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
                  <div className="flex justify-between text-slate-600 font-semibold text-xs">
                    <span>Tạm tính (Subtotal):</span>
                    <span>{formatCurrency(order.subtotal || order.totalPrice)}</span>
                  </div>
                  {order.discount ? (
                    <div className="flex justify-between text-rose-600 font-semibold text-xs">
                      <span>Giảm giá (Discount):</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600 font-semibold text-xs">
                    <span>Thuế (Tax 8%):</span>
                    <span>{formatCurrency(order.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Tổng Tiền Thanh Toán:</span>
                    <span className="text-emerald-600 font-mono">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Update Order Status & Fulfillment Tracking Form (Open for both Admin & Shipper) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-purple-600" />
              Cập Nhật Trạng Thái Đơn & Mã Vận Đơn (Tracking)
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Trạng Thái Đơn Hàng (Order Status) *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
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
                    disabled={isTrackingFieldLocked}
                    onChange={(e) => {
                      const newCarrier = e.target.value;
                      setCarrier(newCarrier);
                      if (!trackingNumber && !isTrackingFieldLocked) {
                        setTrackingNumber(generateRandomTracking(newCarrier));
                      }
                    }}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none transition ${
                      isTrackingFieldLocked
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600"
                    }`}
                  >
                    <option value="USPS">USPS Express (Mỹ)</option>
                    <option value="FedEx">FedEx Ground (Mỹ & Toàn Cầu)</option>
                    <option value="DHL">DHL Express (Quốc Tế)</option>
                    <option value="UPS">UPS Worldwide (Mỹ)</option>
                    <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK - VN)</option>
                    <option value="ViettelPost">Viettel Post (VN)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700">Mã Vận Đơn (Tracking Number)</label>
                    {isAlreadyFulfilled && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" /> Đã cố định
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAlreadyFulfilled && isTrackingFieldLocked ? (
                      <button
                        type="button"
                        onClick={() => setIsTrackingUnlocked(true)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer"
                        title="Mở khóa để Admin chỉnh sửa mã vận đơn khi cần thiết"
                      >
                        🔓 Mở khóa sửa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRandomizeTracking}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                        title="Tự động tạo mã vận đơn ngẫu nhiên theo hãng"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>🎲 Tạo Mã Ngẫu Nhiên ({carrier})</span>
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={trackingNumber}
                  disabled={isTrackingFieldLocked}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={
                    status === "PRINTING"
                      ? "Đang in POD (có thể để trống hoặc điền sau khi giao hàng)..."
                      : "Nhập hoặc bấm Tạo ngẫu nhiên (VD: 9400111202493019283012)..."
                  }
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm transition ${
                    isTrackingFieldLocked
                      ? "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  }`}
                />

                {/* Status Guidance Alerts */}
                {status === "SHIPPED" && !trackingNumber.trim() && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Bắt buộc phải có Mã Vận Đơn khi chuyển sang SHIPPED (Đã gửi đơn vị vận chuyển).
                  </p>
                )}
                {status === "PRINTING" && !trackingNumber.trim() && (
                  <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 pt-0.5">
                    ℹ️ Giai đoạn in ấn POD chưa bắt buộc có mã vận đơn. Sẽ nhập khi xưởng in xong và bàn giao bưu tá.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending || !isChanged}
                  className={`px-6 py-3 rounded-xl font-bold transition text-xs flex items-center gap-2 ${
                    isChanged && !updateStatusMutation.isPending
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 cursor-pointer"
                      : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {updateStatusMutation.isPending
                    ? "Đang cập nhật..."
                    : isChanged
                    ? "Cập Nhật Trạng Thái & Mã Vận Đơn"
                    : "Chưa có thay đổi để cập nhật"}
                </button>
                {isChanged && (
                  <span className="text-[11px] text-amber-600 font-bold animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Có thay đổi chưa lưu
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* POD PRINT-READY ARTWORKS DIRECT PREVIEW CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-white border border-indigo-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-indigo-950">
                  Bản In Ấn Chuẩn Xưởng POD Trực Quan (300 DPI Master Files)
                </h3>
              </div>
              <span className="text-[11px] bg-indigo-100 text-indigo-800 font-extrabold px-3 py-1 rounded-full">
                Xem & Tải Trực Tiếp (Admin & Shipper)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item, idx) => {
                const productTitle = item.product?.title || item.productType || "Sản Phẩm POD";
                const printFront = item.product?.printFileFront;
                const printBack = item.product?.printFileBack;
                const driveUrl = item.product?.printDriveUrl;

                return (
                  <div key={item.id || idx} className="p-4 rounded-xl bg-white border border-indigo-100 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={productTitle}>
                        #{idx + 1}. {productTitle}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.productType} • {item.size} • {item.color}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Front Preview */}
                      <div className="space-y-1.5 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block">File In Mặt Trước (Front)</span>
                        {printFront ? (
                          <>
                            <div className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={printFront} alt="Front Print" className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    printFront,
                                    `${order.orderNumber}-${productTitle}-front-print.png`,
                                    `card-front-${item.id}`
                                  )
                                }
                                disabled={downloadingKey === `card-front-${item.id}`}
                                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                                title="Lưu trực tiếp file in gốc vào máy tính"
                              >
                                <Download className="w-3 h-3" />
                                <span>{downloadingKey === `card-front-${item.id}` ? "Đang tải..." : "Tải Về Máy"}</span>
                              </button>
                              <a
                                href={printFront}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition"
                                title="Mở tab mới xem ảnh 300 DPI kích thước gốc"
                              >
                                <Eye className="w-3 h-3" /> Xem Full
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400 text-[11px] gap-1">
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                            <span>Không có bản in mặt trước</span>
                          </div>
                        )}
                      </div>

                      {/* Back Preview */}
                      <div className="space-y-1.5 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block">File In Mặt Sau (Back)</span>
                        {printBack ? (
                          <>
                            <div className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={printBack} alt="Back Print" className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    printBack,
                                    `${order.orderNumber}-${productTitle}-back-print.png`,
                                    `card-back-${item.id}`
                                  )
                                }
                                disabled={downloadingKey === `card-back-${item.id}`}
                                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                                title="Lưu trực tiếp file in gốc vào máy tính"
                              >
                                <Download className="w-3 h-3" />
                                <span>{downloadingKey === `card-back-${item.id}` ? "Đang tải..." : "Tải Về Máy"}</span>
                              </button>
                              <a
                                href={printBack}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition"
                                title="Mở tab mới xem ảnh 300 DPI kích thước gốc"
                              >
                                <Eye className="w-3 h-3" /> Xem Full
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400 text-[11px] gap-1">
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                            <span>Không có bản in mặt sau</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {driveUrl && (
                      <a
                        href={driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1 border border-blue-200 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Mở Thư Mục Master Google Drive
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Shipping Address (Decrypted AES-256) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              Địa Chỉ Giao Hàng
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

            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Thanh toán:</span>
                <span className="font-extrabold uppercase text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị vận chuyển:</span>
                <span className="font-extrabold text-blue-700">{order.carrier || carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã Vận Đơn:</span>
                <span className="font-mono font-extrabold text-purple-700">
                  {order.trackingNumber || "Chưa phát hành"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Product Detail & Full POD Artwork Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Chi Tiết Mẫu Áo & File Thiết Kế In POD
              </h3>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="relative w-36 h-36 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-md">
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
              </div>
            </div>

            {/* POD Master Artworks Area */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <h5 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Printer className="w-4 h-4 text-indigo-600" /> Bản In Ấn Chuẩn Xưởng POD (300 DPI Master Files)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Artwork */}
                <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">File In Mặt Trước (Front)</span>
                  {selectedProductModal.product?.printFileFront ? (
                    <div className="space-y-2">
                      <div className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedProductModal.product.printFileFront}
                          alt="Front print"
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              selectedProductModal.product.printFileFront,
                              `${selectedProductModal.productTitle}-front-print.png`,
                              `modal-front`
                            )
                          }
                          disabled={downloadingKey === `modal-front`}
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingKey === `modal-front` ? "Đang tải..." : "Tải Về Máy"}</span>
                        </button>
                        <a
                          href={selectedProductModal.product.printFileFront}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Trực Tiếp</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400 text-xs gap-1">
                      <AlertCircle className="w-4 h-4 text-slate-300" />
                      <span>Không có bản in mặt trước</span>
                    </div>
                  )}
                </div>

                {/* Back Artwork */}
                <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">File In Mặt Sau (Back)</span>
                  {selectedProductModal.product?.printFileBack ? (
                    <div className="space-y-2">
                      <div className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedProductModal.product.printFileBack}
                          alt="Back print"
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              selectedProductModal.product.printFileBack,
                              `${selectedProductModal.productTitle}-back-print.png`,
                              `modal-back`
                            )
                          }
                          disabled={downloadingKey === `modal-back`}
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingKey === `modal-back` ? "Đang tải..." : "Tải Về Máy"}</span>
                        </button>
                        <a
                          href={selectedProductModal.product.printFileBack}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Trực Tiếp</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400 text-xs gap-1">
                      <AlertCircle className="w-4 h-4 text-slate-300" />
                      <span>Không có bản in mặt sau</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Master Drive Link if available */}
              {selectedProductModal.product?.printDriveUrl && (
                <div className="pt-1">
                  <a
                    href={selectedProductModal.product.printDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-between hover:bg-blue-100 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" /> Master Cloud Folder (Google Drive / Dropbox)
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
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
