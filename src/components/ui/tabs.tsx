"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  count?: number;
}

interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

export function Tabs({ items, value, onChange, className, layoutId = "tabs-indicator" }: TabsProps) {
  return (
    <div
      className={cn(
        "relative flex flex-wrap gap-1 rounded-2xl bg-card p-1.5 ring-1 ring-foreground/10",
        className
      )}
    >
      {items.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-secondary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {t.label}
              {typeof t.count === "number" && (
                <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
                  {t.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
