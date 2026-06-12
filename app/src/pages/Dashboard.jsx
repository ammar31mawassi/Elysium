import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict, isValid, parseISO, startOfDay } from "date-fns";
import {
  ArrowRight, BookOpenCheck, Calculator, CalendarDays, ChevronRight, Compass,
  Flag, GraduationCap, HelpCircle, MapPin, Sparkles, Users,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";

const itemMeta = {
  deadline: { icon: Flag, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400", path: "/calendar" },
  social: { icon: Users, tone: "bg-amber-500/12 text-amber-700 dark:text-amber-400", path: "/social" },
  session: { icon: BookOpenCheck, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400", path: "/groups?tab=sessions" },
};

function safeDate(value) {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function safeQuery(promise, timeout = 7000) {
  return Promise.race([promise.catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), timeout))]);
}

export default function Dashboard() {
  const { user, profile, university, loading: profileLoading } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const [data, setData] = useState({ deadlines: [], events: [], eventMemberships: [], groups: [], groupMemberships: [], sessions: [], tutors: [], helpers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { if (!profileLoading) setLoading(false); return; }
    if (!profile?.university_id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.Deadline.filter({ user_id: user.id })),
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudyGroup.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.StudyGroupMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudySession.list("-session_date", 100)),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
    ]).then(([deadlines, events, eventMemberships, groups, groupMemberships, sessions, tutors, helpers]) => {
      if (!active) return;
      setData({ deadlines: deadlines || [], events: events || [], eventMemberships: eventMemberships || [], groups: groups || [], groupMemberships: groupMemberships || [], sessions: sessions || [], tutors: tutors || [], helpers: helpers || [] });
    }).catch(console.error).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, profileLoading]);

  const model = useMemo(() => {
    const today = startOfDay(new Date());
    const joinedEventIds = new Set(data.eventMemberships.map((membership) => membership.event_id));
    const joinedGroupIds = new Set(data.groupMemberships.map((membership) => membership.group_id));
    const timeline = [
      ...data.deadlines.map((item) => ({ id: item.id, type: "deadline", title: item.title, date: item.due_date, detail: item.source || item.category })),
      ...data.events.filter((item) => joinedEventIds.has(item.id)).map((item) => ({ id: item.id, type: "social", title: item.title, date: item.date, detail: item.location })),
      ...data.sessions.filter((item) => joinedGroupIds.has(item.group_id)).map((item) => ({ id: item.id, type: "session", title: item.title || p("home_session"), date: item.session_date, detail: item.location })),
    ].map((item) => ({ ...item, parsedDate: safeDate(item.date) }))
      .filter((item) => item.parsedDate && startOfDay(item.parsedDate) >= today)
      .sort((a, b) => a.parsedDate - b.parsedDate);

    const futureEvents = data.events.filter((item) => {
      const date = safeDate(item.date);
      return date && startOfDay(date) >= today && !joinedEventIds.has(item.id) && item.is_open !== false;
    }).sort((a, b) => a.date.localeCompare(b.date));
    const availableGroups = data.groups.filter((item) => !joinedGroupIds.has(item.id));
    return { timeline, next: timeline[0], social: futureEvents[0], group: availableGroups[0], tutor: data.tutors[0], helper: data.helpers[0] };
  }, [data, locale]);

  if (profileLoading || loading) {
    return <PageLayout wide><div className="grid gap-4 lg:grid-cols-3"><SkeletonCard lines={4} className="lg:col-span-2" /><SkeletonCard lines={4} />{[1,2,3].map((item) => <SkeletonCard key={item} lines={3} />)}</div></PageLayout>;
  }

  const firstName = profile?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const greeting = locale === "ar" ? `${p("home_greeting")}، ${firstName}` : `${p("home_greeting")}, ${firstName}`;
  const dateLabel = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : locale === "ar" ? "ar-IL" : "en-IL", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const nextMeta = model.next ? itemMeta[model.next.type] : null;
  const NextIcon = nextMeta?.icon || Compass;

  return (
    <PageLayout wide>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{p("home_kicker")}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{greeting}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{university?.name || dateLabel}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,.85fr)]">
        <div className="min-w-0 space-y-7">
          <section className="grid gap-3 sm:grid-cols-[1.35fr_.85fr]">
            <Link to={nextMeta?.path || "/calendar?create=1"} className="group flex min-h-44 flex-col justify-between rounded-lg bg-primary p-5 text-primary-foreground shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase opacity-75">{p("home_next")}</p>
                  <h2 className="mt-3 max-w-xl text-xl font-bold leading-snug sm:text-2xl">{model.next?.title || p("home_clear_title")}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-80">{model.next ? `${format(model.next.parsedDate, "EEE, MMM d")} · ${formatDistanceToNowStrict(model.next.parsedDate, { addSuffix: true })}${model.next.detail ? ` · ${model.next.detail}` : ""}` : p("home_clear_body")}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-foreground/14"><NextIcon className="h-5 w-5" /></span>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold">{model.next ? p(`home_${model.next.type === "social" ? "event" : model.next.type}`) : p("add_deadline")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" /></span>
            </Link>

            <Link to="/ask" className="group flex min-h-44 flex-col justify-between rounded-lg border border-blue-500/20 bg-blue-500/8 p-5 hover:border-blue-500/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/12 text-blue-600 dark:text-blue-400"><Sparkles className="h-5 w-5" /></span>
              <div className="mt-5">
                <h2 className="font-bold text-foreground">{p("home_ask_title")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p("home_ask_body")}</p>
                <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">{p("ask_elysium")}<ChevronRight className="h-4 w-4 rtl:rotate-180" /></span>
              </div>
            </Link>
          </section>

          <section>
            <SectionTitle title={p("home_upcoming")} action={p("see_all")} to="/calendar" />
            {model.timeline.length ? (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {model.timeline.slice(0, 4).map((item, index) => <TimelineRow key={`${item.type}-${item.id}`} item={item} last={index === Math.min(model.timeline.length, 4) - 1} p={p} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">{p("no_upcoming")}</div>
            )}
          </section>

          <section>
            <SectionTitle title={p("home_for_you")} action={p("see_all")} to="/discover" />
            <div className="grid gap-3 sm:grid-cols-2">
              <RecommendationCard icon={Users} tone="amber" eyebrow={p("home_social")} title={model.social?.title || p("discover_social")} detail={model.social ? [model.social.date, model.social.location].filter(Boolean).join(" · ") : p("discover_body")} to="/discover?tab=social" />
              <RecommendationCard icon={BookOpenCheck} tone="blue" eyebrow={p("home_study")} title={model.group?.name || p("discover_sessions")} detail={model.group?.course_name || model.group?.description || p("discover_body")} to="/discover?tab=sessions" />
            </div>
          </section>
        </div>

        <aside className="space-y-7">
          <section>
            <SectionTitle title={p("home_academic")} action={p("see_all")} to="/discover?tab=tutors" />
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <PersonRow icon={GraduationCap} title={model.tutor?.display_name || p("tutors")} detail={model.tutor?.subjects?.slice(0, 3).join(" · ") || p("request")} to="/discover?tab=tutors" />
              <PersonRow icon={HelpCircle} title={model.helper?.display_name || p("helpers")} detail={model.helper?.help_topics?.slice(0, 3).join(" · ") || p("contact")} to="/discover?tab=helpers" border={false} />
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
              <div className="min-w-0"><p className="text-xs text-muted-foreground">{p("campus")}</p><p className="truncate text-sm font-semibold text-foreground">{university?.name || p("your_university")}</p></div>
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

function TimelineRow({ item, last, p }) {
  const meta = itemMeta[item.type];
  const Icon = meta.icon;
  return <Link to={meta.path} className={cn("flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50", !last && "border-b border-border")}>
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", meta.tone)}><Icon className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{item.title}</p><p className="truncate text-xs text-muted-foreground">{p(`home_${item.type === "social" ? "event" : item.type}`)}{item.detail ? ` · ${item.detail}` : ""}</p></div>
    <div className="shrink-0 text-end"><p className="text-xs font-semibold text-foreground">{format(item.parsedDate, "MMM d")}</p><p className="text-[11px] text-muted-foreground">{format(item.parsedDate, "EEE")}</p></div>
  </Link>;
}

function RecommendationCard({ icon: Icon, tone, eyebrow, title, detail, to }) {
  const tones = tone === "amber" ? "bg-amber-500/12 text-amber-700 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  return <Link to={to} className="group rounded-lg border border-border bg-card p-4 hover:border-primary/35"><div className="flex items-start gap-3"><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", tones)}><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-semibold text-muted-foreground">{eyebrow}</p><h3 className="mt-1 line-clamp-1 text-sm font-bold text-foreground">{title}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></div></Link>;
}

function PersonRow({ icon: Icon, title, detail, to, border = true }) {
  return <Link to={to} className={cn("flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50", border && "border-b border-border")}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{title}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div><ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" /></Link>;
}

function ToolLink({ icon: Icon, label, to }) {
  return <Link to={to} className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/35"><Icon className="h-5 w-5 text-primary" /><span className="mt-3 text-xs font-semibold text-foreground">{label}</span></Link>;
}
