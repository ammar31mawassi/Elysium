import React, { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import ElysiumLogo from '@/components/elysium/ElysiumLogo';

const FOCUSABLE_FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';
const FIELD_VIEWPORT_MARGIN = 24;
const KEYBOARD_OPEN_THRESHOLD = 80;

export default function AuthLayout({ title, subtitle, footer, children }) {
  const { isDark, setTheme } = useTheme();
  const shellRef = useRef(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const shell = shellRef.current;

    if (!viewport || !shell) return undefined;

    const isMobileViewport = () => window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;

    const syncViewportState = () => {
      if (!isMobileViewport()) {
        shell.style.removeProperty('--auth-viewport-height');
        shell.style.setProperty('--auth-keyboard-offset', '0px');
        shell.removeAttribute('data-keyboard-open');
        return;
      }

      const keyboardOffset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      shell.style.setProperty('--auth-viewport-height', `${viewport.height}px`);
      shell.style.setProperty('--auth-keyboard-offset', `${keyboardOffset}px`);
      if (keyboardOffset > KEYBOARD_OPEN_THRESHOLD) {
        shell.setAttribute('data-keyboard-open', 'true');
      } else {
        shell.removeAttribute('data-keyboard-open');
      }
    };

    const scrollActiveFieldIntoView = (behavior = 'smooth') => {
      if (!isMobileViewport()) return;
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;
      if (!shell.contains(activeElement)) return;
      if (!activeElement.matches(FOCUSABLE_FIELD_SELECTOR)) return;

      const fieldRect = activeElement.getBoundingClientRect();
      const visibleTop = viewport.offsetTop + FIELD_VIEWPORT_MARGIN;
      const visibleBottom = viewport.offsetTop + viewport.height - FIELD_VIEWPORT_MARGIN;

      if (fieldRect.bottom > visibleBottom) {
        const scrollAmount = fieldRect.bottom - visibleBottom;
        if (typeof shell.scrollBy === 'function') {
          shell.scrollBy({ top: scrollAmount, behavior });
        } else {
          shell.scrollTop += scrollAmount;
        }
      } else if (fieldRect.top < visibleTop) {
        const scrollAmount = fieldRect.top - visibleTop;
        if (typeof shell.scrollBy === 'function') {
          shell.scrollBy({ top: scrollAmount, behavior });
        } else {
          shell.scrollTop += scrollAmount;
        }
      }
    };

    const syncViewportHeight = () => {
      syncViewportState();
      window.setTimeout(scrollActiveFieldIntoView, 50);
      window.setTimeout(scrollActiveFieldIntoView, 250);
    };

    syncViewportHeight();
    viewport.addEventListener('resize', syncViewportHeight);
    viewport.addEventListener('scroll', syncViewportHeight);

    return () => {
      viewport.removeEventListener('resize', syncViewportHeight);
      viewport.removeEventListener('scroll', syncViewportHeight);
    };
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    const keepFocusedFieldVisible = (event) => {
      if (!window.matchMedia(MOBILE_VIEWPORT_QUERY).matches) return;

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches(FOCUSABLE_FIELD_SELECTOR)) return;

      window.setTimeout(() => {
        if (typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 250);
    };

    shell.addEventListener('focusin', keepFocusedFieldVisible);

    return () => {
      shell.removeEventListener('focusin', keepFocusedFieldVisible);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      data-auth-layout
      className="flex min-h-[var(--auth-viewport-height,100dvh)] scroll-pb-[calc(var(--auth-keyboard-offset,0px)+2rem)] items-start justify-center overflow-y-auto bg-background px-4 pb-[calc(1.5rem+var(--auth-keyboard-offset,0px))] pt-6 sm:items-center sm:py-8"
    >
      <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="fixed end-4 top-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="w-full max-w-md">
        {/* Official logo centered */}
        <div className="flex flex-col items-center mb-8">
          <ElysiumLogo size={80} className="mb-5 object-contain" />
          {title && <h1 className="text-2xl font-bold text-foreground text-center">{title}</h1>}
          {subtitle && <p className="text-muted-foreground text-sm mt-1 text-center">{subtitle}</p>}
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-5">{footer}</p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
          University the way it should feel.
        </p>
      </div>
    </div>
  );
}
