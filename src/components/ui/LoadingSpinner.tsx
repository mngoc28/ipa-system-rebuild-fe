import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /** Optional CSS classes for the container. */
  className?: string;
  /** Diameter of the spinner in pixels. Defaults to 24. */
  size?: number;
  /** Optional text to display alongside the spinner. */
  label?: string;
  /** Unused variant property for future extensions. */
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
      {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
    </div>
  );
}
