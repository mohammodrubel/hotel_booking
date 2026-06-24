"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 relative",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center gap-1 absolute inset-x-1 top-1 justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-medium text-[0.72rem] uppercase tracking-wider",
        week: "flex w-full mt-1.5",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal rounded-lg aria-selected:opacity-100 hover:bg-secondary hover:text-foreground"
        ),
        range_start:
          "rounded-l-lg bg-foreground text-background hover:bg-foreground/90 [&>button]:!bg-foreground [&>button]:!text-background",
        range_end:
          "rounded-r-lg bg-foreground text-background hover:bg-foreground/90 [&>button]:!bg-foreground [&>button]:!text-background",
        range_middle:
          "bg-accent/15 text-foreground [&>button]:!bg-transparent [&>button]:!text-foreground rounded-none",
        selected:
          "rounded-lg [&>button]:!bg-foreground [&>button]:!text-background hover:[&>button]:!bg-foreground/90",
        today: "[&>button]:ring-1 [&>button]:ring-accent [&>button]:font-semibold",
        outside:
          "text-muted-foreground/40 aria-selected:bg-accent/10 aria-selected:text-muted-foreground aria-selected:opacity-50",
        disabled: "opacity-40 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) => {
          if (orientation === "left")
            return <ChevronLeft className="size-4" {...rest} />;
          return <ChevronRight className="size-4" {...rest} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
