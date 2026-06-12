import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpenCheck, CalendarDays, Compass, Flag, Home, Plus, Sparkles, Users, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const [showAdd, setShowAdd] = useState(false);
  const nav = [
    { path: "/", label: t("nav_home"), icon: Home },
    { path: "/discover", label: t("nav_discover"), icon: Compass },
    null,
    { path: "/calendar", label: t("nav_calendar"), icon: CalendarDays },
    { path: "/tools", label: t("nav_tools"), icon: Wrench },
  ];
  const actions = [
    { label: p("create_social"), icon: Users, path: "/social?create=1" },
    { label: p("create_session"), icon: BookOpenCheck, path: "/groups?tab=sessions&create=session" },
    { label: p("add_deadline"), icon: Flag, path: "/calendar?create=1" },
    { label: p("ask_elysium"), icon: Sparkles, path: "/ask" },
  ];

  return (
    <>
      {showAdd && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label={t("nav_add")}>
          <button className="absolute inset-0 bg-black/55" onClick={() => setShowAdd(false)} aria-label={t("common_cancel")} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
              {actions.map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => { navigate(path); setShowAdd(false); }} className="flex min-h-24 flex-col items-start justify-between rounded-lg border border-border bg-card p-3 text-start hover:border-primary/40 hover:bg-primary/5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-[18px] w-[18px]" /></span>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdd(false)} className="mx-auto mt-3 flex h-10 w-full max-w-lg items-center justify-center gap-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" /> {t("common_cancel")}
            </button>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid h-[68px] max-w-lg grid-cols-5 items-end px-1">
          {nav.map((item, index) => {
            if (!item) return (
              <button key="add" onClick={() => setShowAdd(true)} className="flex h-16 flex-col items-center justify-center gap-1" aria-label={t("nav_add")}>
                <span className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg"><Plus className="h-5 w-5" /></span>
              </button>
            );
            const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold", active ? "text-primary" : "text-muted-foreground")}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
