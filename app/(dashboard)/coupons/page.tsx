"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { useLanguageStore } from "@/store/useLanguageStore";
import { 
  Ticket, 
  Plus, 
  Search, 
  Percent, 
  DollarSign, 
  Truck, 
  Check, 
  Copy, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  X
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "shipping";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  expiresAt?: string | null;
  createdAt: string;
}

export default function CouponsManagementPage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed" | "shipping",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: "",
    isActive: true,
    isPublic: true,
    expiresAt: "",
  });
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/coupons/admin/all");
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: "",
      isActive: true,
      isPublic: true,
      expiresAt: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "",
      isActive: coupon.isActive,
      isPublic: coupon.isPublic,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setModalError(isVi ? "Vui lòng nhập mã giảm giá (Code)" : "Please enter coupon code");
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const url = editingCoupon ? `/coupons/${editingCoupon.id}` : "/coupons";
      const method = editingCoupon ? "PUT" : "POST";
      await apiClient.request({ url, method, data: payload });

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isVi ? "Bạn có chắc chắn muốn xóa mã giảm giá này?" : "Are you sure you want to delete this coupon?")) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err: any) {
      alert(isVi ? "Lỗi khi xóa mã: " + err.message : "Error deleting coupon: " + err.message);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsages = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-blue-600" /> {isVi ? "Quản Lý Mã Giảm Giá & Khuyến Mãi (Coupons)" : "Coupons & Discounts Management"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isVi ? "Tạo và cấu hình các chương trình ưu đãi, giảm giá % hoặc miễn phí vận chuyển cho khách hàng." : "Create and configure discounts, percentage off, or free shipping for customers."}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> {isVi ? "Tạo Mã Giảm Giá Mới" : "Create New Coupon"}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isVi ? "Tổng số mã" : "Total Coupons"}</div>
            <div className="text-2xl font-black text-slate-800">{coupons.length} {isVi ? "Mã" : "Coupons"}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isVi ? "Đang hoạt động" : "Active Coupons"}</div>
            <div className="text-2xl font-black text-emerald-600">{activeCouponsCount} {isVi ? "Mã Active" : "Active"}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isVi ? "Lượt áp dụng thành công" : "Total Usages"}</div>
            <div className="text-2xl font-black text-indigo-600">{totalUsages} {isVi ? "Lượt dùng" : "Uses"}</div>
          </div>
        </div>
      </div>

      {/* Search and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isVi ? "Tìm kiếm mã code hoặc mô tả..." : "Search coupon code or description..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">{isVi ? "Mã Coupon" : "Coupon Code"}</th>
                <th className="py-3 px-5">{isVi ? "Mô tả & Loại giảm giá" : "Description & Type"}</th>
                <th className="py-3 px-5">{isVi ? "Giá trị giảm" : "Discount Value"}</th>
                <th className="py-3 px-5">{isVi ? "Đơn tối thiểu" : "Min Order"}</th>
                <th className="py-3 px-5">{isVi ? "Lượt dùng" : "Uses"}</th>
                <th className="py-3 px-5">{isVi ? "Hạn sử dụng" : "Expires At"}</th>
                <th className="py-3 px-5">{isVi ? "Trạng thái" : "Status"}</th>
                <th className="py-3 px-5 text-right">{isVi ? "Thao tác" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isVi ? "Đang tải danh sách mã giảm giá..." : "Loading coupons list..."}
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isVi ? "Không tìm thấy mã giảm giá nào." : "No coupons found."}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono font-extrabold text-blue-600 text-xs tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          title={isVi ? "Sao chép mã" : "Copy code"}
                        >
                          {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="text-xs text-slate-800 font-bold">{coupon.description}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {coupon.discountType === "percentage" && <Percent className="w-3 h-3 text-amber-500" />}
                        {coupon.discountType === "fixed" && <DollarSign className="w-3 h-3 text-emerald-500" />}
                        {coupon.discountType === "shipping" && <Truck className="w-3 h-3 text-blue-500" />}
                        <span className="capitalize">{coupon.discountType} discount</span>
                        {coupon.isPublic && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded">{isVi ? "Công khai" : "Public"}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {coupon.discountType === "percentage" && `${coupon.discountValue}%`}
                        {coupon.discountType === "fixed" && `$${coupon.discountValue.toFixed(2)}`}
                        {coupon.discountType === "shipping" && (isVi ? "Miễn phí ship" : "Free Shipping")}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {coupon.minOrderAmount > 0 ? `$${coupon.minOrderAmount.toFixed(2)}` : (isVi ? "Không giới hạn" : "No minimum")}
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-800 text-xs">
                      {coupon.usageCount || 0}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-500">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString(isVi ? "vi-VN" : "en-US") : (isVi ? "Vĩnh viễn" : "Lifetime")}
                    </td>

                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition cursor-pointer ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {coupon.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        <span>{coupon.isActive ? (isVi ? "Hoạt động" : "Active") : (isVi ? "Tắt" : "Inactive")}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(coupon)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title={isVi ? "Chỉnh sửa" : "Edit"}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title={isVi ? "Xóa mã" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                {editingCoupon ? (isVi ? "Chỉnh Sửa Mã Giảm Giá" : "Edit Coupon") : (isVi ? "Tạo Mã Giảm Giá Mới" : "Create New Coupon")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isVi ? "Mã Code Khuyến Mãi" : "Coupon Code"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isVi ? "Ví dụ: BLACKFRIDAY30, VELORA20" : "E.g. BLACKFRIDAY30, VELORA20"}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-black text-blue-600 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isVi ? "Mô tả chương trình" : "Description"}
                </label>
                <input
                  type="text"
                  placeholder={isVi ? "Ví dụ: Giảm 20% cho đơn hàng đầu tiên" : "E.g. 20% off for first order"}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isVi ? "Loại giảm giá" : "Discount Type"}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e: any) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="percentage">{isVi ? "Phần trăm (%)" : "Percentage (%)"}</option>
                    <option value="fixed">{isVi ? "Tiền mặt cố định ($)" : "Fixed Amount ($)"}</option>
                    <option value="shipping">{isVi ? "Miễn phí ship (Free Ship)" : "Free Shipping"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isVi ? `Giá trị giảm ${formData.discountType === "percentage" ? "(%)" : "($)"}` : `Discount Value ${formData.discountType === "percentage" ? "(%)" : "($)"}`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={formData.discountType === "shipping"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Min Order & Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isVi ? "Đơn tối thiểu ($)" : "Minimum Order ($)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isVi ? "Ngày hết hạn (Tuỳ chọn)" : "Expiration Date (Optional)"}
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Checkboxes: Active & Public */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>{isVi ? "Kích hoạt mã ngay (Active)" : "Activate coupon immediately (Active)"}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>{isVi ? "Hiển thị công khai gợi ý trong Giỏ hàng (Public Coupon)" : "Show publicly in Cart / Checkout suggestions"}</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (isVi ? "Đang lưu..." : "Saving...") : editingCoupon ? (isVi ? "Cập Nhật" : "Update Coupon") : (isVi ? "Tạo Mã" : "Create Coupon")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
