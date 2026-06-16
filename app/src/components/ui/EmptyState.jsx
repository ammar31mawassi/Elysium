import React from "react";

export default function EmptyState({ emoji, icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 text-2xl">
        {Icon ? <Icon className="w-6 h-6" /> : emoji}
      </div>
      <h3 className="font-semibold text-foreground text-base mb-1">{title}</h3>
      {message && <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
