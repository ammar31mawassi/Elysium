import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function EmptyState({ emoji = "•", title, message, action }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-2xl text-primary shadow-sm">{emoji}</div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
