import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
        "outline-none transition placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[88px]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
