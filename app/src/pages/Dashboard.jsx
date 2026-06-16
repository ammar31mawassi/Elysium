import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowRight, BookOpenCheck, Calculator, CalendarDays, ChevronRight, Flag, GraduationCap, HelpCircle, MapPin, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { sortByUrgency } from "@/lib/productUtils";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";
import { activeCourseNames } from "@/lib/profileCourses";
import { domainTones } from "@/lib/domainTones";

const itemMeta = {
  personal: { icon: Flag, tone: domainTones.calendar.icon, path: "/calendar" },
  social: { icon: Users, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", path: "/discover?tab=social" },
  session: { icon: BookOpenCheck, tone: "bg-primary/10 text-primary", path: "/discover?tab=sessions" },
  tutor: { icon: GraduationCap, tone: domainTones.tutor.icon, path: "/discover?tab=tutors" },
};

const quickActionTones = {
  study: "border-primary/30 bg-primary/10 text-primary hover:border-primary/60 hover:bg-primary/15",
  social: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:border-emerald-500/60 hover:bg-emerald-500/15 dark:text-emerald-300",
  deadline: "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:border-amber-500/60 hover:bg-amber-500/15 dark:text-amber-300",
};

function timelineTone(item, fallbackTone) {
  if (item.type === "personal" && ["important", "urgent"].includes(item.priority)) {
    return "bg-destructive/10 text-destructive";
  }
  return fallbackTone;
}

function safeQuery(promise, fallback = []) {
  return Promise.race([promise.catch(() => fallback), new Promise((resolve) => setTimeout(() => resolve(fallback), 7000))]);
}

export default function Dashboard() {
  const { user, profile, university, loading: profileLoading } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const [data, setData] = useState({ calendar: [], events: [], eventMembers: [], sessions: [], sessionMembers: [], tutors: [], helpers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile?.university_id) {
      if (!profileLoading) setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id })),
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true, is_approved: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
    ]).then(([calendar, events, eventMembers, sessions, sessionMembers, tutors, helpers]) => {
      if (!active) return;
      const allowBguDemo = !university?.name || /Ben-Gurion|בן-גוריון|بن غوريون/i.test(university.name);
      setData({
        calendar: calendar || [],
        events: events || [],
        eventMembers: eventMembers || [],
        sessions: sessions || [],
        sessionMembers: sessionMembers || [],
        tutors: allowBguDemo ? withDemoFallback(tutors, demoContent.tutors) : tutors || [],
        helpers: allowBguDemo ? withDemoFallback(helpers, demoContent.helpers) : helpers || [],
      });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.id, profile?.university_id, profileLoading, university?.name]);

  const model = useMemo(() => {
    const joinedEvents = new Set(data.eventMembers.filter((member) => member.status !== "rejected").map((member) => member.event_id));
    const joinedSessions = new Set(data.sessionMembers.map((member) => member.session_id));
    const interestSet = new Set((profile?.interests || []).map((interest) => interest.toLocaleLowerCase("en")));
    const courseSet = new Set(activeCourseNames(profile).map((course) => course.toLocaleLowerCase("en")));
    const calendarSourceIds = new Set(data.calendar.map((item) => item.source_id).filter(Boolean));
    const timeline = sortByUrgency([
      ...data.calendar.filter((item) => item.status === "active" && !item.completed).map((item) => ({ ...item, type: item.source_type === "social_activity" ? "social" : item.source_type === "study_session" ? "session" : item.source_type === "tutor_request" ? "tutor" : "personal", date: item.starts_at, detail: item.notes })),
      ...data.events.filter((event) => joinedEvents.has(event.id) && !calendarSourceIds.has(event.id) && event.status !== "canceled").map((event) => ({ id: event.id, type: "social", title: event.title, date: `${event.date}T${event.start_time || "12:00"}`, detail: event.location })),
      ...data.sessions.filter((session) => joinedSessions.has(session.id) && !calendarSourceIds.has(session.id) && session.status !== "canceled").map((session) => ({ id: session.id, type: "session", title: session.title || session.course_name, date: session.session_date, detail: session.location })),
    ], new Date());
    const availableEvents = data.events.filter((event) => event.is_open !== false && event.status !== "canceled" && !joinedEvents.has(event.id));
    const matchingEvents = availableEvents.filter((event) => interestSet.has((event.activity_name || "").toLocaleLowerCase("en")));
    const futureEvents = sortByUrgency((matchingEvents.length ? matchingEvents : availableEvents).map((event) => ({ ...event, date: `${event.date}T${event.start_time || "12:00"}` })), new Date());
    const futureSessions = sortByUrgency(data.sessions.filter((session) => courseSet.has((session.course_name || "").toLocaleLowerCase("en")) && session.status !== "canceled" && !joinedSessions.has(session.id)).map((session) => ({ ...session, date: session.session_date })), new Date());
    return { timeline, next: timeline[0], event: futureEvents[0], session: futureSessions[0], tutor: data.tutors[0], helper: data.helpers[0] };
  }, [data, profile]);

  if (profileLoading || loading) {
    return <PageLayout wide><div className="grid gap-4 lg:grid-cols-3"><SkeletonCard lines={4} className="lg:col-span-2" /><SkeletonCard lines={4} />{[1, 2, 3].map((item) => <SkeletonCard key={item} lines={3} />)}</div></PageLayout>;
  }

  const firstName = profile?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const greeting = `${p("home_greeting")}, ${firstName}`;
  const nextMeta = itemMeta[model.next?.type] || itemMeta.personal;
  const NextIcon = nextMeta.icon;

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{p("home_kicker")}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{greeting}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{university?.name || p("your_university")}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,.85fr)]">
        <div className="min-w-0 space-y-7">
          <section className="grid gap-3 sm:grid-cols-[1.45fr_.75fr]">
            <Link to={nextMeta.path} className="featured-surface group flex min-h-48 flex-col justify-between rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase opacity-75">{p("home_next")}</p>
                  <h2 className="mt-3 max-w-xl text-xl font-bold leading-snug sm:text-2xl">{model.next?.title || p("home_clear_title")}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-80">
                    {model.next ? `${format(model.next.parsedDate, "EEE, MMM d - HH:mm")} - ${formatDistanceToNowStrict(model.next.parsedDate, { addSuffix: true })}${model.next.detail ? ` - ${model.next.detail}` : ""}` : p("home_clear_body")}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/15"><NextIcon className="h-5 w-5" /></span>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold">{model.next ? p("see_all") : p("add_deadline")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" /></span>
            </Link>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              <QuickAction icon={BookOpenCheck} label={p("create_session")} to="/groups?create=1" tone="study" />
              <QuickAction icon={Users} label={p("create_social")} to="/social?create=1" tone="social" />
              <QuickAction icon={Flag} label={p("add_deadline")} to="/calendar?create=1" tone="deadline" className="col-span-2 sm:col-span-1" />
            </div>
          </section>

          <section>
            <SectionTitle title={p("home_upcoming")} action={p("see_all")} to="/calendar" />
            {model.timeline.length ? (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {model.timeline.slice(0, 4).map((item, index) => <TimelineRow key={`${item.type}-${item.id}`} item={item} last={index === Math.min(model.timeline.length, 4) - 1} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">{p("no_upcoming")}</div>
            )}
          </section>

          <section>
            <SectionTitle title={p("home_for_you")} action={p("see_all")} to="/discover" />
            <div className="grid gap-3 sm:grid-cols-2">
              <RecommendationCard icon={Users} tone="social" eyebrow={p("home_social")} title={model.event?.title || p("discover_social")} detail={model.event ? [format(model.event.parsedDate, "EEE, MMM d - HH:mm"), model.event.location].filter(Boolean).join(" - ") : p("discover_body")} to="/discover?tab=social" />
              <RecommendationCard icon={BookOpenCheck} tone="study" eyebrow={p("home_study")} title={model.session?.title || p("discover_groups")} detail={model.session?.course_name || model.session?.location || "Add active courses in Me"} to="/discover?tab=sessions" />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-7">
          <section>
            <SectionTitle title={p("home_academic")} action={p("see_all")} to="/discover?tab=tutors" />
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <PersonRow icon={GraduationCap} title={model.tutor?.display_name || p("tutors")} detail={model.tutor?.subjects?.slice(0, 3).join(" - ") || p("request")} to="/discover?tab=tutors" />
              <PersonRow icon={HelpCircle} title={model.helper?.display_name || p("helpers")} detail={model.helper?.help_topics?.slice(0, 3).join(" - ") || p("contact")} to="/discover?tab=helpers" border={false} />
            </div>
          </section>
          <section>
            <SectionTitle title={p("home_tools")} />
            <div className="grid grid-cols-2 gap-2">
              <ToolLink icon={Calculator} label="GPA" to="/tools?tool=gpa" />
              <ToolLink icon={Flag} label={p("add_deadline")} to="/calendar?create=1" />
              <ToolLink icon={BookOpenCheck} label={t("tools_flashcards")} to="/tools?tool=flashcards" />
              <ToolLink icon={CalendarDays} label={p("calendar_title")} to="/calendar" />
            </div>
          </section>
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><MapPin className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{p("campus")}</p>
                <p className="truncate text-sm font-semibold text-foreground">{university?.name || p("your_university")}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </PageLayout>
  );
}

function SectionTitle({ title, action, to }) {
  return <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-foreground">{title}</h2>{action && to && <Link to={to} className="text-xs font-semibold text-primary hover:underline">{action}</Link>}</div>;
}

function QuickAction({ icon: Icon, label, to, tone, className }) {
  return <Link to={to} className={cn("flex min-h-14 items-center gap-3 rounded-lg border px-3 text-sm font-semibold transition-colors", quickActionTones[tone], className)}><Icon className="h-4 w-4" />{label}</Link>;
}

function TimelineRow({ item, last }) {
  const meta = itemMeta[item.type] || itemMeta.personal;
  const Icon = meta.icon;
  return (
    <Link to={meta.path} className={cn("flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50", !last && "border-b border-border")}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", timelineTone(item, meta.tone))}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.detail || formatDistanceToNowStrict(item.parsedDate, { addSuffix: true })}</p>
      </div>
      <div className="shrink-0 text-end">
        <p className="text-xs font-semibold text-foreground">{format(item.parsedDate, "MMM d")}</p>
        <p className="text-[11px] text-muted-foreground">{format(item.parsedDate, "HH:mm")}</p>
      </div>
    </Link>
  );
}

function RecommendationCard({ icon: Icon, tone, eyebrow, title, detail, to }) {
  return <Link to={to} className={cn("rounded-lg border border-border bg-card p-4", domainTones[tone].border)}><div className="flex items-start gap-3"><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", domainTones[tone].icon)}><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className={cn("text-xs font-semibold", domainTones[tone].text)}>{eyebrow}</p><h3 className="mt-1 line-clamp-1 text-sm font-bold text-foreground">{title}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></div></Link>;
}

function PersonRow({ icon: Icon, title, detail, to, border = true }) {
  return <Link to={to} className={cn("flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted/50", border && "border-b border-border")}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{title}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div><ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" /></Link>;
}

function ToolLink({ icon: Icon, label, to }) {
  return <Link to={to} className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/35"><Icon className="h-5 w-5 text-primary" /><span className="mt-3 text-xs font-semibold text-foreground">{label}</span></Link>;
}
