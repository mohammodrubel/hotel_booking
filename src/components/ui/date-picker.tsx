"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function fromIso(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
}

function toIso(date: Date): string {
  // YYYY-MM-DD, no TZ shift
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
  align?: "start" | "center" | "end";
  format?: string;
  variant?: "default" | "ghost";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  buttonClassName,
  minDate,
  maxDate,
  id,
  align = "start",
  format: fmt = "MMM d, yyyy",
  variant = "default",
}: DatePickerProps) {
  const selected = fromIso(value);
  const [open, setOpen] = React.useState(false);
  const disabled: Matcher[] = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        className={cn(
          "group inline-flex w-full items-center gap-2 rounded-xl text-left text-sm outline-none transition-colors",
          variant === "default" &&
            "h-11 border border-input bg-transparent px-3 hover:bg-secondary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "ghost" &&
            "h-7 border-0 bg-transparent px-0 hover:text-foreground",
          buttonClassName,
          className
        )}
      >
        <CalendarIcon
          className={cn(
            "size-4 shrink-0 transition-colors",
            selected ? "text-accent" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "truncate",
            selected ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {selected ? format(selected, fmt) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align={align} className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            if (d) {
              onChange(toIso(d));
              setOpen(false);
            }
          }}
          disabled={disabled.length ? disabled : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckIn: (iso: string) => void;
  onCheckOut: (iso: string) => void;
  variant?: "default" | "ghost";
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckIn,
  onCheckOut,
}: DateRangePickerProps) {
  return (
    <>
      <DatePicker value={checkIn} onChange={onCheckIn} placeholder="Check in" />
      <DatePicker
        value={checkOut}
        onChange={onCheckOut}
        placeholder="Check out"
        minDate={fromIso(checkIn)}
      />
    </>
  );
}
