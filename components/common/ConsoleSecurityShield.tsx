"use client";

import { useEffect } from "react";

export default function ConsoleSecurityShield() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || typeof window !== "undefined") {
      const warningTitle = "color: #ef4444; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);";
      const warningSub = "color: #f59e0b; font-size: 14px; font-weight: 700; line-height: 1.6;";
      const warningText = "color: #3b82f6; font-size: 12px; font-weight: 600;";

      console.log("%c🛑 STOP! SECURITY WARNING / CẢNH BÁO BẢO MẬT 🛑", warningTitle);
      console.log(
        "%c⚠️ THIS IS A BROWSER FEATURE INTENDED FOR VELORA ADMIN DEVELOPERS ONLY.",
        warningSub
      );
      console.log(
        "%cDo NOT paste any code or run scripts here! Pasting unknown code can compromise your account, session tokens, and admin API credentials.\n" +
        "Tuyệt đối KHÔNG dán bất kỳ mã JavaScript nào vào Console này để bảo vệ tài khoản quản trị.",
        warningText
      );
    }
  }, []);

  return null;
}
