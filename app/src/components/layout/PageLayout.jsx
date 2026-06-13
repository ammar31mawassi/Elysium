import React from "react";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import ElyAssistant from "@/components/elysium/ElyAssistant";
import { cn } from "@/lib/utils";

export default function PageLayout({ children, className = "", wide = false, showEly = true }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className={cn("mx-auto px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pb-10", wide ? "max-w-6xl" : "max-w-4xl", className)}>
        {children}
      </main>
      {showEly && <ElyAssistant />}
      <BottomNav />
    </div>
  );
}
