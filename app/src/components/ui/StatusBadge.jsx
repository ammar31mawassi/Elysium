import React from "react";
import { cn } from "@/lib/utils";

const tones = {
  default: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default function StatusBadge({ tone = "default", className = "", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none", tones[tone] || tones.default, className)}>
      {children}
    </span>
  );
}
