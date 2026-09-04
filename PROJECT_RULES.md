# Senior Web Admin Engineering, Architecture & Security Directive

Tài liệu này quy định tiêu chuẩn kỹ thuật, kiến trúc giao diện, quy tắc bảo mật và chỉ dẫn phát triển dành riêng cho hệ thống **Web Admin Quản lý Hàng hóa & Đơn hàng** (`sales-website-admin`). Mọi quy trình sinh mã, thiết kế UI/UX hay kết nối API đều phải tuân thủ 100% các quy định dưới đây.

---

## 🛠️ 1. Tháp Công Nghệ & Kiến Trúc Chuẩn (Admin Tech Stack)

| Hạng mục | Công nghệ / Thư viện | Tiêu chuẩn & Mục đích sử dụng |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (React - App Router)** | 100% Strict TypeScript. Sử dụng App Router (`app/(dashboard)/...`) cho các trang quản trị SSR/CSR. |
| **Styling & UI Kit** | **Tailwind CSS + Shadcn UI** | Giao diện chuẩn Admin Dashboard hiện đại, nhất quán. Sử dụng Shadcn UI primitives (Table, Dialog, Form, Badge, DropdownMenu...). |
| **Biểu tượng (Icons)** | **Lucide React** | Bộ icon chuẩn cho Dashboard (Box, ShoppingBag, Layers, Key, Users, Truck, AlertCircle...). |
| **Animation & Motion** | **Framer Motion** | Hiệu ứng chuyển trang, Drawer chi tiết đơn hàng, Modal xem thông tin sản phẩm và Sidebar collapsible smooth. |
| **State Management** | **Zustand** | Quản lý state phía Client (`store/useAdminAuthStore.ts`, `store/useFilterStore.ts`, `store/useUIStore.ts`). |
| **Data Fetching & Cache** | **TanStack Query (React Query v5)** | Quản lý state bất đồng bộ, Caching, Auto-Revalidation cho dữ liệu Hàng hóa, Biến thể và Đơn hàng. |
| **Quản lý Form & Validation**| **React Hook Form + Zod** | Validate dữ liệu tạo/sửa Sản phẩm, Biến thể SKU, Giá cả, Cập nhật trạng thái đơn hàng và API Key. |
| **Bảng Dữ Liệu (Tables)** | **@tanstack/react-table** | Tích hợp vào Shadcn Table để Phân trang (Pagination), Lọc (Filtering), Sắp xếp (Sorting) và Thao tác hàng loạt (Bulk Actions). |
| **Kết nối Backend** | **Axios / Fetch Interceptors** | Đọc/Ghi REST API từ `sales-website-be` (`/api/v1/admin/*`), tự động đính kèm `X-Admin-API-Key` & `Authorization: Bearer <Token>`. |

---

## 🚫 Restricted / Forbidden Technologies

Trừ khi được sự đồng ý của User, **TUYỆT ĐỐ KHÔNG** sử dụng:
- Redux, MobX, Context API phức tạp (Dùng **Zustand** thay thế).
- Bootstrap, Material-UI (MUI), Ant Design, Chakra UI (Dùng **Tailwind CSS + Shadcn UI**).
- Viết type kiểu `any` hoặc tắt strict type TS.
- Lưu trữ Plain-text JWT Token hoặc thông tin nhạy cảm ở các nơi công khai không an toàn.
- Tự viết câu lệnh CSS thuần hoặc style inline lặp đi lặp lại.

---

## 🛡️ 2. Tiêu Chuẩn Bảo Mật & Phân Quyền Admin (Admin Security & Interceptors)

1. **Xác Thực Đa Tầng (Multi-Layer Auth):**
   - Mọi yêu cầu gọi đến Backend Admin API (`/api/v1/admin/*`) phải được đính kèm 2 thông tin bắt buộc trong Header:
     - `Authorization: Bearer <Admin_JWT_Access_Token>`
     - `X-Admin-API-Key: <Admin_Secret_API_Key>`
2. **Phân Quyền Vai Trò (Role-Based Access Control - RBAC):**
   - **ADMIN:** Xem báo cáo, Quản lý Hàng hóa (Thêm/Sửa/Xóa Sản phẩm, Biến thể, Danh mục), Cập nhật trạng thái Đơn hàng.
   - **SUPER_ADMIN:** Toàn quyền hệ thống + Quản lý/Cấp phát Admin API Keys (`admin_api_keys`).
3. **An Toàn Dữ Liệu Giải Mã (Decrypted Sensitive Data):**
   - Backend giải mã dữ liệu mã hóa AES-256-GCM (Địa chỉ, Số điện thoại, Tổng tiền) khi Admin truy cập.
   - Phía Frontend Admin không lưu vết các dữ liệu này vào `localStorage` hay `sessionStorage`. Chỉ lưu trong bộ nhớ tạm của TanStack Query cache.
4. **Bảo Vệ Route (Route Guards):**
   - Sử dụng Next.js Middleware (`middleware.ts`) kiểm tra Session Token trước khi cho phép truy cập các trang Dashboard `/admin/*`. Chuyển hướng về `/login` nếu chưa xác thực.
5. **🌐 Quy Tắc Ngôn Ngữ Song Ngữ (Bilingual Directive — MẶC ĐỊNH TIẾNG ANH):**
   - **Mặc định là Tiếng Anh (`'en'`)**: Mọi người dùng mới, ẩn danh, hoặc phiên xóa cache mở Admin phải thấy Tiếng Anh 100%. Quản lý qua Zustand `useLanguageStore` và lưu `localStorage` (`velora_admin_lang`).
   - **Bắt buộc hỗ trợ song ngữ ngay khi thêm tính năng mới**: Mọi màn hình mới, modal mới, nút bấm, placeholder, confirm/alert, badge trạng thái **PHẢI** được viết song ngữ EN/VI ngay từ đầu (`const { language } = useLanguageStore(); const isVi = language === "vi";`). Tuyệt đối không hardcode riêng một thứ tiếng để phải sửa lại. Chi tiết xem tại [LANGUAGE_GUIDELINES.md](file:///D:/WebUs/LANGUAGE_GUIDELINES.md).
6. **🛡️ Tiêu Chuẩn An Toàn & Bảo Mật Dữ Liệu:**
   - Tuyệt đối không để lộ secret key qua tiền tố `NEXT_PUBLIC_`, không lưu dữ liệu nhạy cảm của khách hàng trong storage trình duyệt, tuân thủ nghiêm ngặt [SECURITY_GUIDELINES.md](file:///D:/WebUs/SECURITY_GUIDELINES.md).

---

## 📦 3. Danh Sách Chức Năng Cốt Lõi (Web Admin Features Specification)

### 🛍️ A. Quản Lý Hàng Hóa & Sản Phẩm (Products Management)
- **Danh sách Sản phẩm:** Bảng hiển thị danh sách sản phẩm với hình ảnh thu nhỏ (`frontImage`), Tiêu đề, Slug, Giá gốc (`originalPrice`), Giá bán (`basePrice`), Danh mục (`Category`), Trạng thái Hot/Sale (`isFeatured`, `isSale`), Rating.
- **Tạo / Chỉnh sửa Sản phẩm:** Form chi tiết với Zod validation:
  - Thông tin chung: Tiêu đề, Slug (tự động tạo từ tiêu đề), Mô tả (Rich-text hoặc Textarea), Giá cơ bản.
  - Hình ảnh: URL ảnh mặt trước (`frontImage`), mặt sau (`backImage`).
  - Phân loại: Chọn Danh mục (`categoryId`).
  - Đánh dấu: `isFeatured`, `isSale`.
- **Xóa & Ẩn Sản phẩm:** Xóa hoặc thay đổi trạng thái kinh doanh của sản phẩm.

### 🎨 B. Quản Lý Biến Thể Sản Phẩm (Product Variants & Stock)
- **Danh sách Biến thể theo Sản phẩm:** Hiển thị SKU, Loại áo (`productType`: T-Shirt, Hoodie, Sweatshirt...), Kích cỡ (`size`: S, M, L, XL, 2XL, 3XL), Màu sắc (`color`), Giá biến thể (`price`), Số lượng tồn kho (`stock`), Ảnh biến thể (`imageUrl`).
- **Quản lý Tồn Kho (Inventory Management):** Cập nhật nhanh số lượng tồn kho (`stock`), cảnh báo khi sản phẩm sắp hết hàng (`stock < 10`).
- **Cấu hình SKU:** Tạo mã SKU type-safe tự động theo chuẩn format.

### 📂 C. Quản Lý Danh Mục (Categories Management)
- **Danh sách & CRUD Danh mục:** Tên danh mục, Slug, Biểu tượng (`icon`), Số lượng sản phẩm liên quan.

### 🚚 D. Quản Lý Đơn Hàng & Trạng Thái POD (Order Lifecycle Management)
- **Danh sách Đơn hàng:** Bảng quản lý đơn hàng chuyên nghiệp bao gồm Mã đơn (`orderNumber`), Mã hóa đơn (`invoiceNumber`), Tên khách hàng (`customerName`), Email, Ngày tạo, Tổng tiền, Trạng thái đơn.
- **Trực quan hóa Trạng thái Đơn hàng (Order Status Badge):**
  - `PLACED`: Đơn hàng mới đặt (Màu Xanh Dương / Blue).
  - `PRINTING`: Đang in ấn sản phẩm POD (Màu Vàng Orange / Warning).
  - `SHIPPED`: Đã giao cho đơn vị vận chuyển (Màu Tím / Purple).
  - `DELIVERED`: Đã giao hàng thành công (Màu Xanh Lá / Success).
  - `CANCELLED`: Đã hủy đơn (Màu Đỏ / Destructive).
- **Cập nhật Trạng thái & Vận chuyển:**
  - Drawer / Modal cập nhật trạng thái đơn hàng (`PATCH /api/v1/admin/orders/:id/status`).
  - Nhập Mã vận đơn (`trackingNumber`) và Đơn vị vận chuyển (`carrier` - USPS, FedEx, DHL...).
- **Chi tiết Đơn hàng:** Xem danh sách sản phẩm đặt mua (Product, Variant, Quantity, Price) và thông tin giao hàng đã được giải mã an toàn.

### 🔑 E. Quản Lý API Keys & Hệ Thống (Super Admin)
- Cấp phát, vô hiệu hóa `AdminApiKey` dành cho kết nối các hệ thống tích hợp bên ngoài.

---

## 📂 4. Kiến Trúc Thư Mục Chuẩn (Project Structure)

```text
sales-website-admin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Main Layout với Sidebar & Header
│   │   ├── page.tsx               # Overview / Analytics Dashboard
│   │   ├── products/              # Quản lý Hàng hóa
│   │   │   ├── page.tsx           # Danh sách sản phẩm
│   │   │   ├── new/page.tsx       # Tạo sản phẩm mới
│   │   │   └── [id]/page.tsx      # Sửa sản phẩm & Biến thể
│   │   ├── categories/            # Quản lý Danh mục
│   │   │   └── page.tsx
│   │   ├── orders/                # Quản lý Đơn hàng & Trạng thái
│   │   │   ├── page.tsx           # Danh sách đơn hàng
│   │   │   └── [id]/page.tsx      # Chi tiết & Cập nhật đơn
│   │   └── api-keys/              # Quản lý Admin API Keys
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # Shadcn UI primitives (Button, Table, Dialog, Badge...)
│   ├── common/                    # Sidebar, Header, UserMenu, PageHeader, StatCard
│   └── features/                  # Business components
│       ├── products/              # ProductTable, ProductForm, VariantManager, StockBadge
│       ├── orders/                # OrderTable, OrderStatusBadge, StatusUpdateModal, ShippingDrawer
│       └── categories/            # CategoryModal, CategoryTable
├── lib/
│   ├── api/                       # Axios client & interceptors (Inject Admin Key & Bearer)
│   ├── hooks/                     # Custom TanStack Query hooks (useProducts, useOrders...)
│   └── utils.ts                   # Helper formatters (Currency, Date, Slug, Status color)
├── store/                         # Zustand Stores
│   ├── useAdminAuthStore.ts       # Authentication session & Tokens
│   ├── useOrderFilterStore.ts     # Filter/Search state for orders
│   └── useUIStore.ts              # Sidebar toggle, Modal state
├── types/                         # TypeScript interfaces
│   ├── product.ts                 # Product & Variant types
│   ├── order.ts                   # Order & OrderItem types
│   └── api.ts                     # API Response & Payload types
├── middleware.ts                  # Route protection middleware
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 🤖 5. Bộ Master Prompts Cho AI Chuyên Gia (Senior Admin AI Master Prompts)

### 🎯 Prompt 1: Master System Prompt (Dành cho AI Assistant)
```markdown
Bạn là một Senior Frontend Engineer & UI/UX Specialist chuyên về Next.js App Router, TypeScript và Admin Dashboard.
Nhiệm vụ của bạn là phát triển hệ thống Web Admin Quản lý Hàng hóa & Đơn hàng (`sales-website-admin`) tuân thủ 100% PROJECT_RULES.md:
1. Viết 100% TypeScript strict type, tuyệt đối không dùng `any`.
2. UI/UX: Sử dụng Tailwind CSS + Shadcn UI + Lucide Icons + Framer Motion. Thiết kế sang trọng, hiện đại, hỗ trợ Dark/Light Mode.
3. State & Data: Dùng Zustand cho UI/Client State và TanStack Query v5 cho Server Data (Caching, Invalidation).
4. Forms: Sử dụng React Hook Form + Zod cho mọi thao tác validate sản phẩm, biến thể, tồn kho và trạng thái đơn hàng.
5. REST API: Đảm bảo đính kèm `X-Admin-API-Key` và Bearer token vào mọi request tới Backend (`/api/v1/admin/*`).
```

### ⚡ Prompt 2: Prompt Phát Triển Màn Hình/Tính Năng Admin Mới
```markdown
[TÍNH NĂNG ADMIN]: <Mô tả màn hình/tính năng, ví dụ: Quản lý Biến thể Sản phẩm / Cập nhật Trạng thái Đơn hàng>
1. Tạo Page trong `app/(dashboard)/...` và Component tại `components/features/...`.
2. Form Validation: Định nghĩa Zod Schema và tích hợp React Hook Form.
3. State & Cache: Viết custom hook TanStack Query v5 (`useQuery`/`useMutation`) trong `lib/hooks/`.
4. Responsive & UI: Sử dụng Shadcn UI (Table, Badge, Dialog, Drawer) + Tailwind CSS + Framer Motion.
5. Type-safety: Định nghĩa type chuẩn trong `types/`. Không dùng `any`.
```

### 🔐 Prompt 3: Prompt Kết Nối Backend & Xử Lý API Key / Bearer Auth
```markdown
[KẾT NỐI API BACKEND ADMIN]: <Mô tả API endpoint>
1. Cấu hình Axios / Fetch client tại `lib/api/client.ts` tự động lấy Admin API Key từ `.env` (`NEXT_PUBLIC_ADMIN_API_KEY`) và Access Token từ Zustand Store.
2. Xử lý chuẩn xác các mã HTTP Status: 401 (Unauthenticated -> Redirect /login), 403 (Forbidden -> Notification Alert), 500 (Server Error -> Toast).
3. Viết Mutation tự động invalidate cache (`queryClient.invalidateQueries`) sau khi Tạo/Sửa Sản phẩm hoặc Cập nhật Trạng thái Đơn thành công.
```
