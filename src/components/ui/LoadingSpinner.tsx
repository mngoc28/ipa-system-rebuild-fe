import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  label?: string;
  variant?: string;
}

export function LoadingSpinner({ className, size = 24, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
    </div>
  );
}
