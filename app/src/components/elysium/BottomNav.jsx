import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { path: "/", label: "Home", icon: Home },
  { path: "/guides", label: "Guides", icon: BookOpen },
  { path: "/people", label: "People", icon: Users },
  { path: "/planner", label: "Planner", icon: Calendar },
  { path: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                active ? "bg-teal text-white scale-110" : "text-slate"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-teal" : "text-slate"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}