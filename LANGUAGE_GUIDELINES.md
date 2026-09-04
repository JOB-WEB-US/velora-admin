# Comprehensive Language & Internationalization Directive (Chỉ Thị Tiêu Chuẩn Ngôn Ngữ)

> **MỤC TIÊU CỐT LÕI (CORE OBJECTIVE):**
> Làm đúng ngay từ lần đầu tiên (**Build Right First Time**). Khi thêm bất kỳ tính năng, màn hình, form, nút bấm hay thông báo mới, AI assistant và lập trình viên **BẮT BUỘC** triển khai đúng chuẩn ngôn ngữ ngay từ bước tạo mã ban đầu. Tuyệt đối không viết tạm bằng tiếng Việt rồi sau đó mới sửa lại.

---

## 🗺️ Tổng Quan Phân Bổ Ngôn Ngữ Dự Án (Architecture Overview)

```
d:/WebUs/
├── sales-website-fe/      👉 100% ENGLISH ONLY (Storefront cho khách hàng quốc tế)
├── sales-website-admin/   👉 BILINGUAL: English & Tiếng Việt (MẶC ĐỊNH LÀ TIẾNG ANH)
└── sales-website-be/      👉 100% ENGLISH (API Responses, Error Messages & Swagger/Logs)
```

---

## 🛍️ 1. Customer Storefront (`sales-website-fe`) — 100% English Only

### Nguyên tắc bất biến:
1. **Không có bất kỳ ký tự tiếng Việt nào trong giao diện**:
   - Tiêu đề, văn bản, mô tả, nút bấm, nhãn input, placeholder.
   - Thông báo validate form, thông báo lỗi (`toast`, `alert`).
   - Trạng thái đơn hàng, giỏ hàng, thông tin thanh toán (Checkout).
   - Nội dung modal, drawer, popup, banner khuyến mãi.
2. **Chuẩn hiển thị thương mại điện tử Mỹ / Quốc tế**:
   - Định dạng tiền tệ: `$XX.XX` (USD).
   - Địa chỉ & Vận chuyển: Chuẩn US (Street, City, State, ZIP Code, Country).
   - Đơn vị size chuẩn: S, M, L, XL, 2XL, 3XL.

### Mẫu Code Chuẩn Cho Storefront (`sales-website-fe`):
```tsx
// ✅ ĐÚNG: 100% English
export function CheckoutButton({ isProcessing }: { isProcessing: boolean }) {
  return (
    <button
      type="submit"
      disabled={isProcessing}
      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl"
    >
      {isProcessing ? "Processing Payment..." : "Complete Order"}
    </button>
  );
}

// ❌ SAI: Tuyệt đối không dùng tiếng Việt trong storefront
export function BadCheckoutButton() {
  return <button>Hoàn tất đặt hàng</button>; // CẤM
}
```

---

## ⚙️ 2. Admin Portal (`sales-website-admin`) — Bilingual (Default: English)

### Nguyên tắc bất biến:
1. **Mặc định luôn là Tiếng Anh (`'en'`)**:
   - Người dùng mới, trình duyệt ẩn danh, hoặc phiên xóa cache khi vào Admin **phải luôn thấy toàn bộ giao diện bằng Tiếng Anh**.
   - Ngôn ngữ được quản lý bền vững qua Zustand (`store/useLanguageStore.ts`) với khóa `velora_admin_lang` trong `localStorage`.
2. **Bắt buộc có đủ cả hai ngôn ngữ (English & Tiếng Việt)**:
   - Mỗi khi thêm trang mới, modal mới, cột dữ liệu mới, nút bấm, trạng thái hay thông báo lỗi trong Admin, **PHẢI** viết song ngữ ngay lập tức.
   - Không được phép chỉ viết tiếng Việt hoặc chỉ viết tiếng Anh rồi bỏ sót ngôn ngữ còn lại.

---

### Mẫu Code Chuẩn Cho Admin Portal (`sales-website-admin`):

#### Pattern A: Sử dụng hook `useLanguageStore` (Khuyên dùng cho các trang Dashboard, Bảng, Modal)
```tsx
"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Plus, Trash2 } from "lucide-react";

export default function NewFeaturePage() {
  const { language } = useLanguageStore();
  const isVi = language === "vi";

  const handleDelete = (name: string) => {
    const confirmMsg = isVi
      ? `Bạn có chắc muốn xóa "${name}"?`
      : `Are you sure you want to delete "${name}"?`;
    if (!confirm(confirmMsg)) return;
    // ... delete logic
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isVi ? "Quản Lý Tính Năng Mới" : "New Feature Manager"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isVi
              ? "Mô tả tóm tắt tính năng bằng tiếng Việt hỗ trợ quản trị viên."
              : "Overview description of the new feature for store administrators."}
          </p>
        </div>

        <button className="px-4 py-2 bg-[#ff7700] hover:bg-[#e06800] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5">
          <Plus size={16} /> {isVi ? "Thêm Mới" : "Create New"}
        </button>
      </div>

      {/* Form hoặc Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200">
        <label className="text-xs font-extrabold text-slate-700 block mb-1">
          {isVi ? "Tên Cấu Hình *" : "Configuration Name *"}
        </label>
        <input
          type="text"
          placeholder={isVi ? "Nhập tên cấu hình..." : "Enter configuration name..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
        />
      </div>
    </div>
  );
}
```

#### Pattern B: Danh sách hằng số (Constants, Presets, Filters, Options)
Khi định nghĩa các danh sách chọn (Dropdowns, Color presets, Tab categories):
```tsx
// ✅ ĐÚNG: Luôn kèm cả 2 trường song ngữ (nameEn/nameVi hoặc labelEn/labelVi)
const STATUS_OPTIONS = [
  { value: "ALL", labelEn: "All Statuses", labelVi: "Tất cả trạng thái" },
  { value: "ACTIVE", labelEn: "Active", labelVi: "Đang hoạt động" },
  { value: "PAUSED", labelEn: "Paused", labelVi: "Tạm dừng" },
];

// Cách render:
<select>
  {STATUS_OPTIONS.map(opt => (
    <option key={opt.value} value={opt.value}>
      {isVi ? opt.labelVi : opt.labelEn}
    </option>
  ))}
</select>
```

#### Pattern C: Sử dụng từ điển `lib/i18n/translations.ts` và hook `useTranslation`
Khi dùng các nhãn dùng chung (Global Common Keys):
```tsx
import { useTranslation } from "@/store/useLanguageStore";

export function ActionButtons() {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <button>{t("common.save")}</button>     {/* "Save" (en) / "Lưu" (vi) */}
      <button>{t("common.cancel")}</button>   {/* "Cancel" (en) / "Hủy" (vi) */}
      <button>{t("common.delete")}</button>   {/* "Delete" (en) / "Xóa" (vi) */}
    </div>
  );
}
```

---

## 🗄️ 3. Backend Services (`sales-website-be`) — 100% English API Responses

1. **Thông báo lỗi API (Error Responses)**:
   - Luôn trả về bằng Tiếng Anh chuẩn để tương thích với cả Storefront và các hệ thống tích hợp API bên ngoài:
     - `400 Bad Request`: `"Invalid payload provided"`, `"Email is already registered"`.
     - `401 Unauthorized`: `"Authentication token is missing or invalid"`, `"Invalid email or password"`.
     - `403 Forbidden`: `"You do not have permission to perform this action"`.
     - `404 Not Found`: `"Order not found"`, `"Product variant not found"`.
     - `500 Server Error`: `"Internal server error"`.
2. **Log & Debug**:
   - Ghi log bằng tiếng Anh (`logger.info`, `logger.error`), không ghi log bằng tiếng Việt có dấu tránh lỗi mã hóa encoding trong container/Docker.

---

## 📋 Bảng Kiểm Tra Nhanh Trước Khi Hoàn Thành Tính Năng (Checklist)

Mỗi khi tạo mới hoặc cập nhật bất kỳ tính năng nào, hãy kiểm tra danh sách này trước khi hoàn thành:

- [ ] **Storefront (`sales-website-fe`)**:
  - [ ] Tìm kiếm trong file vừa sửa/tạo có chữ tiếng Việt nào không? (Kết quả phải là: **0 ký tự tiếng Việt**).
  - [ ] Chạy `npx tsc --noEmit` đạt exit code 0.
- [ ] **Admin Portal (`sales-website-admin`)**:
  - [ ] Đã import `useLanguageStore` và lấy `const { language } = useLanguageStore(); const isVi = language === "vi";` chưa?
  - [ ] Tất cả tiêu đề, nút, bảng, placeholder, confirm/alert đã có nhánh `isVi ? "..." : "..."` chưa?
  - [ ] Đã kiểm tra khi mở ở chế độ Tiếng Anh (`language === 'en'`) toàn bộ giao diện có hiển thị tiếng Anh chuẩn không?
  - [ ] Chạy `npx tsc --noEmit` đạt exit code 0.
- [ ] **Backend (`sales-website-be`)**:
  - [ ] Mã lỗi và message trả về là tiếng Anh chuẩn chưa?
  - [ ] Chạy `npx tsc --noEmit` đạt exit code 0.
