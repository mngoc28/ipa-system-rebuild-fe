import * as React from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusType = "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: StatusType | string;
  children?: ReactNode;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Từ chối", color: "bg-rose-100 text-rose-700 border-rose-200" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Hoàn thành", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  cancelled: { label: "Đã hủy", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { label: status, color: "bg-slate-100 text-slate-700 border-slate-200" };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
      config.color,
      className
    )}>
      {children || config.label}
    </span>
  );
}
