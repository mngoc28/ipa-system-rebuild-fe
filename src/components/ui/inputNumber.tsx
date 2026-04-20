import * as React from "react";
import { ChangeEvent, useState } from "react";
import { PropsInput } from "../type.ts";

/**
 * A numeric input component that automatically formats values with thousands separators (en-US).
 * Displays raw numbers while focused and formatted strings while blurred.
 * 
 * @param props - Component props following PropsInput interface.
 */
export default function InputNumber({ value, onChange, placeholder, ...props }: PropsInput) {
  const [isFocused, setIsFocused] = useState(false);

  const formatNumber = (val: string | number | readonly string[] | null | undefined) => {
    if (val === undefined || val === null || val === "") return "";
    const str = val.toString();
    const cleaned = str.replace(/,/g, "");
    if (!/^\d+$/.test(cleaned)) return cleaned;
    return Number(cleaned).toLocaleString("en-US");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");

    if (raw === "") {
      onChange?.("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;

    onChange?.(raw);
  };

  const displayValue = isFocused ? value : formatNumber(value);

  return (
    <input
      type="text"
      value={displayValue || ""}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 transition-colors placeholder:text-muted-foreground focus-visible:border-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      {...props}
    />
  );
}
