import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SectionHeading({ title, eyebrow, description, action, to, className = "" }) {
  const actionContent = action && to ? (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
      {action}
      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
    </Link>
  ) : action ? (
    <span className="text-xs font-semibold text-primary">{action}</span>
  ) : null;

  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>}
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actionContent}
    </div>
  );
}
