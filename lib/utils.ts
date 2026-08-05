import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus } from "@/types/order";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PLACED":
      return { label: "Đã đặt (Placed)", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    case "PRINTING":
      return { label: "Đang in POD (Printing)", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    case "SHIPPED":
      return { label: "Đã gửi hàng (Shipped)", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
    case "DELIVERED":
      return { label: "Đã giao (Delivered)", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
    case "CANCELLED":
      return { label: "Đã hủy (Cancelled)", bg: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
    default:
      return { label: status, bg: "bg-gray-500/10 text-gray-400 border-gray-500/30" };
  }
}
