import React from "react";

export default function EmptyState({ emoji = "🌿", title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-charcoal mb-1">{title}</h3>
      <p className="text-slate text-sm max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}