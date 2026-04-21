import * as React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Standard option structure for the SelectField component.
 */
interface Option {
    label: string;
    value: string;
}

/**
 * Props for the SelectField component.
 */
interface SelectFieldProps {
    id?: string;
    name?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
    disabled?: boolean;
}

/**
 * A customized wrapper around shadcn/ui Select component with consistent 
 * premium styling (rounded corners, bold fonts, soft shadows).
 */
export function SelectField({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Select an option...",
  className,
  triggerClassName,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger 
          id={id}
          name={name}
          className={cn(
            "h-auto w-full rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] px-5 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-brand-dark/10 shadow-xl">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="py-3 font-bold transition-colors focus:bg-primary/5 focus:text-primary"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
