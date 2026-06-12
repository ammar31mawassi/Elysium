import React from "react";
import { useTheme } from "@/lib/ThemeContext";

const LIGHT_LOGO = 'https://media.base44.com/images/public/6a2ae3a92ace0dad0f92f1a6/53d499866_Logo_LightTheme_Teal.png';
const DARK_LOGO = 'https://media.base44.com/images/public/6a2ae3a92ace0dad0f92f1a6/6ce11ed8d_Logo_DarkTheme.png';

export default function ElysiumLogo({ size = 40, className = "" }) {
  const { isDark } = useTheme();
  return (
    <img
      src={isDark ? DARK_LOGO : LIGHT_LOGO}
      alt="Elysium"
      style={{ height: size, width: 'auto' }}
      className={className}
    />
  );
}