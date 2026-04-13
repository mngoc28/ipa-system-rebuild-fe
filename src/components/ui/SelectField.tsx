import * as React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder = "Chọn một tùy chọn...",
  className,
  triggerClassName,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger 
          className={cn(
            "h-auto w-full rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
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
