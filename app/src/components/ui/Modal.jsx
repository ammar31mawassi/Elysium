import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-0 backdrop-blur-md dark:bg-black/70 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border/80 bg-card text-card-foreground shadow-2xl ring-1 ring-foreground/5 sm:max-w-md sm:rounded-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-card/95 px-5 pb-4 pt-5 backdrop-blur-xl">
          <h2 id="app-modal-title" className="text-base font-bold tracking-tight text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-muted/80 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}
