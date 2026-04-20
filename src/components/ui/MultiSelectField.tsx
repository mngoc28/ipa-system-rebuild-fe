import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Standard option structure for the MultiSelectField component.
 */
interface Option {
    label: string;
    value: string;
}

/**
 * Props for the MultiSelectField component.
 */
interface MultiSelectFieldProps {
    id?: string;
    name?: string;
    values: string[];
    onValuesChange: (values: string[]) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
    disabled?: boolean;
}

/**
 * A robust multi-select dropdown supporting searching and tag-based visualization 
 * of selected items.
 */
export function MultiSelectField({
  id,
  name,
  values,
  onValuesChange,
  options,
  placeholder = "Select options...",
  className,
  triggerClassName,
  disabled = false,
}: MultiSelectFieldProps) {
  const [search, setSearch] = React.useState("");

  const handleSelect = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter((v) => v !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };

  const selectedOptions = options.filter((option) => values.includes(option.value));
  const filteredOptions = options.filter((option) => 
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("w-full", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            id={id}
            name={name}
            disabled={disabled}
            className={cn(
              "flex min-h-[48px] w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
              triggerClassName
            )}
          >
            <div className="flex flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {option.label}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                    />
                  </Badge>
                ))
              ) : (
                <span className="font-medium text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto p-2" align="start">
          <div className="mb-2 px-1">
            <input
              type="text"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={values.includes(option.value)}
                  onCheckedChange={() => handleSelect(option.value)}
                  onSelect={(e) => e.preventDefault()}
                  className="py-2.5 font-medium"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
