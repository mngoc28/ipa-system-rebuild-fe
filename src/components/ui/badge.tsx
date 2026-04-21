import { HTMLAttributes } from "react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2", {
  variants: {
    variant: {
      default: "border-transparent bg-brand-dark text-white hover:bg-brand-dark/90",
      secondary: "border-transparent bg-brand-dark/5 text-brand-text-dark hover:bg-brand-dark/10",
      destructive: "border-transparent bg-destructive text-white hover:bg-destructive/90",
      outline: "border-brand-dark/20 bg-transparent text-brand-text-dark hover:bg-brand-dark/5",
      success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/90",
      warning: "border-transparent bg-amber-500 text-white hover:bg-amber-500/90",
      none: "",
    },
  },
  defaultVariants: { variant: "default" },
});
export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };
