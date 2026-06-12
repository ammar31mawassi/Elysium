import React from "react";
import { CATEGORY_CONFIG } from "@/lib/elysium";
import { cn } from "@/lib/utils";

export default function CategoryBadge({ category, size = "sm" }) {
  const config = CATEGORY_CONFIG[category] || { color: "bg-gray-50 text-gray-600 border-gray-200", emoji: "📖" };
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      config.color,
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
    )}>
      <span>{config.emoji}</span>
      {category}
    </span>
  );
}