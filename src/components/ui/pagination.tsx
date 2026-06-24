"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  total?: number;
  limit?: number;
}

export function Pagination({ page, totalPages, onChange, className, total, limit }: PaginationProps) {
  if (totalPages <= 1) {
    return total != null && limit != null && total > 0 ? (
      <div className={cn("flex items-center justify-between text-xs text-muted-foreground", className)}>
        <span>
          Showing <span className="font-medium text-foreground">{total}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </span>
      </div>
    ) : null;
  }

  const pages = pageRange(page, totalPages);
  const start = total != null && limit != null ? Math.min((page - 1) * limit + 1, total) : null;
  const end = total != null && limit != null ? Math.min(page * limit, total) : null;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {start != null && (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{start}</span>–
          <span className="font-medium text-foreground">{end}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-2 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                p === page
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {p}
            </button>
          )
        )}
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function pageRange(current: number, total: number): Array<number | "..."> {
  const delta = 1;
  const range: Array<number | "..."> = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
}
