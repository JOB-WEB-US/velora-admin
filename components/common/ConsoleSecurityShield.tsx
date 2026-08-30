"use client";

import { useEffect } from "react";

export default function ConsoleSecurityShield() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || typeof window !== "undefined") {
      const warningTitle = "color: #ef4444; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);";
      const warningSub = "color: #f59e0b; font-size: 14px; font-weight: 700; line-height: 1.6;";
      const warningText = "color: #3b82f6; font-size: 12px; font-weight: 600;";

      console.log("%c🛑 DỪNG LẠI! CẢNH BÁO BẢO MẬT 🛑", warningTitle);
      console.log(
        "%c⚠️ ĐÂY LÀ TÍNH NĂNG DÀNH CHO NHÀ PHÁT TRIỂN HỆ THỐNG VELORA ADMIN.",
        warningSub
      );
      console.log(
        "%cTuyệt đối KHÔNG copy/paste bất kỳ đoạn mã JavaScript nào từ người lạ vào cửa sổ Console này!\nNếu bạn làm theo hướng dẫn của ai đó nhập lệnh ở đây, tài khoản và khóa bí mật API Key của bạn có thể bị đánh cắp.",
        warningText
      );
    }
  }, []);

  return null;
}
