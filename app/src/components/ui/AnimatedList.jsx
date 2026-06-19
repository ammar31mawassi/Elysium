import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnimatedList({ as: Component = "div", children, className = "", ...props }) {
  const reduceMotion = useReducedMotion();
  const MotionComponent = typeof Component === "string" ? motion[Component] || motion.div : motion(Component);

  return (
    <MotionComponent
      className={cn("min-w-0", className)}
      data-stagger-root={reduceMotion ? undefined : ""}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
