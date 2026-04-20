import * as React from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusType = "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled";

/**
 * Props for the StatusBadge component.
 */
interface StatusBadgeProps {
  /** The symbolic status value. */
  status: StatusType | string;
  /** Optional override for the badge text. */
  children?: ReactNode;
  /** Additional styling classes. */
  className?: string;
}

/**
 * Internal configuration mapping status keys to display labels and Tailwind styles.
 */
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-200" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Completed", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

/**
 * A colorful badge component to visualize workflow statuses.
 * Automatically selects colors based on the status key.
 */
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
