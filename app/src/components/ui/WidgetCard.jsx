import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WidgetCard({
  as: Component = "section",
  children,
  className = "",
  interactive = false,
  delay = 0,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const MotionComponent = typeof Component === "string" ? motion[Component] || motion.div : motion(Component);

  return (
    <MotionComponent
      className={cn(
        "app-widget-card rounded-lg border border-border bg-card p-4 shadow-sm",
        interactive && "app-widget-card-interactive",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion || !interactive ? undefined : { y: -3, scale: 1.005 }}
      whileTap={reduceMotion || !interactive ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
