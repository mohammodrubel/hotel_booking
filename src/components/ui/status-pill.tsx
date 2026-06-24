import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  // status
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  live: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-foreground text-background",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",

  pending: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  checked_in: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  upcoming: "bg-secondary text-foreground",
  open: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  flagged: "bg-amber-400/15 text-amber-700 dark:text-amber-300",

  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  suspended: "bg-destructive/10 text-destructive",
  refunded: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  archived: "bg-muted text-muted-foreground",
  hidden: "bg-muted text-muted-foreground",
  maintenance: "bg-amber-400/15 text-amber-700 dark:text-amber-300",

  // priority
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  medium: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  low: "bg-secondary text-foreground",
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  const tone = TONES[value] ?? "bg-secondary text-foreground";
  const label = value.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        tone,
        className
      )}
    >
      {label}
    </span>
  );
}
