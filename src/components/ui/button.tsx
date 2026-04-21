import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded transition-colors 
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
  disabled:pointer-events-none disabled:opacity-50 
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:opacity-90",
        secondary: "border border-brand-dark/20 text-brand-text-dark/60 hover:bg-brand-dark/5 hover:text-brand-text-dark",
        destructive: "bg-destructive text-white hover:opacity-90",
        outline: "border border-brand-dark/10 bg-white text-brand-text-dark hover:bg-brand-dark/5",
        ghost: "text-brand-text-dark hover:bg-brand-dark/5",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground shadow-sm hover:opacity-90",
        none: "",
      },
      size: {
        default: "h-12 px-6 py-3 text-base font-bold",
        xs: "h-7 px-3 py-1.5 text-xs font-bold",
        sm: "h-9 px-4 py-2 text-sm font-bold",
        lg: "h-11 rounded-md px-8",
        icon: "size-9 hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
