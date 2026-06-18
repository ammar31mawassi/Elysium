import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HelpCircle,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const timeline = [
  {
    time: "09:30",
    title: "Algorithms lecture",
    detail: "Room 204, deadline attached",
    icon: BookOpenCheck,
    tone: "primary",
  },
  {
    time: "13:00",
    title: "Library exam sprint",
    detail: "3 classmates joined",
    icon: Users,
    tone: "study",
  },
  {
    time: "17:45",
    title: "Campus football",
    detail: "Field B, 2 spots left",
    icon: MapPin,
    tone: "social",
  },
];

const actions = [
  { label: "Plan study", value: "42m", icon: Clock3 },
  { label: "Find tutor", value: "CS", icon: GraduationCap },
  { label: "Ask helper", value: "1st year", icon: HelpCircle },
];

const toolCards = [
  { label: "Tasks", detail: "3 due", icon: CheckCircle2 },
  { label: "Events", detail: "8 nearby", icon: CalendarDays },
  { label: "Peers", detail: "12 matches", icon: MessageCircle },
  { label: "AI guide", detail: "Ready", icon: Sparkles },
];

const floatingCards = [
  {
    title: "Upcoming Exam",
    detail: "Calculus II · Friday",
    icon: BookOpenCheck,
    className: "landing-float-exam",
  },
  {
    title: "Study Group",
    detail: "4 classmates joined",
    icon: Users,
    className: "landing-float-group",
  },
  {
    title: "New Tutor Match",
    detail: "Data Structures",
    icon: GraduationCap,
    className: "landing-float-tutor",
  },
  {
    title: "Homework Reminder",
    detail: "Lab report due 18:00",
    icon: Bell,
    className: "landing-float-homework",
  },
  {
    title: "Campus Event",
    detail: "Design club tonight",
    icon: CalendarDays,
    className: "landing-float-event",
  },
];

const toneMap = {
  primary: "bg-cyan-300/10 text-cyan-100 border-cyan-200/20",
  study: "bg-blue-300/10 text-blue-100 border-blue-200/20",
  social: "bg-amber-300/15 text-amber-100 border-amber-200/25",
};

export default function StudentOsPreview({ className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("landing-preview-shell", className)} aria-label="Elysium dashboard preview">
      {floatingCards.map((card, index) => (
        <FloatingCard key={card.title} card={card} index={index} />
      ))}

      <motion.div
        className="landing-preview-window"
        whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.006 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="landing-preview-topbar">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="landing-preview-icon">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Today command center</p>
              <p className="truncate text-xs text-white/[0.55]">Courses · people · plans</p>
            </div>
          </div>
          <span className="landing-preview-bell">
            <Bell className="size-4" aria-hidden="true" />
          </span>
        </div>

        <div className="landing-preview-grid">
          <aside className="landing-preview-panel landing-preview-sidebar">
            <p className="landing-preview-label">Hub</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {["Home", "Social", "Study", "Calendar", "Tools"].map((item, index) => (
                <motion.div
                  key={item}
                  className={cn("landing-preview-nav-row", index === 0 && "is-active")}
                  whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                >
                  <span>{item}</span>
                  {index === 0 && <span className="size-1.5 rounded-full bg-cyan-300" />}
                </motion.div>
              ))}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="landing-preview-panel landing-preview-next">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="landing-preview-label text-cyan-100/70">Your next step</p>
                  <h3>Finish the lab plan before your study group.</h3>
                  <p>
                    Elysium connects the deadline, classmates, tutor options, and your calendar.
                  </p>
                </div>
                <div className="landing-progress-ring" style={{ "--progress": "74" }}>
                  <span>74%</span>
                </div>
              </div>
              <div className="landing-preview-actions">
                {actions.map((action, index) => (
                  <PreviewAction key={action.label} action={action} index={index} />
                ))}
              </div>
            </div>

            <div className="landing-preview-panel landing-preview-timeline">
              {timeline.map((item, index) => (
                <PreviewTimelineRow key={item.title} item={item} last={index === timeline.length - 1} />
              ))}
            </div>
          </main>

          <aside className="landing-preview-tools">
            {toolCards.map((tool, index) => (
              <PreviewTool key={tool.label} tool={tool} index={index} />
            ))}
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

function FloatingCard({ card, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = card.icon;

  return (
    <motion.div
      className={cn("landing-floating-card", card.className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.94 }}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              opacity: 1,
              y: [0, index % 2 ? 9 : -9, 0],
              scale: 1,
            }
      }
      transition={{
        opacity: { duration: 0.42, delay: 0.25 + index * 0.08 },
        scale: { duration: 0.42, delay: 0.25 + index * 0.08 },
        y: {
          duration: 5.5 + index * 0.5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: 0.25 + index * 0.08,
        },
      }}
    >
      <span>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p>{card.title}</p>
        <small>{card.detail}</small>
      </div>
    </motion.div>
  );
}

function PreviewAction({ action, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = action.icon;

  return (
    <motion.div
      className="landing-preview-mini-card"
      initial={prefersReducedMotion ? false : { opacity: 0.82, y: 10 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      viewport={{ once: true }}
      transition={{ duration: 0.34, delay: index * 0.05 }}
    >
      <Icon className="size-4 text-cyan-100" aria-hidden="true" />
      <p>{action.label}</p>
      <strong>{action.value}</strong>
    </motion.div>
  );
}

function PreviewTool({ tool, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = tool.icon;

  return (
    <motion.div
      className="landing-preview-mini-card"
      initial={prefersReducedMotion ? false : { opacity: 0.82, scale: 0.94 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      viewport={{ once: true }}
      transition={{ duration: 0.34, delay: index * 0.05 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="landing-preview-tool-icon">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-xs font-medium text-cyan-100/70">{tool.detail}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{tool.label}</p>
    </motion.div>
  );
}

function PreviewTimelineRow({ item, last }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = item.icon;

  return (
    <motion.div
      className={cn("landing-preview-timeline-row", !last && "border-b border-white/10")}
      whileHover={prefersReducedMotion ? undefined : { x: 3 }}
    >
      <span className={cn("landing-preview-timeline-icon", toneMap[item.tone])}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <p className="truncate text-xs text-white/50">{item.detail}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-white/[0.65]">{item.time}</span>
    </motion.div>
  );
}
