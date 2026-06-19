import React from "react";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import ElyAssistant from "@/components/elysium/ElyAssistant";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { cn } from "@/lib/utils";

export default function PageLayout({ children, className = "", wide = false, showEly = true }) {
  return (
    <div className="app-shell min-h-screen min-w-0 max-w-full overflow-x-clip bg-background">
      <AppHeader />
      <main className={cn("relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pb-10", wide ? "lg:max-w-6xl" : "lg:max-w-4xl", className)}>
        <AnimatedPage>
          {children}
        </AnimatedPage>
      </main>
      {showEly && <ElyAssistant />}
      <BottomNav />
    </div>
  );
}
