import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  Compass,
  LayoutDashboard,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PRODUCT_TOUR_VERSION = 1;

const ProductTourContext = createContext({ startTutorial: () => {} });

const TOUR_STEPS = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Welcome to Elysium",
    description: "Take a one-minute tour of the tools that keep your university day clear and connected.",
  },
  {
    id: "dashboard",
    path: "/",
    target: "dashboard-overview",
    icon: LayoutDashboard,
    title: "Your command center",
    description: "Start here to see the next deadline, upcoming plans, and the actions that matter today.",
  },
  {
    id: "create",
    path: "/",
    target: "create-action",
    icon: Plus,
    title: "Create in one place",
    description: "Add homework, exams, activities, or study sessions from this single action.",
  },
  {
    id: "calendar",
    path: "/calendar",
    target: "calendar-overview",
    icon: CalendarDays,
    title: "Keep deadlines visible",
    description: "Your personal deadlines and joined campus plans meet in one calendar.",
  },
  {
    id: "discover",
    path: "/discover",
    target: "discover-overview",
    icon: Compass,
    title: "Find people and opportunities",
    description: "Browse activities, study sessions, tutors, helpers, and trusted campus resources.",
  },
  {
    id: "ely",
    path: "/",
    target: "ely-assistant",
    icon: Bot,
    title: "Ask Ely what comes next",
    description: "Use Ely for a quick plan, the right student tool, or a helpful next step around campus.",
  },
  {
    id: "complete",
    icon: Check,
    title: "You are ready",
    description: "Your command center is set. You can replay this tour any time from Profile.",
  },
];

function completionStorageKey(profile, user) {
  return `elysium:product-tour:${profile?.id || user?.id || "anonymous"}`;
}

function completedLocally(key) {
  try {
    return Number(window.localStorage.getItem(key) || 0) >= PRODUCT_TOUR_VERSION;
  } catch {
    return false;
  }
}

function visibleTourTarget(targetName) {
  if (!targetName) return null;
  return Array.from(document.querySelectorAll(`[data-tour="${targetName}"]`)).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  }) || null;
}

function paddedRect(element) {
  const rect = element.getBoundingClientRect();
  const padding = 8;
  const left = Math.max(8, rect.left - padding);
  const top = Math.max(8, rect.top - padding);
  return {
    left,
    top,
    width: Math.min(window.innerWidth - left - 8, rect.width + padding * 2),
    height: Math.min(window.innerHeight - top - 8, rect.height + padding * 2),
  };
}

function cardPosition(spotlight) {
  if (!spotlight || typeof window === "undefined") return {};
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(380, viewportWidth - 32);
  const estimatedHeight = 270;

  if (viewportWidth < 640) {
    return spotlight.top > viewportHeight / 2
      ? { top: 16, left: 16 }
      : { bottom: 16, left: 16 };
  }

  const centeredLeft = spotlight.left + (spotlight.width - cardWidth) / 2;
  const left = Math.max(16, Math.min(viewportWidth - cardWidth - 16, centeredLeft));
  const roomBelow = viewportHeight - (spotlight.top + spotlight.height);
  const top = roomBelow >= estimatedHeight + 24
    ? spotlight.top + spotlight.height + 16
    : Math.max(16, spotlight.top - estimatedHeight - 16);
  return { top, left };
}

function SpotlightBackdrop({ spotlight, reduceMotion }) {
  if (!spotlight) return <div className="fixed inset-0 bg-black/65 backdrop-blur-[1px]" />;
  const { top, left, width, height } = spotlight;
  return (
    <div className="fixed inset-0" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 bg-black/65 backdrop-blur-[1px]" style={{ height: top }} />
      <div className="absolute start-0 bg-black/65 backdrop-blur-[1px]" style={{ top, width: left, height }} />
      <div className="absolute end-0 bg-black/65 backdrop-blur-[1px]" style={{ top, left: left + width, height }} />
      <div className="absolute inset-x-0 bottom-0 bg-black/65 backdrop-blur-[1px]" style={{ top: top + height }} />
      <motion.div
        layout
        className="pointer-events-none absolute rounded-xl border-2 border-primary bg-primary/5 ring-4 ring-primary/15"
        style={{ top, left, width, height }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function TutorialProvider({ children }) {
  const { user, profile, setProfile } = useProfile();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const cardRef = useRef(null);
  const autoStartedRef = useRef(false);
  const step = TOUR_STEPS[stepIndex];
  const storageKey = completionStorageKey(profile, user);

  const startTutorial = useCallback(() => {
    setStepIndex(0);
    setSpotlight(null);
    setActive(true);
    if (location.pathname !== "/") navigate("/");
  }, [location.pathname, navigate]);

  const persistCompletion = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, String(PRODUCT_TOUR_VERSION));
    } catch {
      // The profile field remains the cross-device source of truth.
    }
    setProfile?.((current) => current ? { ...current, tutorial_version: PRODUCT_TOUR_VERSION } : current);
    if (profile?.id) {
      base44.entities.StudentProfile.update(profile.id, { tutorial_version: PRODUCT_TOUR_VERSION }).catch((error) => {
        console.warn("Tutorial completion was saved only on this device.", error);
      });
    }
  }, [profile?.id, setProfile, storageKey]);

  const finishTutorial = useCallback(() => {
    setActive(false);
    setSpotlight(null);
    persistCompletion();
  }, [persistCompletion]);

  useEffect(() => {
    if (!profile || autoStartedRef.current) return;
    autoStartedRef.current = true;
    const profileVersion = Number(profile.tutorial_version || 0);
    if (profile.onboarding_complete && profileVersion < PRODUCT_TOUR_VERSION && !completedLocally(storageKey)) {
      startTutorial();
    }
  }, [profile, startTutorial, storageKey]);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") finishTutorial();
      if (event.key === "ArrowRight") {
        setStepIndex((current) => isRTL ? Math.max(0, current - 1) : Math.min(TOUR_STEPS.length - 1, current + 1));
      }
      if (event.key === "ArrowLeft") {
        setStepIndex((current) => isRTL ? Math.min(TOUR_STEPS.length - 1, current + 1) : Math.max(0, current - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, finishTutorial, isRTL]);

  useEffect(() => {
    if (!active || !step?.path || location.pathname === step.path) return;
    navigate(step.path);
  }, [active, location.pathname, navigate, step?.path]);

  useEffect(() => {
    if (!active || !step?.target || location.pathname !== step.path) {
      setSpotlight(null);
      return undefined;
    }

    let frame = 0;
    let observer;
    let target;

    const update = () => {
      if (!target) return;
      setSpotlight(paddedRect(target));
    };

    const findTarget = () => {
      target = visibleTourTarget(step.target);
      if (!target) return false;
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      frame = window.requestAnimationFrame(update);
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      observer?.disconnect();
      return true;
    };

    frame = window.requestAnimationFrame(() => {
      if (!findTarget()) {
        observer = new MutationObserver(findTarget);
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, location.pathname, reduceMotion, step?.path, step?.target]);

  useEffect(() => {
    if (active) cardRef.current?.focus();
  }, [active, stepIndex]);

  const contextValue = useMemo(() => ({ startTutorial }), [startTutorial]);
  const isWelcome = step.id === "welcome";
  const isComplete = step.id === "complete";
  const numberedStep = Math.max(1, stepIndex);
  const Icon = step.icon;
  const cardStyle = isWelcome || isComplete ? {} : cardPosition(spotlight);

  const overlay = (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <SpotlightBackdrop spotlight={isWelcome || isComplete ? null : spotlight} reduceMotion={reduceMotion} />
          <section
            ref={cardRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-tour-title"
            className={cn(
              "fixed z-[121] w-[calc(100%-2rem)] max-w-[380px] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl outline-none",
              (isWelcome || isComplete) && "start-1/2 top-1/2 max-w-md -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
            )}
            style={cardStyle}
          >
            <div className="h-1 bg-primary" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <button type="button" onClick={finishTutorial} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Skip tutorial" title="Skip tutorial">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!isWelcome && !isComplete && (
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase text-primary">Step {numberedStep} of 5</p>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((item) => <span key={item} className={cn("h-1.5 rounded-full transition-all", item === numberedStep ? "w-5 bg-primary" : item < numberedStep ? "w-1.5 bg-primary/45" : "w-1.5 bg-border")} />)}
                  </div>
                </div>
              )}

              <h2 id="product-tour-title" className="mt-4 text-xl font-bold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

              {isWelcome && (
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {["Plan", "Connect", "Study"].map((label) => <span key={label} className="rounded-md border border-border bg-muted/35 px-2 py-2 text-xs font-semibold text-foreground">{label}</span>)}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                {isWelcome ? (
                  <Button type="button" variant="ghost" onClick={finishTutorial}>Not now</Button>
                ) : (
                  <Button type="button" variant="ghost" className={cn("gap-2", isComplete && "invisible")} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />Back
                  </Button>
                )}

                {isComplete ? (
                  <Button type="button" className="gap-2" onClick={finishTutorial}><Check className="h-4 w-4" />Finish</Button>
                ) : (
                  <Button type="button" className="gap-2" onClick={() => setStepIndex((current) => Math.min(TOUR_STEPS.length - 1, current + 1))}>
                    {isWelcome ? "Start tour" : "Next"}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <ProductTourContext.Provider value={contextValue}>
      {children}
      {typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
    </ProductTourContext.Provider>
  );
}

export function useTutorial() {
  return useContext(ProductTourContext);
}
