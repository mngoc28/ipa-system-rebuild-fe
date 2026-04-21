"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/dateUtils"

/**
 * Props for the DatePicker component.
 */
interface DatePickerProps {
    date?: string | Date
    setDate: (date: string) => void
    placeholder?: string
    className?: string
    id?: string
    name?: string
}

/**
 * A user-friendly date selection component combining a button trigger 
 * with a calendar popover.
 * 
 * @param props - Component props following DatePickerProps interface.
 */
export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date...",
  className,
  id,
  name
}: DatePickerProps) {
  // Convert string to Date for react-day-picker
  const selectedDate = React.useMemo(() => {
    if (!date) return undefined
    if (date instanceof Date) return date
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : undefined
  }, [date])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "h-auto w-full justify-start rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] px-4 py-3 text-left font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5",
            !date && "text-brand-text-dark/40",
            className
          )}
        >
          <CalendarIcon className="mr-3 size-4 text-brand-text-dark/40" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
          <input type="hidden" name={name} value={date instanceof Date ? date.toISOString().split('T')[0] : date} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              // Store as YYYY-MM-DD for consistency with native inputs
              setDate(format(d, "yyyy-MM-dd"))
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
