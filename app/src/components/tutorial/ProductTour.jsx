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
const TARGET_STEP_COUNT = 5;
const MOBILE_BREAKPOINT = 768;
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const smoothTransition = { duration: 0.26, ease: [0.16, 1, 0.3, 1] };
const springTransition = { type: "spring", stiffness: 440, damping: 42, mass: 0.9 };

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
    target: { name: "create-action", desktopSurface: "desktop", mobileSurface: "mobile" },
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

function targetName(target) {
  return typeof target === "string" ? target : target?.name;
}

function visibleElement(element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
}

function visibleTourTarget(target) {
  const name = targetName(target);
  if (!name) return null;

  const selectors = [];
  if (typeof target === "object") {
    const preferredSurface = window.innerWidth < MOBILE_BREAKPOINT ? target.mobileSurface : target.desktopSurface;
    if (preferredSurface) selectors.push(`[data-tour="${name}"][data-tour-surface="${preferredSurface}"]`);
  }
  selectors.push(`[data-tour="${name}"]`);

  const seen = new Set();
  const candidates = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector))).filter((element) => {
    if (seen.has(element)) return false;
    seen.add(element);
    return true;
  });

  return candidates.find((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && visibleElement(element);
  }) || null;
}

function paddedRect(element) {
  const rect = element.getBoundingClientRect();
  const padding = window.innerWidth < MOBILE_BREAKPOINT ? 7 : 8;
  const left = Math.max(8, Math.round(rect.left - padding));
  const top = Math.max(8, Math.round(rect.top - padding));
  return {
    left,
    top,
    width: Math.round(Math.min(window.innerWidth - left - 8, rect.width + padding * 2)),
    height: Math.round(Math.min(window.innerHeight - top - 8, rect.height + padding * 2)),
  };
}

function sameRect(first, second) {
  if (!first || !second) return false;
  return ["top", "left", "width", "height"].every((key) => Math.abs(first[key] - second[key]) < 1);
}

function centeredCardPosition(cardSize = {}) {
  if (typeof window === "undefined") return {};
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(cardSize.width || 380, viewportWidth - 32);
  const cardHeight = Math.min(cardSize.height || 300, viewportHeight - 32);
  return {
    top: Math.max(16, Math.round((viewportHeight - cardHeight) / 2)),
    left: Math.max(16, Math.round((viewportWidth - cardWidth) / 2)),
  };
}

function cardPosition(spotlight, cardSize = {}) {
  if (typeof window === "undefined") return {};
  if (!spotlight) return centeredCardPosition(cardSize);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(cardSize.width || 380, viewportWidth - 32);
  const cardHeight = Math.min(cardSize.height || 300, viewportHeight - 32);

  if (viewportWidth < 640) {
    const bottomReserve = 94;
    const roomBelow = viewportHeight - (spotlight.top + spotlight.height) - bottomReserve;
    const roomAbove = spotlight.top - 16;
    const left = Math.max(16, Math.min(viewportWidth - cardWidth - 16, spotlight.left + (spotlight.width - cardWidth) / 2));

    if (roomBelow >= cardHeight + 14) {
      return { top: Math.round(spotlight.top + spotlight.height + 14), left: Math.round(left) };
    }
    if (roomAbove >= cardHeight + 14) {
      return { top: Math.round(spotlight.top - cardHeight - 14), left: Math.round(left) };
    }
    return spotlight.top > viewportHeight / 2
      ? { top: 16, left: Math.round(left) }
      : { top: Math.max(16, Math.round(viewportHeight - cardHeight - bottomReserve)), left: Math.round(left) };
  }

  const centeredLeft = spotlight.left + (spotlight.width - cardWidth) / 2;
  const left = Math.max(16, Math.min(viewportWidth - cardWidth - 16, centeredLeft));
  const roomBelow = viewportHeight - (spotlight.top + spotlight.height);
  const top = roomBelow >= cardHeight + 24
    ? spotlight.top + spotlight.height + 16
    : Math.max(16, spotlight.top - cardHeight - 16);
  return { top: Math.round(top), left: Math.round(left) };
}

function focusableChildren(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (!visibleElement(element)) return false;
    return element.getAttribute("aria-hidden") !== "true";
  });
}

function SpotlightBackdrop({ spotlight, reduceMotion, resolving }) {
  if (!spotlight) return <div className="fixed inset-0 bg-black/65 backdrop-blur-[1px]" />;
  const { top, left, width, height } = spotlight;
  const transition = reduceMotion ? { duration: 0 } : springTransition;
  return (
    <div className="fixed inset-0" aria-hidden="true">
      <motion.div className="absolute inset-x-0 top-0 bg-black/65 backdrop-blur-[1px]" initial={false} animate={{ height: top }} transition={transition} />
      <motion.div className="absolute left-0 bg-black/65 backdrop-blur-[1px]" initial={false} animate={{ top, width: left, height }} transition={transition} />
      <motion.div className="absolute right-0 bg-black/65 backdrop-blur-[1px]" initial={false} animate={{ top, left: left + width, height }} transition={transition} />
      <motion.div className="absolute inset-x-0 bottom-0 bg-black/65 backdrop-blur-[1px]" initial={false} animate={{ top: top + height }} transition={transition} />
      <motion.div
        className="pointer-events-none absolute rounded-xl border-2 border-primary bg-primary/5 ring-4 ring-primary/15"
        initial={false}
        animate={{ top, left, width, height, opacity: resolving ? 0.8 : 1 }}
        transition={transition}
      >
        {!reduceMotion && (
          <motion.span
            className="absolute inset-[-3px] rounded-[inherit] border border-primary/35"
            animate={{ opacity: [0.16, 0.48, 0.16], scale: [1, 1.018, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
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
  const [stepDirection, setStepDirection] = useState(1);
  const [spotlight, setSpotlight] = useState(null);
  const [targetStatus, setTargetStatus] = useState("idle");
  const [cardSize, setCardSize] = useState({ width: 380, height: 300 });
  const cardRef = useRef(null);
  const previousFocusRef = useRef(null);
  const autoStartedRef = useRef(false);
  const step = TOUR_STEPS[stepIndex];
  const storageKey = completionStorageKey(profile, user);

  const startTutorial = useCallback(() => {
    if (typeof document !== "undefined" && typeof HTMLElement !== "undefined" && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }
    setStepDirection(1);
    setStepIndex(0);
    setSpotlight(null);
    setTargetStatus("idle");
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

  const restoreFocus = useCallback(() => {
    const previousFocus = previousFocusRef.current;
    if (!previousFocus || typeof previousFocus.focus !== "function" || !document.contains(previousFocus)) return;
    window.requestAnimationFrame(() => previousFocus.focus({ preventScroll: true }));
  }, []);

  const finishTutorial = useCallback(() => {
    setActive(false);
    setSpotlight(null);
    setTargetStatus("idle");
    persistCompletion();
    restoreFocus();
  }, [persistCompletion, restoreFocus]);

  const moveStep = useCallback((delta) => {
    setStepDirection(delta);
    setStepIndex((current) => Math.max(0, Math.min(TOUR_STEPS.length - 1, current + delta)));
  }, []);

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
      if (event.key === "Tab") {
        const focusable = focusableChildren(cardRef.current);
        if (!focusable.length) {
          event.preventDefault();
          cardRef.current?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!cardRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
          return;
        }
        if (!event.shiftKey && (document.activeElement === last || document.activeElement === cardRef.current)) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finishTutorial();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveStep(isRTL ? -1 : 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveStep(isRTL ? 1 : -1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, finishTutorial, isRTL, moveStep]);

  useEffect(() => {
    if (!active || !step?.path || location.pathname === step.path) return;
    setTargetStatus("resolving");
    navigate(step.path);
  }, [active, location.pathname, navigate, step?.path]);

  useEffect(() => {
    if (!active) return undefined;
    if (!step?.target) {
      setSpotlight(null);
      setTargetStatus("idle");
      return undefined;
    }
    setTargetStatus("resolving");
    if (location.pathname !== step.path) {
      return undefined;
    }

    let frame = 0;
    let observer;
    let target;

    const update = () => {
      if (!target) return;
      const nextSpotlight = paddedRect(target);
      setSpotlight((current) => sameRect(current, nextSpotlight) ? current : nextSpotlight);
      setTargetStatus("ready");
    };

    const findTarget = () => {
      target = visibleTourTarget(step.target);
      if (!target) return false;
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      frame = window.requestAnimationFrame(update);
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, { capture: true, passive: true });
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

  useEffect(() => {
    if (!active || !cardRef.current) return undefined;
    const updateSize = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setCardSize((current) => sameRect({ ...current, top: 0, left: 0 }, { width: rect.width, height: rect.height, top: 0, left: 0 })
          ? current
          : { width: rect.width, height: rect.height });
      }
    };
    updateSize();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(updateSize);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [active, stepIndex]);

  const contextValue = useMemo(() => ({ startTutorial }), [startTutorial]);
  const isWelcome = step.id === "welcome";
  const isComplete = step.id === "complete";
  const isTargetedStep = Boolean(step.target);
  const numberedStep = Math.max(1, stepIndex);
  const Icon = step.icon;
  const cardStyle = isWelcome || isComplete ? centeredCardPosition(cardSize) : cardPosition(spotlight, cardSize);
  const reducedTransition = reduceMotion ? { duration: 0 } : smoothTransition;
  const spotlightResolving = targetStatus === "resolving" && isTargetedStep;
  const progressScale = isWelcome ? 0.12 : isComplete ? 1 : numberedStep / TARGET_STEP_COUNT;
  const contentVariants = {
    enter: (direction) => ({ opacity: 0, x: reduceMotion ? 0 : direction * (isRTL ? -18 : 18) }),
    center: { opacity: 1, x: 0 },
    exit: (direction) => ({ opacity: 0, x: reduceMotion ? 0 : direction * (isRTL ? 14 : -14) }),
  };

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
          <SpotlightBackdrop spotlight={isWelcome || isComplete ? null : spotlight} reduceMotion={reduceMotion} resolving={spotlightResolving} />
          <motion.section
            ref={cardRef}
            layout
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-tour-title"
            aria-describedby="product-tour-description"
            className={cn(
              "fixed z-[121] w-[calc(100%-2rem)] max-w-[380px] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl outline-none",
              "focus-visible:ring-2 focus-visible:ring-primary/60",
            )}
            style={cardStyle}
            transition={reduceMotion ? { duration: 0 } : springTransition}
          >
            <div className="relative h-1 overflow-hidden bg-primary/15">
              <motion.div
                className="absolute inset-y-0 start-0 w-full origin-left bg-primary"
                initial={false}
                animate={{ scaleX: progressScale }}
                transition={reducedTransition}
              />
              {spotlightResolving && !reduceMotion && (
                <motion.div
                  className="absolute inset-y-0 w-1/3 rounded-full bg-primary-foreground/70"
                  initial={{ x: "-120%" }}
                  animate={{ x: "360%" }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
            <div className="p-5 sm:p-6">
              <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
                <motion.div
                  key={step.id}
                  custom={stepDirection}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reducedTransition}
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-4">
                    <motion.span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={reducedTransition}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <button type="button" onClick={finishTutorial} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Skip tutorial" title="Skip tutorial">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {!isWelcome && !isComplete && (
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-primary">Step {numberedStep} of {TARGET_STEP_COUNT}</p>
                      <div className="flex gap-1.5" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <motion.span
                            key={item}
                            layout
                            className={cn(
                              "h-1.5 rounded-full",
                              item === numberedStep ? "w-5 bg-primary" : item < numberedStep ? "w-1.5 bg-primary/45" : "w-1.5 bg-border",
                            )}
                            transition={reducedTransition}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {spotlightResolving && <span role="status" className="sr-only">Finding the next tutorial highlight.</span>}
                  <h2 id="product-tour-title" className="mt-4 text-xl font-bold text-foreground">{step.title}</h2>
                  <p id="product-tour-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                  {isWelcome && (
                    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                      {["Plan", "Connect", "Study"].map((label, index) => (
                        <motion.span
                          key={label}
                          className="rounded-md border border-border bg-muted/35 px-2 py-2 text-xs font-semibold text-foreground"
                          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reduceMotion ? { duration: 0 } : { ...smoothTransition, delay: index * 0.04 }}
                        >
                          {label}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    {isWelcome ? (
                      <Button type="button" variant="ghost" onClick={finishTutorial}>Not now</Button>
                    ) : isComplete ? (
                      <span className="h-10 w-20" aria-hidden="true" />
                    ) : (
                      <Button type="button" variant="ghost" className="gap-2" onClick={() => moveStep(-1)}>
                        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />Back
                      </Button>
                    )}

                    {isComplete ? (
                      <Button type="button" className="gap-2" onClick={finishTutorial}><Check className="h-4 w-4" />Finish</Button>
                    ) : (
                      <Button type="button" className="gap-2" onClick={() => moveStep(1)}>
                        {isWelcome ? "Start tour" : "Next"}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
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
