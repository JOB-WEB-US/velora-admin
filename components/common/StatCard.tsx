import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "positive",
  subtitle,
}: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-sm hover:shadow-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-baseline gap-2.5">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-0.5 rounded-full border",
              changeType === "positive" && "bg-emerald-50 text-emerald-700 border-emerald-200",
              changeType === "negative" && "bg-rose-50 text-rose-700 border-rose-200",
              changeType === "neutral" && "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
}
