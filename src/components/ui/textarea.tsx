import { forwardRef, TextareaHTMLAttributes } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
type PlainTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { 
  disableResize?: boolean;
  hasError?: boolean;
};
const PlainTextarea = forwardRef<HTMLTextAreaElement, PlainTextareaProps>(({ className, disableResize = false, hasError, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-base text-brand-text-dark",
      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
      "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      disableResize ? "resize-none" : "resize-y",
      hasError && "border-destructive ring-destructive/20 focus-visible:ring-destructive",
      className,
    )}
    {...props}
  />
));
PlainTextarea.displayName = "PlainTextarea";
export { PlainTextarea };
