import React from "react";
import { domainTones } from "@/lib/domainTones";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-card text-card-foreground shadow-sm",
  interactive: "bg-card text-card-foreground shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md",
  featured: "bg-card text-card-foreground shadow-md ring-1 ring-primary/10",
  subtle: "bg-muted/25 text-card-foreground shadow-none",
};

export default function ElCard({ children, className = "", onClick, variant = "default", tone, ...props }) {
  const toneClasses = tone ? domainTones[tone] : null;
  const base = cn(
    "rounded-lg border border-border",
    variants[variant] || variants.default,
    toneClasses?.border,
    variant === "featured" && toneClasses?.surface,
    toneClasses?.ring
  );
  if (onClick) {
    return (
      <button onClick={onClick} className={cn(base, "w-full text-left", className)} {...props}>
        {children}
      </button>
    );
  }
  return (
    <div className={cn(base, className)} {...props}>
      {children}
    </div>
  );
}
