import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { BookOpenCheck, CalendarDays, Clock, Coffee, Dumbbell, ExternalLink, Gamepad2, GraduationCap, HelpCircle, Languages, MapPin, MessageCircle, Music2, Search, ShieldCheck, Star, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { localizedField, parseDate } from "@/lib/productUtils";
import { activeCourseNames } from "@/lib/profileCourses";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const eventIcons = { sports: Dumbbell, gaming: Gamepad2, music: Music2, social: Coffee, study_marathon: BookOpenCheck, other: Users };
const tabAliases = { study: "sessions", groups: "sessions", teachers: "tutors", mentors: "helpers", guides: "resources" };

function safeQuery(promise) {
  return Promise.race([promise.catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), 7000))]);
}

export default function DiscoverPage() {
  const { user, profile, university } = useProfile();
  const { locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const location = useLocation();
  const rawTab = new URLSearchParams(location.search).get("tab") || "social";
  const requestedTab = tabAliases[rawTab] || rawTab;
  const [tab, setTab] = useState(requestedTab);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ events: [], eventMembers: [], sessions: [], sessionMembers: [], tutors: [], helpers: [], guides: [], links: [] });

  useEffect(() => setTab(requestedTab), [requestedTab]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.list("-created_date", 500)),
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.list("-created_date", 500)),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true, is_approved: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
      safeQuery(base44.entities.Guide.filter({ is_published: true })),
      safeQuery(base44.entities.HelpfulLink.filter({ is_published: true })),
    ]).then(([events, eventMembers, sessions, sessionMembers, tutors, helpers, guides, links]) => {
      if (!active) return;
      const allowBguDemo = !university?.name || /Ben-Gurion/i.test(university.name);
      const forUniversity = (items) => (items || []).filter((item) => !item.university_id || item.university_id === profile.university_id);
      setData({
        events: allowBguDemo ? withDemoFallback(events, demoContent.events) : events || [],
        eventMembers: eventMembers || [],
        sessions: allowBguDemo ? withDemoFallback(sessions, demoContent.sessions) : sessions || [],
        sessionMembers: sessionMembers || [],
        tutors: allowBguDemo ? withDemoFallback(tutors, demoContent.tutors) : tutors || [],
        helpers: allowBguDemo ? withDemoFallback(helpers, demoContent.helpers) : helpers || [],
        guides: allowBguDemo ? withDemoFallback(forUniversity(guides), demoContent.guides) : forUniversity(guides),
        links: allowBguDemo ? withDemoFallback(forUniversity(links), demoContent.links) : forUniversity(links),
      });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, university?.name]);

  const tabs = [
    ["social", p("discover_social"), Users],
    ["sessions", p("discover_groups"), BookOpenCheck],
    ["tutors", p("discover_tutors"), GraduationCap],
    ["helpers", p("discover_helpers"), HelpCircle],
    ["resources", locale === "he" ? "משאבים" : locale === "ar" ? "المصادر" : "Resources", ShieldCheck],
  ];
  const myEventIds = new Set(data.eventMembers.filter((item) => item.user_id === user?.id && item.status !== "rejected").map((item) => item.event_id));
  const mySessionIds = new Set(data.sessionMembers.filter((item) => item.user_id === user?.id).map((item) => item.session_id));
  const interests = (profile?.interests || []).map((interest) => interest.toLocaleLowerCase("en"));
  const courses = activeCourseNames(profile).map((course) => course.toLocaleLowerCase("en"));
  const normalizedQuery = query.trim().toLowerCase();
  const includesQuery = (...values) => !normalizedQuery || values.flat().filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);

  const view = useMemo(() => {
    const now = new Date();
    const interestSet = new Set(interests);
    const courseSet = new Set(courses);
    return {
      events: data.events.filter((item) => {
        const date = parseDate(`${item.date}T${item.start_time || "12:00"}`);
        const relevant = !interestSet.size || interestSet.has((item.activity_name || "").toLocaleLowerCase("en")) || item.organizer_id === user?.id || myEventIds.has(item.id);
        return relevant && date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.description, item.location, item.activity_name, item.category);
      }).sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`)),
      sessions: data.sessions.filter((item) => {
        const date = parseDate(item.session_date);
        const relevant = courseSet.has((item.course_name || "").toLocaleLowerCase("en")) || item.host_id === user?.id || mySessionIds.has(item.id);
        return relevant && date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.course_name, item.location, item.preferred_language);
      }).sort((a, b) => (a.session_date || "").localeCompare(b.session_date || "")),
      tutors: data.tutors.filter((item) => includesQuery(item.display_name, item.subjects, item.languages, item.bio, item.teaching_mode)),
      helpers: data.helpers.filter((item) => includesQuery(item.display_name, item.help_topics, item.field_of_study, item.bio, item.languages)),
      resources: [...data.guides.map((item) => ({ ...item, resourceType: "guide" })), ...data.links.map((item) => ({ ...item, resourceType: "link" }))].filter((item) => includesQuery(localizedField(item, "title", locale), localizedField(item, "description", locale), localizedField(item, "content", locale), item.category)),
    };
  }, [data, normalizedQuery, locale, interests.join("|"), courses.join("|"), user?.id]);

  async function addCalendar(sourceType, sourceId, title, startsAt, notes, courseName = "") {
    const existing = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId }));
    if (!existing.length) await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: sourceType, source_id: sourceId, course_name: courseName, title, starts_at: startsAt, notes, status: "active", completed: false });
  }
  async function removeCalendar(sourceId) { const items = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId })); await Promise.all(items.map((item) => base44.entities.CalendarItem.delete(item.id))); }
  async function joinEvent(event) { const approved = data.eventMembers.filter((item) => item.event_id === event.id && item.status === "approved").length; if (approved >= (event.max_spots || Infinity)) return; const membership = await base44.entities.SocialEventMember.create({ event_id: event.id, user_id: user.id, status: "approved" }); setData((current) => ({ ...current, eventMembers: [...current.eventMembers, membership] })); await addCalendar("social_activity", event.id, event.title, `${event.date}T${event.start_time || "12:00"}`, event.location); }
  async function leaveEvent(eventId) { const membership = data.eventMembers.find((item) => item.event_id === eventId && item.user_id === user.id); if (!membership) return; await base44.entities.SocialEventMember.delete(membership.id); setData((current) => ({ ...current, eventMembers: current.eventMembers.filter((item) => item.id !== membership.id) })); await removeCalendar(eventId); }
  async function joinSession(session) { if (mySessionIds.has(session.id)) return; const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, user_id: user.id }); setData((current) => ({ ...current, sessionMembers: [...current.sessionMembers, membership] })); await addCalendar("study_session", session.id, session.title || session.course_name || "Study group", session.session_date, session.location, session.course_name); }
  async function leaveSession(sessionId) { const membership = data.sessionMembers.find((item) => item.session_id === sessionId && item.user_id === user.id); if (!membership) return; await base44.entities.StudySessionMember.delete(membership.id); setData((current) => ({ ...current, sessionMembers: current.sessionMembers.filter((item) => item.id !== membership.id) })); await removeCalendar(sessionId); }

  const activeItems = view[tab] || [];
  return (
    <PageLayout wide>
      <header className="mb-6 max-w-2xl"><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("discover_title")}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("discover_body")}</p></header>
      <div className="sticky top-16 z-30 -mx-4 mb-5 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border"><div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={p("discover_search")} className="h-11 min-w-0 ps-9" /></div><div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1" role="tablist">{tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold", tab === key ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground")} role="tab" aria-selected={tab === key}><Icon className="h-4 w-4" />{label}</button>)}</div></div></div>
      {loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <SkeletonCard key={item} lines={3} />)}</div> : <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tab === "social" && view.events.map((event) => <SocialCard key={event.id} event={event} members={data.eventMembers.filter((item) => item.event_id === event.id && item.status === "approved").length} joined={myEventIds.has(event.id)} onJoin={() => joinEvent(event)} onLeave={() => leaveEvent(event.id)} p={p} />)}
        {tab === "sessions" && view.sessions.map((session) => <SessionCard key={session.id} session={session} members={data.sessionMembers.filter((item) => item.session_id === session.id).length} joined={mySessionIds.has(session.id)} onJoin={() => joinSession(session)} onLeave={() => leaveSession(session.id)} p={p} />)}
        {tab === "tutors" && view.tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} whatsappUrl={tutor.contact_consent ? buildWhatsAppUrl(tutor.phone_number, `Hi ${tutor.display_name}, I found your tutor profile on Elysium and would like to ask about a lesson.`) : ""} />)}
        {tab === "helpers" && view.helpers.map((helper) => <HelperCard key={helper.id} helper={helper} whatsappUrl={helper.contact_consent && helper.contact_method === "whatsapp" ? buildWhatsAppUrl(helper.contact_value, `Hi ${helper.display_name}, I found your peer helper profile on Elysium and would like to ask for student help.`) : ""} />)}
        {tab === "resources" && view.resources.map((resource) => <ResourceCard key={`${resource.resourceType}-${resource.id}`} resource={resource} locale={locale} />)}
      </div>}
      {!loading && activeItems.length === 0 && <EmptyState icon={Search} title={p("discover_empty")} message={tab === "social" ? "Add hobbies in your profile to see relevant activities." : tab === "sessions" ? "Add active courses in your profile to see relevant study groups." : p("discover_body")} />}
    </PageLayout>
  );
}

function Card({ children }) { return <article className="flex min-h-60 min-w-0 flex-col rounded-lg border border-border bg-card p-4">{children}</article>; }
function Meta({ icon: Icon, children }) { return <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{children}</span></span>; }
function ActionButton({ joined, disabled, onJoin, onLeave, p }) { return <button onClick={joined ? onLeave : onJoin} disabled={disabled} className={cn("mt-auto min-h-11 rounded-md px-3 text-sm font-semibold", joined ? "border border-border text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground", disabled && "cursor-not-allowed bg-muted text-muted-foreground")}>{joined ? p("leave") : disabled ? "Full" : p("join")}</button>; }
function SocialCard({ event, members, joined, onJoin, onLeave, p }) { const Icon = eventIcons[event.category] || Users; const full = members >= (event.max_spots || Infinity); return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400"><Icon className="h-5 w-5" /></span><Meta icon={Users}>{members}/{event.max_spots || "—"}</Meta></div><p className="mt-4 text-xs font-semibold text-primary">{event.activity_name || event.category}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{event.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{event.description}</p><div className="my-4 space-y-2"><Meta icon={CalendarDays}>{event.date}{event.start_time ? ` · ${event.start_time}` : ""}</Meta>{event.location && <Meta icon={MapPin}>{event.location}</Meta>}</div><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>; }
function SessionCard({ session, members, joined, onJoin, onLeave, p }) { const date = parseDate(session.session_date); const full = members >= (session.max_spots || Infinity); return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><BookOpenCheck className="h-5 w-5" /></span><Meta icon={Users}>{members}/{session.max_spots || "—"}</Meta></div><p className="mt-4 text-xs font-semibold text-primary">{session.is_marathon ? "Study marathon" : "Study group"} · {session.course_name || p("discover_groups")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{session.title || "Study group"}</h2><div className="my-4 space-y-2">{date && <Meta icon={Clock}>{format(date, "EEE, MMM d · HH:mm")}</Meta>}{session.location && <Meta icon={MapPin}>{session.location}</Meta>}{session.preferred_language && <Meta icon={Languages}>{session.preferred_language}</Meta>}</div><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>; }
function WhatsAppButton({ url }) { return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 text-sm font-semibold text-[#062f18]"><MessageCircle className="h-4 w-4" />Open WhatsApp<ExternalLink className="h-3.5 w-3.5" /></a> : <button disabled className="mt-auto min-h-11 rounded-md bg-muted px-3 text-sm font-semibold text-muted-foreground">WhatsApp number unavailable</button>; }
function TutorCard({ tutor, whatsappUrl }) { return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400"><GraduationCap className="h-5 w-5" /></span>{tutor.rating_count > 0 && <Meta icon={Star}>{Number(tutor.rating_avg || 0).toFixed(1)}</Meta>}</div><h2 className="mt-4 text-base font-bold text-foreground">{tutor.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{tutor.bio}</p><div className="my-4 flex flex-wrap gap-1.5">{tutor.subjects?.slice(0, 4).map((subject) => <span key={subject} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{subject}</span>)}</div>{(tutor.price_min || tutor.teaching_mode) && <p className="mb-3 text-xs text-muted-foreground">{tutor.price_min ? `₪${tutor.price_min}${tutor.price_max ? `–${tutor.price_max}` : "+"}` : ""}{tutor.price_min && tutor.teaching_mode ? " · " : ""}{tutor.teaching_mode?.replace("_", " ")}</p>}<WhatsAppButton url={whatsappUrl} /></Card>; }
function HelperCard({ helper, whatsappUrl }) { return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><HelpCircle className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground">{helper.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{helper.bio || helper.field_of_study}</p><div className="my-4 flex flex-wrap gap-1.5">{helper.help_topics?.slice(0, 4).map((topic) => <span key={topic} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{topic}</span>)}</div><WhatsAppButton url={whatsappUrl} /></Card>; }
function ResourceCard({ resource, locale }) { const title = localizedField(resource, "title", locale); const description = localizedField(resource, "description", locale) || localizedField(resource, "situation", locale); const url = resource.official_url || resource.source_url; return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Official</span></div><p className="mt-4 text-xs font-semibold text-primary">{resource.category?.replaceAll("_", " ")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{title}</h2><p className="mt-1 line-clamp-3 text-sm text-muted-foreground" dir="auto">{description}</p>{url && <a href={url} target="_blank" rel="noreferrer" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:border-primary/40">Open source<ExternalLink className="h-4 w-4" /></a>}</Card>; }
