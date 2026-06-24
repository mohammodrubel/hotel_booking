"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartPoint[];
  format?: (v: number) => string;
  className?: string;
  highlightLast?: boolean;
  height?: number;
}

export function BarChart({
  data,
  format,
  className,
  highlightLast = true,
  height = 220,
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div
      className={cn("grid items-end gap-3", className)}
      style={{
        gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        height,
      }}
    >
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex h-full flex-col items-center justify-end gap-2">
            {format && (
              <p className="text-[10px] font-semibold text-muted-foreground">
                {format(d.value)}
              </p>
            )}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "w-full rounded-t-xl",
                highlightLast && i === data.length - 1 ? "bg-foreground" : "bg-accent/70"
              )}
            />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {d.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

interface SparkLineProps {
  data: number[];
  className?: string;
  height?: number;
  stroke?: string;
}

export function Sparkline({ data, className, height = 60, stroke = "currentColor" }: SparkLineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

interface DonutProps {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  className?: string;
}

export function Donut({ segments, size = 140, thickness = 22, className }: DonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cum = 0;
  return (
    <svg className={cn("", className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        className="stroke-secondary"
      />
      {segments.map((seg, i) => {
        const length = total > 0 ? (seg.value / total) * circumference : 0;
        const offset = total > 0 ? (cum / total) * circumference : 0;
        cum += seg.value;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            stroke={seg.color}
            strokeDasharray={`${length} ${circumference}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
