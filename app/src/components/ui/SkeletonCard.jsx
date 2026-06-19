import React from "react";

export default function SkeletonCard({ lines = 2, className = "" }) {
  return (
    <div className={`rounded-lg border border-border bg-card/85 p-4 shadow-sm shadow-black/[0.03] ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`mb-2 h-3 animate-pulse rounded-full bg-muted ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
      ))}
    </div>
  );
}
