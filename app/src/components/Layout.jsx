import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import {
  LayoutDashboard, BookOpen, Users, UsersRound, Calendar,
  User, Shield, Globe, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FeedbackButton from '@/components/FeedbackButton';

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'guides', path: '/guides', icon: BookOpen },
  { key: 'mentors', path: '/mentors', icon: Users },
  { key: 'studyGroups', path: '/study-groups', icon: UsersRound },
  { key: 'planner', path: '/planner', icon: Calendar },
  { key: 'profile', path: '/profile', icon: User },
];

function LanguageSwitcher() {
  const { lang, setLang, languages } = useLanguage();
  return (
    <div className="flex gap-1 p-2">
      {Object.entries(languages).map(([code, info]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={cn(
            'px-2 py-1 rounded text-xs font-medium transition-all',
            lang === code
              ? 'bg-primary text-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          {info.flag} {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Layout() {
  const { tr } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar fixed inset-y-0 start-0 z-30 border-e border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          <span className="text-sidebar-foreground font-bold text-lg tracking-tight">ELYSIUM</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, path, icon: Icon }) => (
            <Link
              key={key}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tr(key)}</span>
            </Link>
          ))}
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive('/admin')
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>{tr('admin')}</span>
          </Link>
        </nav>

        {/* Language switcher */}
        <div className="border-t border-sidebar-border">
          <div className="px-3 py-2">
            <p className="text-xs text-sidebar-foreground/50 px-2 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {tr('language')}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">E</span>
          </div>
          <span className="text-sidebar-foreground font-bold">ELYSIUM</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="fixed top-14 inset-x-0 bg-sidebar border-b border-sidebar-border p-4 space-y-1"
            onClick={e => e.stopPropagation()}>
            {[...navItems, { key: 'admin', path: '/admin', icon: Shield }].map(({ key, path, icon: Icon }) => (
              <Link key={key} to={path} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  isActive(path)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}>
                <Icon className="w-4 h-4" /> {tr(key)}
              </Link>
            ))}
            <div className="pt-2 border-t border-sidebar-border">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ms-60 pt-14 lg:pt-0 min-h-screen">
        <Outlet />
      </main>

      <FeedbackButton />
    </div>
  );
}