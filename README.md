# Sales Website Admin (Web Admin Portal)

Hệ thống Web Admin quản lý bán hàng & in ấn theo yêu cầu (POD E-Commerce), cho phép quản lý Hàng hóa, Sản phẩm, Biến thể (SKU, Size, Màu sắc, Tồn kho), Danh mục và Trạng thái Đơn hàng (`PLACED` ➔ `PRINTING` ➔ `SHIPPED` ➔ `DELIVERED`).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Next.js (App Router) + TypeScript 100% Strict Type
- **UI Kit & Styling:** Tailwind CSS + Shadcn UI + Lucide Icons
- **Animation:** Framer Motion
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5 (React Query)
- **Form & Validation:** React Hook Form + Zod
- **Tables:** `@tanstack/react-table` + Shadcn Table

---

## 🚀 Các Chức Năng Chính (Core Features)

1. **Quản Lý Hàng Hóa & Sản Phẩm (Products & Goods):**
   - Danh sách sản phẩm, giá bán, giá gốc, ảnh mặt trước/mặt sau, slug, danh mục, trạng thái hot/sale.
   - Thêm/Sửa/Xóa sản phẩm với Zod validation.
2. **Quản Lý Biến Thể & Tồn Kho (Product Variants & Inventory):**
   - Phân loại áo (T-Shirt, Hoodie, Sweatshirt...), Kích thước (S - 3XL), Màu sắc, Mã SKU, Giá biến thể.
   - Theo dõi tồn kho (`stock`), cảnh báo sản phẩm hết hàng.
3. **Quản Lý Trạng Thái Đơn Hàng POD (Order Lifecycle):**
   - Theo dõi danh sách đơn hàng với đầy đủ thông tin khách hàng.
   - Cập nhật trạng thái đơn: `PLACED` ➔ `PRINTING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`.
   - Cập nhật Mã vận đơn (`trackingNumber`) và Đơn vị vận chuyển (`carrier`).
4. **Quản Lý Danh Mục (Categories):**
   - Quản lý danh mục hàng hóa, slug và biểu tượng.
5. **Bảo Mật API Admin:**
   - Xác thực đính kèm `Authorization: Bearer <Token>` & `X-Admin-API-Key`.

---

## 📄 Quy Tắc Phát Triển (Project Rules)

Xem chi tiết quy định và tiêu chuẩn kỹ thuật tại [PROJECT_RULES.md](file:///d:/WebUs/sales-website-admin/PROJECT_RULES.md).
