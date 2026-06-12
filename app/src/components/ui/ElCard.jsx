import React from "react";
import { cn } from "@/lib/utils";

export default function ElCard({ children, className = "", onClick, ...props }) {
  const base = "bg-card text-card-foreground rounded-lg border border-border shadow-sm";
  if (onClick) {
    return (
      <button onClick={onClick} className={cn(base, "w-full text-left hover:shadow-md transition-shadow duration-200", className)} {...props}>
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
