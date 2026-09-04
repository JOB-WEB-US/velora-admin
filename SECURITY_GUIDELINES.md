# Comprehensive Security & Engineering Directive (Chỉ Thị Bảo Mật & Tiêu Chuẩn Kỹ Thuật)

> **NGUYÊN TẮC BẢO MẬT BẤT BIẾN (SECURITY FIRST PRINCIPLE):**
> Trong mọi quá trình phát triển tính năng mới, tái cấu trúc mã nguồn hay thiết kế cơ sở dữ liệu, sự an toàn của thông tin khách hàng, tính toàn vẹn của dữ liệu sản phẩm/tài chính, và việc bảo vệ bí mật hệ thống (Secrets & API Keys) là **ƯU TIÊN HÀNG ĐẦU**.
> Bất kỳ đoạn mã nào vi phạm các quy chuẩn dưới đây đều bị coi là lỗi nghiêm trọng (Critical Vulnerability).

---

## 🗺️ Mục Lục & Tháp Bảo Mật (Security Architecture)

```
D:/WebUs/
├── 🔑 PHẦN 1: Tuyệt Đối Không Lộ Secrets & Quản Lý Khóa Bí Mật (Zero Secret Leakage)
├── 👤 PHẦN 2: Bảo Vệ Dữ Liệu Khách Hàng (Customer PII Protection & Privacy)
├── 💰 PHẦN 3: Bảo Toàn Dữ Liệu Sản Phẩm, Giá Cả & Giao Dịch (Financial & Order Integrity)
├── 🛡️ PHẦN 4: Phân Quyền Kiểm Soát Truy Cập (RBAC & Route Protection)
├── 💻 PHẦN 5: Quy Chuẩn Kỹ Thuật Lập Trình An Toàn (Secure Coding Standards)
└── 📋 PHẦN 6: Bảng Kiểm Tra An Ninh (Security Verification Checklist)
```

---

## 🔑 PHẦN 1: Tuyệt Đối Không Lộ Secrets & Quản Lý Khóa Bí Mật (Zero Secret Leakage)

### 1.1. Phân định ranh giới giữa Public và Private Environment Variables
- **Next.js Frontend / Admin**:
  - Chỉ những biến cấu hình phục vụ client (như URL public API, Base URL hình ảnh) mới được đặt tiền tố `NEXT_PUBLIC_` (ví dụ: `NEXT_PUBLIC_API_URL`).
  - **CẤM TUYỆT ĐỐI**: Đặt tiền tố `NEXT_PUBLIC_` cho bất kỳ biến nào chứa Secret:
    - ❌ `NEXT_PUBLIC_ADMIN_SECRET_KEY` (RÒ RỈ CHO MỌI NGƯỜI DÙNG F12)
    - ❌ `NEXT_PUBLIC_JWT_SECRET`
    - ❌ `NEXT_PUBLIC_DATABASE_URL`
    - ❌ `NEXT_PUBLIC_CLOUDINARY_API_SECRET`
    - ❌ `NEXT_PUBLIC_PAYPAL_CLIENT_SECRET`
- **Backend (`sales-website-be`)**:
  - Toàn bộ secret chỉ được đọc từ `process.env` thông qua thư viện `dotenv.config()`.
  - Không bao giờ commit file `.env` vào Git repository. Chỉ commit file mẫu `.env.example` với giá trị rỗng hoặc giá trị giả lập an toàn.

### 1.2. Tuyệt đối không dùng Fallback Secret mặc định (No Hardcoded Fallback Secrets)
Trong mã nguồn, nếu một biến môi trường nhạy cảm bị thiếu hoặc chưa cấu hình, hệ thống **PHẢI DỪNG LẠI (FATAL EXCEPTION)** ngay khi khởi động. Không được phép gán giá trị mặc định kiểu fallback tạm bợ:

```typescript
// ❌ RẤT NGUY HIỂM: Kẻ tấn công có thể giả mạo JWT hoặc giải mã CSDL
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_123";

// ✅ ĐÚNG: Kiểm tra và ném lỗi rõ ràng nếu thiếu hoặc độ dài yếu
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET must be configured with at least 32 characters!");
}
```

### 1.3. Cơ chế Lưu Trữ Khóa Admin API Key (One-Way Hashing)
- Khi cấp phát `AdminApiKey`, chuỗi raw key (ví dụ: `velora_abc123...`) được sinh bằng hàm mã hóa ngẫu nhiên an toàn:
  ```typescript
  import crypto from "crypto";
  const rawKey = `velora_${crypto.randomBytes(32).toString("base64url")}`;
  ```
- **Không bao giờ lưu `rawKey` trực tiếp vào cơ sở dữ liệu**:
  - Bắt buộc băm bằng SHA-256 (`crypto.createHash("sha256").update(rawKey).digest("hex")`) và chỉ lưu giá trị băm (`keyHash`).
  - Raw key chỉ được trả về **duy nhất 1 lần** cho quản trị viên tạo khóa.
  - Khi xác thực request từ client gửi `X-Admin-API-Key: <rawKey>`, Backend băm chuỗi nhận được rồi so khớp với cột `keyHash` trong CSDL.

---

## 👤 PHẦN 2: Bảo Vệ Dữ Liệu Khách Hàng (Customer PII Protection & Privacy)

### 2.1. Mã Hóa Dữ Liệu Tĩnh Trong Cơ Sở Dữ Liệu (Data-at-Rest Encryption)
Thông tin nhận dạng cá nhân (PII - Personally Identifiable Information) của khách hàng bao gồm:
- Họ tên (`firstName`, `lastName`)
- Số điện thoại (`phone`)
- Địa chỉ giao hàng, số nhà, căn hộ (`street`, `apartment`)

**Quy tắc:**
- Bắt buộc mã hóa bằng thuật toán đối xứng tiêu chuẩn **AES-256-GCM** trước khi ghi vào database (`prisma.userAddress.create`, `update`).
- Thuật toán AES-256-GCM phải sử dụng Initialization Vector (IV) ngẫu nhiên 12-16 bytes cho mỗi lần mã hóa, kèm Authentication Tag để chống giả mạo ciphertext.
- Khi truy vấn trả về cho chính khách hàng đó, Service tự động giải mã minh bạch. Nếu dữ liệu cũ chưa mã hóa, hệ thống xử lý tương thích ngược an toàn.

### 2.2. Không Lưu Dữ Liệu Thẻ Thanh Toán (PCI-DSS Compliance)
- Hệ thống tuyệt đối **KHÔNG LƯU TRỮ** số thẻ tín dụng (PAN), ngày hết hạn, mã CVV/CVC của khách hàng trên cơ sở dữ liệu hay bộ nhớ server.
- Mọi giao dịch thẻ tín dụng phải được thực hiện thông qua cổng thanh toán đạt chuẩn PCI-DSS Level 1 (PayPal REST SDK / Hosted Fields / Stripe Elements).

### 2.3. Vệ Sinh Bộ Nhớ Trình Duyệt Phía Frontend (Frontend Data Hygiene)
- **CẤM LƯU PII VÀO `localStorage` HOẶC `sessionStorage`**:
  - Không bao giờ lưu danh sách đơn hàng của khách hàng, họ tên, địa chỉ hay số điện thoại vào `localStorage` dưới dạng plain text (xâm phạm quyền riêng tư khi máy tính công cộng/dùng chung).
  - Toàn bộ thông tin tài khoản và đơn hàng phải được nạp thông qua các endpoint API có xác thực phiên (Session-authenticated endpoints) và lưu trong bộ nhớ RAM tạm thời của TanStack Query / React State.

### 2.4. Che Giấu Nhật Ký Hệ Thống (Log Masking)
- Tuyệt đối **KHÔNG IN** mật khẩu người dùng, token truy cập, hoặc mã OTP ra terminal console (ngay cả trong môi trường phát triển cục bộ).
- Các trường định danh như email khách hàng trong câu lệnh log phải được che giấu:
  ```typescript
  // Helper che giấu email: "customer123@gmail.com" => "c***3@gmail.com"
  export function maskEmail(email: string): string {
    const [user, domain] = email.split("@");
    if (!domain) return "***";
    const masked = user.length <= 2 ? user[0] + "***" : user[0] + "***" + user[user.length - 1];
    return `${masked}@${domain}`;
  }
  ```

### 2.5. Phòng Chống Thu Thập Thông Tin Người Dùng (Anti-User Enumeration)
- Tại màn hình đăng nhập hoặc quên mật khẩu, thông báo lỗi phải đồng nhất:
  - ✅ `"Email hoặc mật khẩu không chính xác."` (Hoặc `"Invalid email or password."`)
  - ❌ `"Email này chưa được đăng ký trong hệ thống."` (Làm lộ danh sách khách hàng đang có tài khoản).
- Khi người dùng gửi yêu cầu đặt lại mật khẩu, luôn trả về thông báo thành công chung (ví dụ: `"If an account exists for this email, an OTP has been sent."`) bất kể email có tồn tại hay không.

---

## 💰 PHẦN 3: Bảo Toàn Dữ Liệu Sản Phẩm, Giá Cả & Giao Dịch (Financial & Order Integrity)

### 3.1. Tính Giá Hoàn Toàn Phía Server (100% Server-Side Price Calculation)
> **LUẬT THÉP: KHÔNG BAO GIỜ TIN TƯỞNG GIÁ TIỀN GỬI TỪ CLIENT.**

Kẻ tấn công có thể dễ dàng can thiệp request HTTP để sửa giá từ `$49.99` thành `$0.01`. Do đó:
- Request tạo đơn hàng (`POST /api/v1/orders`) gửi từ client **CHỈ ĐƯỢC CHỨA**:
  - Danh sách ID sản phẩm / biến thể (`variantId`) và số lượng (`quantity`).
  - Thông tin địa chỉ nhận hàng và mã giảm giá (`couponCode`).
- **Backend bắt buộc phải**:
  1. Tự truy vấn giá gốc và giá biến thể từ CSDL (`prisma.productVariant.findUnique`).
  2. Tự tính tổng phụ (`subtotal = sum(item.price * item.quantity)`).
  3. Kiểm tra tính hợp lệ của coupon (thời hạn, số lần sử dụng còn lại, giá trị đơn hàng tối thiểu) và tính tiền giảm (`discount`).
  4. Tự tính phí vận chuyển theo cấu hình hệ thống (`shippingFee`) và thuế (`tax`).
  5. Tính tổng cuối cùng: `totalPrice = subtotal - discount + shippingFee + tax`.

### 3.2. Xác Thực Đơn Hàng PayPal Độc Lập (Server-to-Server PayPal Verification)
- Sau khi khách hàng hoàn tất thanh toán trên PayPal Popup, Backend **bắt buộc gọi trực tiếp PayPal REST API** (`https://api-m.paypal.com/v2/checkout/orders/{orderId}`) để xác thực:
  1. Trạng thái đơn hàng PayPal phải là `COMPLETED`.
  2. Đơn vị tiền tệ phải là `USD`.
  3. Số tiền khách hàng đã thanh toán trên PayPal (`gross_amount`) phải **KHỚP CHÍNH XÁC ĐẾN TỪNG CENT** với `totalPrice` mà Backend vừa tính toán.
- **Chống Tấn Công Phát Lại Giao Dịch (Replay Attack Prevention)**:
  - Lưu mã giao dịch PayPal (`paymentTransactionId`) với chỉ mục `UNIQUE` trong CSDL.
  - Nếu một mã PayPal Order ID đã từng được ghi nhận cho một đơn hàng trước đó, lập tức từ chối và cảnh báo gian lận.

### 3.3. Bảo Vệ Uy Tín & Đánh Giá Sản Phẩm (Verified Reviews Only)
- Chặn đứng spam đánh giá giả mạo: Chỉ cho phép người dùng gửi đánh giá sản phẩm (`POST /api/v1/products/:id/reviews`) khi:
  1. Người dùng đã đăng nhập tài khoản hợp lệ.
  2. Người dùng thực sự có ít nhất một đơn hàng đã giao thành công (`status === 'DELIVERED'`) có chứa sản phẩm đó.
  3. Mỗi tài khoản chỉ được đánh giá tối đa 1 lần trên mỗi sản phẩm; điểm số hợp lệ từ 1 đến 5 sao.

---

## 🛡️ PHẦN 4: Phân Quyền Kiểm Soát Truy Cập (RBAC & Route Protection)

### 4.1. Ma Trận Phân Quyền Vai Trò (Role-Based Access Control Matrix)

| Quyền hạn / Nghiệp vụ | Khách hàng (`CUSTOMER`) | Nhân viên giao hàng (`SHIPPER`) | Quản trị viên (`ADMIN`) | Quản trị cấp cao (`SUPER_ADMIN`) |
|---|:---:|:---:|:---:|:---:|
| Xem & Đặt hàng trên Storefront | ✅ | ✅ | ✅ | ✅ |
| Xem đơn hàng cần giao | Chỉ đơn của mình | ✅ Tất cả đơn | ✅ | ✅ |
| Cập nhật trạng thái vận chuyển | ❌ | ✅ (`SHIPPED`/`DELIVERED`) | ✅ | ✅ |
| **Xem dữ liệu tài chính (Doanh thu, giá vốn, biên lãi)** | ❌ | ❌ **BỊ ẨN TOÀN BỘ** | ✅ | ✅ |
| Quản lý Hàng hóa (Sản phẩm, Biến thể, Danh mục) | ❌ | ❌ | ✅ | ✅ |
| Quản lý Tiếp thị (Coupon, Banner, Chữ chạy Marquee) | ❌ | ❌ | ✅ | ✅ |
| Quản lý Cài đặt hệ thống & Cấp phát Admin API Key | ❌ | ❌ | ❌ | ✅ |

### 4.2. Bảo Vệ Tuyệt Đối Tất Cả Các Admin Endpoints
Mọi route thay đổi cấu hình hoặc đọc dữ liệu quản trị (`/api/v1/admin/*`, `/coupons/admin/*`, `/banners/admin/*`, `/announcements/admin/*`, `/settings/admin/*`) **BẮT BUỘC PHẢI CÓ** middleware xác thực `authenticateAdmin`. Tuyệt đối không để lộ bất kỳ route quản trị công khai nào ra internet.

### 4.3. Ẩn Dữ Liệu Tài Chính Với Shipper
Khi nhân viên giao nhận (`SHIPPER`) truy vấn danh sách đơn hàng hoặc chi tiết đơn hàng:
- Service Backend phải tự động lọc bỏ (strip/mask) các trường tài chính:
  `subtotal = undefined`, `discount = undefined`, `tax = undefined`, `totalPrice = undefined`, `item.price = undefined`.
- Shipper chỉ được thấy: Tên khách hàng, địa chỉ giao hàng, số điện thoại, mã vận đơn, danh sách mặt hàng cần lấy (Tên áo, size, màu, số lượng).

---

## 💻 PHẦN 5: Quy Chuẩn Kỹ Thuật Lập Trình An Toàn (Secure Coding Standards)

### 5.1. Kiểm Thao Dữ Liệu Đầu Vào (Input Validation với Zod)
Mọi request nhận dữ liệu từ bên ngoài (Body, Query, Params) phải được kiểm tra kiểu dữ liệu và định dạng nghiêm ngặt qua Zod schema:

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(5000).optional(),
  basePrice: z.number().positive().max(10000),
  categoryId: z.string().uuid(),
});

// Trong Controller:
const validatedData = CreateProductSchema.parse(req.body);
```

### 5.2. Chống SQL Injection & Parameter Tampering
- 100% các câu truy vấn cơ sở dữ liệu phải được thực thi thông qua **Prisma Client ORM** với Parameterized Query tự động.
- **CẤM TUYỆT ĐỐI**: Dùng chuỗi thô nối trực tiếp vào `$queryRawUnsafe`:
  ```typescript
  // ❌ NGUY HIỂM CHẾT NGƯỜI: Dễ dính SQL Injection
  await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${req.body.email}'`);

  // ✅ ĐÚNG: Prisma Parameterized ORM
  await prisma.user.findUnique({ where: { email: req.body.email } });
  ```

### 5.3. Phòng Chống Tấn Công Từ Chối Dịch Vụ (Rate Limiting & Anti-DoS)
Áp dụng giới hạn tần suất truy cập phân tầng:
1. **API Public chung**: Tối đa 500 requests / 15 phút.
2. **Đăng nhập (`/auth/login`, `/admin/login`)**: Tối đa 10 requests / 15 phút (chống Brute-force mật khẩu).
3. **Yêu cầu mã OTP (`/otp/send`)**: Tối đa 8 requests / 60 phút (chống cạn kiệt ngân sách SMS/Email và spam OTP).
4. **Tạo đơn hàng (`/orders`)**: Tối đa 20 requests / 60 phút.
5. **Upload file hình ảnh**: Tối đa 30 requests / 15 phút.
6. **Socket.IO Real-time chat**: Tối đa 30 kết nối / phút cho mỗi địa chỉ IP.

### 5.4. Kiểm Tra Tải File Ảnh An Toàn (File Upload Verification)
Khi nhận file ảnh từ người dùng:
1. **Kiểm tra Magic Bytes (Header nhị phân thực tế của file)**, không chỉ tin vào đuôi mở rộng file (`.png`, `.jpg`):
   - JPEG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A`
   - WEBP: `RIFF .... WEBP`
   - GIF: `47 49 46 38`
2. **Giới hạn kích thước tối đa**: Không vượt quá 8MB.
3. **Môi trường Production**: Bắt buộc lưu trữ trên Cloudflare Images / Cloudinary có CDN an toàn; cấm lưu trữ chuỗi Base64 dung lượng lớn vào CSDL.

### 5.5. Phòng Chống CSRF & Cấu Hình CORS Nghiêm Ngặt
- **CORS Whitelist**: Chỉ cho phép các domain chính thức trong `ALLOWED_ORIGINS` kết nối. Không sử dụng wildcard `*` trên các endpoint có đính kèm cookie xác thực.
- **Chống CSRF**: Mọi request làm thay đổi trạng thái (`POST`, `PUT`, `PATCH`, `DELETE`) nếu có gửi cookie xác thực phiên (`velora_access_token`, `velora_admin_access_token`) bắt buộc phải có header `Origin` hoặc `Referer` khớp với danh sách domain hợp lệ của hệ thống.

### 5.6. Xử Lý Lỗi An Toàn (Sanitized Error Responses)
- Không bao giờ trả về nguyên vẹn lỗi nội bộ từ Prisma (`P2002`, `P2025`), câu lệnh SQL, hoặc Stack Trace ra ngoài HTTP Response cho client.
- Bắt buộc sử dụng helper `sendError` để chuyển đổi sang thông báo an toàn, đồng thời ghi log chi tiết vào file nội bộ server:
  ```typescript
  import { sendError } from "@/utils/error.util";

  try {
    // Business logic
  } catch (error: any) {
    sendError(res, error, "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.");
  }
  ```

---

## 📋 PHẦN 6: Bảng Kiểm Tra An Ninh (Security Verification Checklist)

Trước khi đẩy bất kỳ tính năng nào lên môi trường Staging/Production, bắt buộc rà soát danh sách sau:

- [ ] **Bảo mật Secret**:
  - [ ] Không có API Key, Secret, Token nào bị hardcode trong mã nguồn.
  - [ ] Không có biến secret nào bị gán nhầm tiền tố `NEXT_PUBLIC_`.
  - [ ] File `.env` đã được liệt kê trong `.gitignore`.
- [ ] **Bảo mật Khách hàng**:
  - [ ] Dữ liệu địa chỉ, số điện thoại PII đã được mã hóa AES-256-GCM.
  - [ ] Không lưu PII trong `localStorage` / `sessionStorage`.
  - [ ] Thông báo đăng nhập/quên mật khẩu không làm lộ sự tồn tại của email.
  - [ ] Không in OTP hay mật khẩu ra console log.
- [ ] **Bảo mật Đơn hàng & Giá**:
  - [ ] 100% giá tiền và tổng đơn do Backend tính toán từ CSDL.
  - [ ] Giao dịch PayPal được xác thực trực tiếp qua PayPal REST API.
  - [ ] `paymentTransactionId` được lưu với ràng buộc UNIQUE chống replay attack.
- [ ] **Bảo mật Phân quyền**:
  - [ ] Tất cả các API quản trị (`/admin/*`) đều có middleware `authenticateAdmin`.
  - [ ] Shipper không thể xem các trường tài chính (doanh thu, giá tiền).
- [ ] **Kiểm tra Kỹ thuật**:
  - [ ] Request payload được validate chặt chẽ qua Zod.
  - [ ] Toàn bộ truy vấn dùng Prisma ORM, không ghép chuỗi SQL thô.
  - [ ] Upload file có kiểm tra Magic Bytes và giới hạn kích thước.
  - [ ] `npx tsc --noEmit` đạt exit code 0 trên cả 3 dự án (`sales-website-be`, `sales-website-fe`, `sales-website-admin`).
