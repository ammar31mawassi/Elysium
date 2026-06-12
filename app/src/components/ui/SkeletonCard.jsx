import React from "react";

export default function SkeletonCard({ lines = 2, className = "" }) {
  return (
    <div className={`bg-card rounded-lg border border-border p-4 shadow-sm animate-pulse ${className}`}>
      <div className="h-4 bg-muted rounded-full w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-muted rounded-full mb-2 ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
      ))}
    </div>
  );
}
