import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="bg-card text-card-foreground w-full sm:max-w-md rounded-t-2xl sm:rounded-lg border border-border max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card flex items-center justify-between px-5 pt-5 pb-4 border-b border-border z-10">
          <h2 className="font-bold text-foreground text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
