import React from "react";
import { CalendarClock, Languages, MapPin, Users } from "lucide-react";
import { domainTones } from "@/lib/domainTones";
import { cn } from "@/lib/utils";

function Meta({ icon: Icon, children }) {
  if (!children) return null;
  return <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{children}</span></span>;
}

export default function CommunitySummaryCard({
  type = "social",
  icon: Icon,
  label,
  title,
  description,
  date,
  location,
  language,
  participants,
  capacity,
  status = "Open",
  joined = false,
  onOpen,
  action,
  footerLabel = "View details",
  className = "",
}) {
  const tone = type === "study" ? "study" : "social";
  const toneClasses = domainTones[tone];
  const isCanceled = status.toLowerCase() === "canceled";

  return (
    <article className={cn("flex min-h-52 min-w-0 flex-col rounded-lg border border-border bg-card p-4 text-start transition-colors", toneClasses.border, className)}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-start">
        <div className="flex items-start justify-between gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", toneClasses.icon)}>
            {Icon && <Icon className="h-5 w-5" />}
          </span>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", isCanceled ? "bg-destructive/10 text-destructive" : toneClasses.badge)}>
            {joined && !isCanceled ? "Joined" : status}
          </span>
        </div>

        <p className={cn("mt-4 text-xs font-semibold", toneClasses.text)}>{label}</p>
        <h2 className="mt-1 line-clamp-2 text-base font-bold text-foreground" dir="auto">{title || "Untitled"}</h2>
        {description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground" dir="auto">{description}</p>}

        <div className="mt-4 space-y-2">
          <Meta icon={CalendarClock}>{date}</Meta>
          <Meta icon={MapPin}>{location}</Meta>
          <Meta icon={Languages}>{language}</Meta>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{participants ?? 0} / {capacity || "-"} joined</span>
        </span>
        {action || <span className={cn("shrink-0 text-xs font-bold", toneClasses.text)}>{footerLabel}</span>}
      </div>
    </article>
  );
}
