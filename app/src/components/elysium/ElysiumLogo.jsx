import React from "react";
import { useTheme } from "@/lib/ThemeContext";
import lightLogo from "@/assets/elysium-logo-light.png";
import darkLogo from "@/assets/elysium-logo-dark.png";

export default function ElysiumLogo({ size = 40, className = "", decorative = false }) {
  const { isDark } = useTheme();
  return (
    <img
      src={isDark ? darkLogo : lightLogo}
      alt={decorative ? "" : "Elysium"}
      aria-hidden={decorative ? "true" : undefined}
      style={{ height: size, width: "auto" }}
      className={className}
      decoding="async"
      draggable={false}
    />
  );
}
