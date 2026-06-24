import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border bg-card p-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-accent">
          {icon}
        </div>
      )}
      <p className={cn("text-base font-semibold text-foreground", icon ? "mt-5" : "")}>
        {title}
      </p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
