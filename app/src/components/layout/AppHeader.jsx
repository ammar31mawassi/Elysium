import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Compass, Home, Moon, Sun, UserRound, Wrench } from "lucide-react";
import { useProfile } from "@/lib/useProfile";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";
import ElysiumMark from "@/components/elysium/ElysiumMark";
import CreateActionMenu from "@/components/elysium/CreateActionMenu";
import { cn } from "@/lib/utils";

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "S";
}

export default function AppHeader() {
  const { pathname } = useLocation();
  const { user } = useProfile();
  const { isDark, preference, setTheme } = useTheme();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const toggleTheme = () => setTheme(preference === "system" ? (isDark ? "light" : "dark") : (preference === "dark" ? "light" : "dark"));
  const nav = [
    ["/", t("nav_home"), Home],
    ["/discover", t("nav_discover"), Compass],
    ["/calendar", t("nav_calendar"), CalendarDays],
    ["/me", t("nav_me"), UserRound],
    ["/tools", t("nav_tools"), Wrench],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/84 shadow-[0_1px_0_hsl(var(--border)/0.35)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Elysium home">
          <ElysiumMark size={38} className="shrink-0" />
          <span className="hidden text-sm font-extrabold tracking-[0.16em] text-foreground sm:inline">ELYSIUM</span>
        </Link>

        <nav className="mx-auto hidden h-full items-center gap-1 md:flex" aria-label="Primary navigation">
          {nav.map(([path, label, Icon]) => {
            const active = path === "/" ? pathname === "/" : path === "/tools" ? pathname.startsWith(path) || pathname.startsWith("/flashcards") : pathname.startsWith(path);
            return (
              <Link key={path} to={path} className={cn(
                "relative flex h-10 items-center gap-2 overflow-hidden rounded-md px-3 text-sm font-semibold",
                active ? "text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}>
                {active && (
                  <motion.span
                    layoutId="app-header-active"
                    className="pointer-events-none absolute inset-0 rounded-md bg-primary/10"
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          <CreateActionMenu className="hidden md:flex" compact />
          <button onClick={toggleTheme} className="flex h-11 w-11 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground hover:shadow-sm active:scale-[0.98]" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/profile" className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary shadow-sm hover:border-primary/35 hover:bg-primary/15 active:scale-[0.98]" aria-label={t("nav_profile")}>
            {getInitials(user?.full_name)}
          </Link>
        </div>
      </div>
    </header>
  );
}
