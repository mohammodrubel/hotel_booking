import * as React from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: (n: number) => string;
  delta?: { label: string; positive?: boolean };
  className?: string;
  loading?: boolean;
}

export function KpiCard({ label, value, icon: Icon, format, delta, className, loading }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-accent transition-transform group-hover:rotate-6">
          <Icon className="size-4" />
        </div>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-1/2 animate-pulse rounded-md bg-foreground/8" />
      ) : (
        <p className="mt-3 text-display text-3xl font-semibold tracking-tight text-foreground">
          <AnimatedCounter
            value={value}
            format={(n) => (format ? format(n) : new Intl.NumberFormat("en-US").format(n))}
          />
        </p>
      )}
      {delta && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            delta.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          )}
        >
          {delta.label}
        </p>
      )}
    </motion.div>
  );
}
