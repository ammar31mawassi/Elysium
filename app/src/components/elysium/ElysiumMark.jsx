import React from "react";
import ElysiumLogo from "@/components/elysium/ElysiumLogo";

export default function ElysiumMark({ size = 40, className = "" }) {
  return <ElysiumLogo size={size} className={className} decorative />;
}
