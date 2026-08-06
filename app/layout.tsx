import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ConsoleSecurityShield from "@/components/common/ConsoleSecurityShield";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velora Admin Portal - POD & Product Management",
  description: "Web Admin Portal for Velora Store E-commerce & POD Order Lifecycle Management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="light">
      <body className={inter.className}>
        <ConsoleSecurityShield />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
