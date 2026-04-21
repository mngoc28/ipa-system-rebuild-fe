import * as React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelectProps } from "@/components/type.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * A versatile searchable dropdown component.
 * Features a filterable list of options, loading state, and custom trigger/content styling.
 * Supports both manual selection and search-to-filter.
 * 
 * @param props - Component props following SearchableSelectProps interface.
 */
export default function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  searchPlaceholder,
  emptyMessage,
  className,
  disabled = false,
  loading = false,
  icon,
  showSearch = true,
  triggerClassName,
  contentClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    const searchLower = search.toLowerCase();
    return options.filter((option) =>
      option.label?.toLowerCase().includes(searchLower) ||
      option.value?.toString().toLowerCase().includes(searchLower) ||
      option.name_en?.toLowerCase().includes(searchLower)
    );
  }, [search, options]);

  useEffect(() => {
    if (open && searchInputRef.current && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, showSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-12 w-full items-center justify-between gap-2 rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-sm text-brand-text-dark placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20", 
            triggerClassName, 
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {icon && <span className="text-brand-text-dark/40">{icon}</span>}
            <span className={cn("flex-1 truncate text-left", selectedOption ? "font-medium text-brand-text-dark" : "font-normal text-brand-text-dark/50")}>
              {selectedOption ? selectedOption.label || selectedOption.name : placeholder}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className={cn("p-0 shadow-2xl border-brand-dark/10", contentClassName)} 
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        {showSearch && (
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-text-dark/40" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="h-10 px-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-dark/40"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto py-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-brand-text-dark/40">{emptyMessage}</div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const nextValue = value === option.value ? "" : option.value;
                    onValueChange(nextValue);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-brand-dark/5", 
                    value === option.value && "bg-brand-dark/5 text-primary font-bold"
                  )}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  <span>{option.label || option.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

