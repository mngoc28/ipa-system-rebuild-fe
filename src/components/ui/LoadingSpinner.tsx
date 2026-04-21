import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    label?: string;
    variant?: string;
}

/**
 * A centered loading indicator featuring a spinning Lucide icon and optional label.
 * 
 * @param props - Component props following LoadingSpinnerProps interface.
 */
export function LoadingSpinner({ className, size = 24, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {label && <span className="text-sm font-medium text-brand-text-dark/40">{label}</span>}
    </div>
  );
}
