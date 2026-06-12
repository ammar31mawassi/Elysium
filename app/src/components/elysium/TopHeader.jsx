import React from "react";

export default function TopHeader({ title, subtitle, right }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <div>
            <span className="text-teal font-bold text-base tracking-tight leading-none">ELYSIUM</span>
            {subtitle && <p className="text-xs text-slate leading-none mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  );
}