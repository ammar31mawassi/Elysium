import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Compass, Home, Moon, Plus, Sun, Wrench } from "lucide-react";
import { useProfile } from "@/lib/useProfile";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import ElysiumMark from "@/components/elysium/ElysiumMark";
import { cn } from "@/lib/utils";

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "S";
}

export default function AppHeader() {
  const { pathname } = useLocation();
  const { user } = useProfile();
  const { isDark, preference, setTheme } = useTheme();
  const { t, locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const toggleTheme = () => setTheme(preference === "system" ? (isDark ? "light" : "dark") : (preference === "dark" ? "light" : "dark"));
  const nav = [
    ["/", t("nav_home"), Home],
    ["/discover", t("nav_discover"), Compass],
    ["/calendar", t("nav_calendar"), CalendarDays],
    ["/tools", t("nav_tools"), Wrench],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Elysium home">
          <ElysiumMark size={38} className="shrink-0" />
          <span className="hidden text-sm font-extrabold tracking-[0.16em] text-foreground sm:inline">ELYSIUM</span>
        </Link>

        <nav className="mx-auto hidden h-full items-center gap-1 md:flex" aria-label="Primary navigation">
          {nav.map(([path, label, Icon]) => {
            const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
            return (
              <Link key={path} to={path} className={cn(
                "relative flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          <Link to="/social?create=1" className="featured-surface featured-action hidden h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold md:flex">
            <Plus className="h-4 w-4" />
            {p("create_social")}
          </Link>
          <button onClick={toggleTheme} className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/profile" className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary" aria-label={t("nav_profile")}>
            {getInitials(user?.full_name)}
          </Link>
        </div>
      </div>
    </header>
  );
}
