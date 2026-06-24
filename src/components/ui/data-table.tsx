"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "right" | "center";
  className?: string;
  cell: (row: T, index: number) => React.ReactNode;
  sortAccessor?: keyof T;
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: Error | null;
  empty?: { title: string; description?: string; action?: React.ReactNode };
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string, order: "asc" | "desc") => void;
  className?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  empty,
  sortKey,
  sortOrder,
  onSort,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const grid = columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    const k = String(col.sortAccessor ?? col.key);
    if (sortKey === k) {
      onSort(k, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(k, "asc");
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      <div
        className="hidden gap-4 border-b border-border bg-secondary/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid"
        style={{ gridTemplateColumns: grid }}
      >
        {columns.map((c) => {
          const k = String(c.sortAccessor ?? c.key);
          const active = sortKey === k;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => handleSort(c)}
              className={cn(
                "flex items-center gap-1 text-left",
                c.align === "right" && "justify-end",
                c.align === "center" && "justify-center",
                c.sortable
                  ? "cursor-pointer transition-colors hover:text-foreground"
                  : "cursor-default",
                active && "text-foreground"
              )}
            >
              <span>{c.header}</span>
              {c.sortable && (
                <span className="inline-flex flex-col">
                  <ChevronUp
                    className={cn(
                      "size-3 -mb-1",
                      active && sortOrder === "asc" ? "text-foreground" : "text-muted-foreground/40"
                    )}
                  />
                  <ChevronDown
                    className={cn(
                      "size-3",
                      active && sortOrder === "desc" ? "text-foreground" : "text-muted-foreground/40"
                    )}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="p-12 text-center">
          <p className="text-sm font-semibold text-destructive">Could not load data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="hidden gap-4 px-5 py-4 sm:grid"
              style={{ gridTemplateColumns: grid }}
            >
              {columns.map((c) => (
                <Skeleton key={c.key} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={empty?.title ?? "No data"}
          description={empty?.description}
          action={empty?.action}
          className="border-0 bg-transparent"
        />
      ) : (
        <AnimatePresence mode="popLayout">
          {rows.map((row, i) => (
            <motion.div
              key={rowKey(row)}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.32,
                delay: Math.min(i * 0.025, 0.2),
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "grid grid-cols-1 gap-2 border-b border-border px-5 py-4 text-sm last:border-b-0 sm:gap-4 sm:items-center hover:bg-secondary/30",
                rowClassName?.(row)
              )}
              style={{
                gridTemplateColumns:
                  typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches
                    ? grid
                    : undefined,
              }}
            >
              {columns.map((c) => (
                <div
                  key={c.key}
                  className={cn(
                    "min-w-0",
                    c.align === "right" && "sm:text-right",
                    c.align === "center" && "sm:text-center",
                    c.className
                  )}
                >
                  {c.cell(row, i)}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
