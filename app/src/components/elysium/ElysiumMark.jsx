import React from "react";
import mark from "@/assets/elysium-mark.png";

export default function ElysiumMark({ size = 40, className = "" }) {
  return (
    <img
      src={mark}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={className}
      decoding="async"
      draggable={false}
    />
  );
}
