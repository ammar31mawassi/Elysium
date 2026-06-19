import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function EmptyState({ emoji, icon: Icon, title, message, action }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-2xl text-primary shadow-sm">
        {Icon ? <Icon className="w-6 h-6" /> : emoji}
      </div>
      <h3 className="mb-1 text-base font-bold text-foreground">{title}</h3>
      {message && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
