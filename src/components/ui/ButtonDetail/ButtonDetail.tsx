import * as React from "react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the ButtonDetail component.
 */
interface ButtonDetailProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    variant?: "default" | "outline";
}

/**
 * A specialized action button typically used in detail views or list actions.
 * Features consistent primary-color styling with outline and default variants.
 */
const ButtonDetail = forwardRef<HTMLButtonElement, ButtonDetailProps>(
  ({ className, variant = "outline", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-bold transition-colors",
          variant === "outline" 
            ? "border-blue-600 text-blue-600 hover:bg-blue-50" 
            : "border-transparent bg-blue-600 text-white hover:bg-blue-700",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonDetail.displayName = "ButtonDetail";
export default ButtonDetail;
