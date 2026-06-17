import React from "react";
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

const toneMap = {
  primary: "bg-primary/10 text-primary border-primary/20",
  study: "bg-accent/10 text-accent border-accent/20",
  social: "bg-secondary/20 text-secondary-foreground border-secondary/35",
};

export default function StudentOsPreview({ className }) {
  return (
    <div className={cn("landing-preview-shell", className)} aria-label="Elysium dashboard preview">
      <div className="landing-preview-window" data-landing-reveal>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="landing-preview-icon flex size-8 items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.08] text-cyan-100">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Today command center</p>
              <p className="truncate text-xs text-white/[0.55]">Ben-Gurion University · English</p>
            </div>
          </div>
          <span className="landing-preview-icon flex size-9 items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.07] text-white/75">
            <Bell className="size-4" aria-hidden="true" />
          </span>
        </div>

        <div className="grid items-start gap-4 p-4 sm:p-5 lg:grid-cols-[0.82fr_1.35fr_0.82fr]">
          <aside className="landing-preview-panel hidden min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-3 lg:block">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.45]">Hub</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {["Home", "Social", "Study", "Calendar", "Tools"].map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "landing-preview-nav-row flex items-center justify-between rounded-md px-2.5 py-2 text-sm",
                    index === 0 ? "bg-white/10 text-white" : "text-white/[0.55]",
                  )}
                >
                  <span>{item}</span>
                  {index === 0 && <span className="size-1.5 rounded-full bg-cyan-300" />}
                </div>
              ))}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="landing-preview-panel landing-preview-next rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
                    Your next step
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight text-white sm:text-2xl">
                    Finish the lab plan before your study group.
                  </h3>
                  <p className="landing-preview-compact-hide mt-2 text-sm leading-6 text-white/[0.68]">
                    Elysium connects the deadline, classmates, tutor options, and your calendar.
                  </p>
                </div>
                <div className="landing-progress-ring shrink-0" style={{ "--progress": "74" }}>
                  <span>74%</span>
                </div>
              </div>
              <div className="landing-preview-optional mt-5 grid gap-2 sm:grid-cols-3">
                {actions.map((action) => (
                  <div key={action.label} className="landing-preview-mini-card rounded-md border border-white/10 bg-white/[0.07] p-3">
                    <action.icon className="size-4 text-cyan-100" aria-hidden="true" />
                    <p className="mt-2 text-[11px] text-white/[0.48]">{action.label}</p>
                    <p className="text-sm font-semibold text-white">{action.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-preview-panel landing-preview-optional mt-4 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
              {timeline.map((item, index) => (
                <PreviewTimelineRow key={item.title} item={item} last={index === timeline.length - 1} />
              ))}
            </div>
          </main>

          <aside className="landing-preview-optional grid min-w-0 gap-3 sm:grid-cols-2">
            {toolCards.map((tool) => (
              <div key={tool.label} className="landing-preview-mini-card rounded-lg border border-white/10 bg-white/[0.055] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-white/[0.08] text-white">
                    <tool.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-cyan-100/70">{tool.detail}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{tool.label}</p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}

function PreviewTimelineRow({ item, last }) {
  const Icon = item.icon;
  return (
    <div className={cn("flex items-center gap-3 px-3.5 py-3", !last && "border-b border-white/10")}>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md border", toneMap[item.tone])}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <p className="truncate text-xs text-white/50">{item.detail}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-white/[0.65]">{item.time}</span>
    </div>
  );
}
