import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  BookOpenCheck,
  CalendarDays,
  Clock,
  Coffee,
  Dumbbell,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  HelpCircle,
  Languages,
  MapPin,
  MessageCircle,
  Music2,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { localizedField, parseDate } from "@/lib/productUtils";
import { activeCourseNames } from "@/lib/profileCourses";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { domainTones } from "@/lib/domainTones";
import {
  countParticipants,
  filterMembershipsForUniversity,
  joinedIdsFromState,
  mergeRecordsById,
  participantSnapshot,
  sortSocialEventsByInterests,
  uniqueParticipants,
} from "@/lib/communityMatching";
import PageLayout from "@/components/layout/PageLayout";
import { useCreateAction } from "@/components/elysium/CreateActionProvider";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const eventIcons = {
  sports: Dumbbell,
  gaming: Gamepad2,
  music: Music2,
  social: Coffee,
  study_marathon: BookOpenCheck,
  other: Users,
};

const tabAliases = { study: "sessions", groups: "sessions", teachers: "tutors", mentors: "helpers", guides: "resources" };
const FIND_PROMPT = "Didn't find what you are looking for? Why not make one yourself!";

function safeQuery(promise) {
  return Promise.race([promise.catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), 7000))]);
}

export default function DiscoverPage() {
  const { user, profile, university } = useProfile();
  const { locale } = useLanguage();
  const { openCreateAction } = useCreateAction();
  const p = (key) => productText(locale, key);
  const location = useLocation();
  const rawTab = new URLSearchParams(location.search).get("tab") || "social";
  const requestedTab = tabAliases[rawTab] || rawTab;
  const [tab, setTab] = useState(requestedTab);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState({ events: [], eventMembers: [], sessions: [], sessionMembers: [], calendarItems: [], tutors: [], helpers: [], guides: [], links: [] });

  useEffect(() => setTab(requestedTab), [requestedTab]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id })),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true, is_approved: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
      safeQuery(base44.entities.Guide.filter({ is_published: true })),
      safeQuery(base44.entities.HelpfulLink.filter({ is_published: true })),
    ]).then(([events, eventMembers, ownEventMembers, sessions, sessionMembers, ownSessionMembers, calendarItems, tutors, helpers, guides, links]) => {
      if (!active) return;
      const allowBguDemo = !university?.name || /Ben-Gurion/i.test(university.name);
      const forUniversity = (items) => (items || []).filter((item) => !item.university_id || item.university_id === profile.university_id);
      setData({
        events: events || [],
        eventMembers: filterMembershipsForUniversity(mergeRecordsById(eventMembers, ownEventMembers), profile.university_id),
        sessions: sessions || [],
        sessionMembers: filterMembershipsForUniversity(mergeRecordsById(sessionMembers, ownSessionMembers), profile.university_id),
        calendarItems: calendarItems || [],
        tutors: allowBguDemo ? withDemoFallback(tutors, demoContent.tutors) : tutors || [],
        helpers: allowBguDemo ? withDemoFallback(helpers, demoContent.helpers) : helpers || [],
        guides: allowBguDemo ? withDemoFallback(forUniversity(guides), demoContent.guides) : forUniversity(guides),
        links: allowBguDemo ? withDemoFallback(forUniversity(links), demoContent.links) : forUniversity(links),
      });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, university?.name]);

  useEffect(() => {
    const handleCreated = (event) => {
      const detail = event.detail;
      if (!detail) return;
      setData((current) => ({
        ...current,
        calendarItems: detail.calendarItem ? mergeRecordsById(current.calendarItems, [detail.calendarItem]) : current.calendarItems,
        events: detail.type === "social" ? [detail.event, ...current.events.filter((item) => item.id !== detail.event.id)] : current.events,
        eventMembers: detail.type === "social" && detail.membership ? mergeRecordsById(current.eventMembers, [detail.membership]) : current.eventMembers,
        sessions: detail.type === "study" ? [detail.session, ...current.sessions.filter((item) => item.id !== detail.session.id)] : current.sessions,
        sessionMembers: detail.type === "study" && detail.membership ? mergeRecordsById(current.sessionMembers, [detail.membership]) : current.sessionMembers,
      }));
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, []);

  const tabs = [
    ["social", p("discover_social"), Users],
    ["sessions", p("discover_groups"), BookOpenCheck],
    ["tutors", p("discover_tutors"), GraduationCap],
    ["helpers", p("discover_helpers"), HelpCircle],
    ["resources", "Resources", ShieldCheck],
  ];

  const myEventIds = useMemo(() => joinedIdsFromState({
    memberships: data.eventMembers,
    calendarItems: data.calendarItems,
    idField: "event_id",
    userId: user?.id,
    sourceType: "social_activity",
  }), [data.eventMembers, data.calendarItems, user?.id]);

  const mySessionIds = useMemo(() => joinedIdsFromState({
    memberships: data.sessionMembers,
    calendarItems: data.calendarItems,
    idField: "session_id",
    userId: user?.id,
    sourceType: "study_session",
  }), [data.sessionMembers, data.calendarItems, user?.id]);
  const socialParticipantsFor = (eventId) => uniqueParticipants(data.eventMembers, "event_id", eventId);
  const studyParticipantsFor = (sessionId) => uniqueParticipants(data.sessionMembers, "session_id", sessionId);

  const courses = activeCourseNames(profile).map((course) => course.toLocaleLowerCase("en"));
  const normalizedQuery = query.trim().toLowerCase();
  const includesQuery = (...values) => !normalizedQuery || values.flat().filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
  const selectedInterests = useMemo(() => profile?.interests || [], [profile?.interests]);

  const view = useMemo(() => {
    const now = new Date();
    const courseSet = new Set(courses);
    return {
      events: sortSocialEventsByInterests(data.events.filter((item) => {
        const date = parseDate(`${item.date}T${item.start_time || "12:00"}`);
        return date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.description, item.location, item.activity_name, item.category, item.preferred_language);
      }), selectedInterests),
      sessions: data.sessions.filter((item) => {
        const date = parseDate(item.session_date);
        const relevant = courseSet.has((item.course_name || "").toLocaleLowerCase("en")) || item.host_id === user?.id || mySessionIds.has(item.id);
        return relevant && date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.course_name, item.location, item.preferred_language);
      }).sort((a, b) => (a.session_date || "").localeCompare(b.session_date || "")),
      tutors: data.tutors.filter((item) => includesQuery(item.display_name, item.subjects, item.languages, item.bio, item.teaching_mode)),
      helpers: data.helpers.filter((item) => includesQuery(item.display_name, item.help_topics, item.field_of_study, item.bio, item.languages)),
      resources: [...data.guides.map((item) => ({ ...item, resourceType: "guide" })), ...data.links.map((item) => ({ ...item, resourceType: "link" }))].filter((item) => includesQuery(localizedField(item, "title", locale), localizedField(item, "description", locale), localizedField(item, "content", locale), item.category)),
    };
  }, [data, normalizedQuery, locale, courses.join("|"), user?.id, mySessionIds, selectedInterests]);

  async function addCalendar(sourceType, sourceId, title, startsAt, notes, courseName = "") {
    const existing = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId }));
    if (existing.length) return existing[0];
    return base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: sourceType, source_id: sourceId, course_name: courseName, title, starts_at: startsAt, notes, status: "active", completed: false });
  }

  async function removeCalendar(sourceId) {
    const items = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId }));
    await Promise.all(items.map((item) => base44.entities.CalendarItem.delete(item.id).catch(() => null)));
    return items;
  }

  async function joinEvent(event) {
    const approved = countParticipants(data.eventMembers, "event_id", event.id, myEventIds);
    if (myEventIds.has(event.id) || approved >= (event.max_spots || Infinity) || event.status === "canceled") return;
    setSaving(true);
    try {
      const membership = await base44.entities.SocialEventMember.create({ event_id: event.id, university_id: profile.university_id, owner_user_id: event.organizer_id, user_id: user.id, status: "approved", ...participantSnapshot({ profile, user }) });
      const calendarItem = await addCalendar("social_activity", event.id, event.title, `${event.date}T${event.start_time || "12:00"}`, event.location);
      setData((current) => ({ ...current, eventMembers: mergeRecordsById(current.eventMembers, [membership]), calendarItems: mergeRecordsById(current.calendarItems, [calendarItem]) }));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  async function leaveEvent(eventId) {
    const membership = data.eventMembers.find((item) => item.event_id === eventId && item.user_id === user.id);
    const calendarItem = data.calendarItems.find((item) => item.source_id === eventId);
    if (!membership && !calendarItem) return;
    setSaving(true);
    try {
      if (membership) await base44.entities.SocialEventMember.delete(membership.id);
      await removeCalendar(eventId);
      setData((current) => ({ ...current, eventMembers: current.eventMembers.filter((item) => item.id !== membership?.id && !(item.event_id === eventId && item.user_id === user.id)), calendarItems: current.calendarItems.filter((item) => item.source_id !== eventId) }));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  async function cancelEvent(event) {
    if (event.organizer_id !== user?.id) return;
    setSaving(true);
    try {
      await base44.entities.SocialEvent.update(event.id, { status: "canceled", is_open: false });
      await removeCalendar(event.id);
      setData((current) => ({
        ...current,
        events: current.events.map((item) => item.id === event.id ? { ...item, status: "canceled", is_open: false } : item),
        calendarItems: current.calendarItems.filter((item) => item.source_id !== event.id),
      }));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  async function joinSession(session) {
    if (mySessionIds.has(session.id) || session.status === "canceled") return;
    setSaving(true);
    try {
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, university_id: profile.university_id, owner_user_id: session.host_id, user_id: user.id, ...participantSnapshot({ profile, user }) });
      const calendarItem = await addCalendar("study_session", session.id, session.title || session.course_name || "Study group", session.session_date, session.location, session.course_name);
      setData((current) => ({ ...current, sessionMembers: mergeRecordsById(current.sessionMembers, [membership]), calendarItems: mergeRecordsById(current.calendarItems, [calendarItem]) }));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  async function leaveSession(sessionId) {
    const membership = data.sessionMembers.find((item) => item.session_id === sessionId && item.user_id === user.id);
    const calendarItem = data.calendarItems.find((item) => item.source_id === sessionId);
    if (!membership && !calendarItem) return;
    setSaving(true);
    try {
      if (membership) await base44.entities.StudySessionMember.delete(membership.id);
      await removeCalendar(sessionId);
      setData((current) => ({ ...current, sessionMembers: current.sessionMembers.filter((item) => item.id !== membership?.id && !(item.session_id === sessionId && item.user_id === user.id)), calendarItems: current.calendarItems.filter((item) => item.source_id !== sessionId) }));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  const activeItems = view[tab] || [];
  const emptyCopy = {
    title: p("discover_empty"),
    message: p("discover_body"),
    action: null,
  };
  const isActivityTab = tab === "social" || tab === "sessions";

  return (
    <PageLayout wide>
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("discover_title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("discover_body")}</p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-5 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={p("discover_search")} className="h-11 min-w-0 ps-9" />
          </div>
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1" role="tablist">
            {tabs.map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold", tab === key ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground")} role="tab" aria-selected={tab === key}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <SkeletonCard key={item} lines={3} />)}</div>
      ) : (
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tab === "social" && view.events.map((event) => <SocialCard key={event.id} event={event} members={countParticipants(data.eventMembers, "event_id", event.id, myEventIds)} joined={myEventIds.has(event.id)} onOpen={() => setSelected({ type: "social", item: event })} onJoin={() => joinEvent(event)} onLeave={() => leaveEvent(event.id)} p={p} />)}
          {tab === "social" && <CreatePromptCard tone="social" icon={Users} buttonLabel="Create social group" onClick={() => openCreateAction("social")} />}
          {tab === "sessions" && view.sessions.map((session) => <SessionCard key={session.id} session={session} members={countParticipants(data.sessionMembers, "session_id", session.id, mySessionIds)} joined={mySessionIds.has(session.id)} onOpen={() => setSelected({ type: "study", item: session })} onJoin={() => joinSession(session)} onLeave={() => leaveSession(session.id)} p={p} />)}
          {tab === "sessions" && <CreatePromptCard tone="study" icon={BookOpenCheck} buttonLabel="Start a study group" onClick={() => openCreateAction("study")} />}
          {tab === "tutors" && view.tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} whatsappUrl={tutor.contact_consent ? buildWhatsAppUrl(tutor.phone_number, `Hi ${tutor.display_name}, I found your tutor profile on Elysium and would like to ask about a lesson.`) : ""} />)}
          {tab === "helpers" && view.helpers.map((helper) => <HelperCard key={helper.id} helper={helper} whatsappUrl={helper.contact_consent && helper.contact_method === "whatsapp" ? buildWhatsAppUrl(helper.contact_value, `Hi ${helper.display_name}, I found your peer helper profile on Elysium and would like to ask for student help.`) : ""} />)}
          {tab === "resources" && view.resources.map((resource) => <ResourceCard key={`${resource.resourceType}-${resource.id}`} resource={resource} locale={locale} />)}
        </div>
      )}

      {!loading && activeItems.length === 0 && !isActivityTab && <EmptyState icon={Search} title={emptyCopy.title} message={emptyCopy.message} action={emptyCopy.action} />}

      {selected && (
        <DetailsModal
          selected={selected}
          user={user}
          profile={profile}
          onClose={() => setSelected(null)}
          joined={selected.type === "social" ? myEventIds.has(selected.item.id) : mySessionIds.has(selected.item.id)}
          members={selected.type === "social" ? countParticipants(data.eventMembers, "event_id", selected.item.id, myEventIds) : countParticipants(data.sessionMembers, "session_id", selected.item.id, mySessionIds)}
          participants={selected.type === "social" ? socialParticipantsFor(selected.item.id) : studyParticipantsFor(selected.item.id)}
          saving={saving}
          onJoin={() => selected.type === "social" ? joinEvent(selected.item) : joinSession(selected.item)}
          onLeave={() => selected.type === "social" ? leaveEvent(selected.item.id) : leaveSession(selected.item.id)}
          onCancel={() => cancelEvent(selected.item)}
          p={p}
        />
      )}
    </PageLayout>
  );
}

function Card({ children, tone }) {
  return <article className={cn("flex min-h-60 min-w-0 flex-col rounded-lg border border-border bg-card p-4", tone ? domainTones[tone].border : "")}>{children}</article>;
}

function CreatePromptCard({ tone, icon: Icon, buttonLabel, onClick }) {
  return (
    <Card tone={tone}>
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones[tone].icon)}>
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-bold text-foreground">{FIND_PROMPT}</h2>
      <Button size="sm" className="mt-auto self-start" onClick={onClick}>{buttonLabel}</Button>
    </Card>
  );
}

function Meta({ icon: Icon, children }) {
  return <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{children}</span></span>;
}

function ActionButton({ joined, disabled, onJoin, onLeave, p }) {
  return <button onClick={joined ? onLeave : onJoin} disabled={disabled} className={cn("mt-auto min-h-11 rounded-md px-3 text-sm font-semibold", joined ? "border border-border text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground", disabled && "cursor-not-allowed bg-muted text-muted-foreground")}>{joined ? p("leave") : disabled ? "Full" : p("join")}</button>;
}

function SocialCard({ event, members, joined, onOpen, onJoin, onLeave, p }) {
  const Icon = eventIcons[event.category] || Users;
  const full = members >= (event.max_spots || Infinity);
  return <Card tone="social"><button className="text-start" onClick={onOpen}><div className="flex items-start justify-between"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.social.icon)}><Icon className="h-5 w-5" /></span><Meta icon={Users}>{members}/{event.max_spots || "-"}</Meta></div><p className={cn("mt-4 text-xs font-semibold", domainTones.social.text)}>{event.activity_name || event.category}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{event.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{event.description}</p><div className="my-4 space-y-2"><Meta icon={CalendarDays}>{event.date}{event.start_time ? ` - ${event.start_time}` : ""}</Meta>{event.location && <Meta icon={MapPin}>{event.location}</Meta>}{event.preferred_language && <Meta icon={Languages}>{event.preferred_language}</Meta>}</div></button><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>;
}

function SessionCard({ session, members, joined, onOpen, onJoin, onLeave, p }) {
  const date = parseDate(session.session_date);
  const full = members >= (session.max_spots || Infinity);
  return <Card tone="study"><button className="text-start" onClick={onOpen}><div className="flex items-start justify-between"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.study.icon)}><BookOpenCheck className="h-5 w-5" /></span><Meta icon={Users}>{members}/{session.max_spots || "-"}</Meta></div><p className={cn("mt-4 text-xs font-semibold", domainTones.study.text)}>{session.is_marathon ? "Study marathon" : "Study group"} - {session.course_name || p("discover_groups")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{session.title || "Study group"}</h2><div className="my-4 space-y-2">{date && <Meta icon={Clock}>{format(date, "EEE, MMM d - HH:mm")}</Meta>}{session.location && <Meta icon={MapPin}>{session.location}</Meta>}{session.preferred_language && <Meta icon={Languages}>{session.preferred_language}</Meta>}</div></button><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>;
}

function WhatsAppButton({ url }) {
  return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 text-sm font-semibold text-[#062f18]"><MessageCircle className="h-4 w-4" />Open WhatsApp<ExternalLink className="h-3.5 w-3.5" /></a> : <button disabled className="mt-auto min-h-11 rounded-md bg-muted px-3 text-sm font-semibold text-muted-foreground">WhatsApp number unavailable</button>;
}

function TutorCard({ tutor, whatsappUrl }) {
  return <Card tone="tutor"><div className="flex items-start justify-between"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.tutor.icon)}><GraduationCap className="h-5 w-5" /></span>{tutor.rating_count > 0 && <Meta icon={Star}>{Number(tutor.rating_avg || 0).toFixed(1)}</Meta>}</div><h2 className="mt-4 text-base font-bold text-foreground">{tutor.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{tutor.bio}</p><div className="my-4 flex flex-wrap gap-1.5">{tutor.subjects?.slice(0, 4).map((subject) => <span key={subject} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{subject}</span>)}</div>{(tutor.price_min || tutor.teaching_mode) && <p className="mb-3 text-xs text-muted-foreground">{tutor.price_min ? `ILS ${tutor.price_min}${tutor.price_max ? `-${tutor.price_max}` : "+"}` : ""}{tutor.price_min && tutor.teaching_mode ? " - " : ""}{tutor.teaching_mode?.replace("_", " ")}</p>}<WhatsAppButton url={whatsappUrl} /></Card>;
}

function HelperCard({ helper, whatsappUrl }) {
  return <Card tone="helper"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.helper.icon)}><HelpCircle className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground">{helper.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{helper.bio || helper.field_of_study}</p><div className="my-4 flex flex-wrap gap-1.5">{helper.help_topics?.slice(0, 4).map((topic) => <span key={topic} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{topic}</span>)}</div><WhatsAppButton url={whatsappUrl} /></Card>;
}

function ResourceCard({ resource, locale }) {
  const title = localizedField(resource, "title", locale);
  const description = localizedField(resource, "description", locale) || localizedField(resource, "situation", locale);
  const url = resource.official_url || resource.source_url;
  return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300"><ShieldCheck className="h-5 w-5" /></span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Official</span></div><p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{resource.category?.replaceAll("_", " ")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{title}</h2><p className="mt-1 line-clamp-3 text-sm text-muted-foreground" dir="auto">{description}</p>{url && <a href={url} target="_blank" rel="noreferrer" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:border-primary/40">Open source<ExternalLink className="h-4 w-4" /></a>}</Card>;
}

function DetailsModal({ selected, user, profile, onClose, joined, members, participants, saving, onJoin, onLeave, onCancel, p }) {
  const item = selected.item;
  const social = selected.type === "social";
  const isCreator = social ? item.organizer_id === user?.id : item.host_id === user?.id;
  const isFull = members >= (item.max_spots || Infinity);
  const creatorName = social ? item.organizer_name || (item.organizer_id === user?.id ? profile?.preferred_name || user?.full_name : "Campus student") : item.host_name || (item.host_id === user?.id ? profile?.preferred_name || user?.full_name : "Campus student");
  const creatorDetails = social ? [item.organizer_academic_year, item.organizer_field_of_study] : [item.host_academic_year, item.host_field_of_study];
  return (
    <Modal title={item.title || "Study group"} onClose={onClose}>
      <div className="space-y-4" dir="auto">
        <p className={cn("text-xs font-semibold", domainTones[social ? "social" : "study"].text)}>
          {social ? item.activity_name || item.category : `${item.is_marathon ? "Study marathon" : "Study group"} - ${item.course_name}`}
          {item.preferred_language ? ` - ${item.preferred_language}` : ""}
        </p>
        {(item.description || item.notes) && <p className="text-sm leading-relaxed text-muted-foreground">{item.description || item.notes}</p>}
        <div className="rounded-md border border-border p-3">
          <p className="text-xs font-semibold text-muted-foreground">{social ? "Created by" : "Hosted by"}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{creatorName}</p>
          {creatorDetails.some(Boolean) && <p className="mt-1 text-xs text-muted-foreground">{creatorDetails.filter(Boolean).join(" - ")}</p>}
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
          <p>{social ? `${item.date}${item.start_time ? `, ${item.start_time}` : ""}` : new Date(item.session_date).toLocaleString()}</p>
          {item.location && <p className="mt-1 text-muted-foreground">{item.location}</p>}
          <p className="mt-1 text-muted-foreground">{members} of {item.max_spots || "unlimited"} spots</p>
        </div>
        <ParticipantList participants={participants} user={user} profile={profile} />
        {isCreator && social ? (
          <Button variant="destructive" className="w-full" disabled={saving || item.status === "canceled"} onClick={onCancel}>
            <X className="me-2 h-4 w-4" />Cancel activity
          </Button>
        ) : joined ? (
          <Button variant="outline" className="w-full" disabled={saving} onClick={onLeave}>{p("leave")}</Button>
        ) : (
          <Button className="w-full" disabled={saving || item.status === "canceled" || isFull || String(item.id).startsWith("demo-")} onClick={onJoin}>
            {isFull ? "Full" : p("join")}
          </Button>
        )}
        {String(item.id).startsWith("demo-") && <p className="text-center text-xs text-muted-foreground">Demo preview. Seed it to Base44 before the live demo to enable joining.</p>}
      </div>
    </Modal>
  );
}

function ParticipantList({ participants = [], user, profile }) {
  return (
    <section className="rounded-md border border-border p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signed-up students</h3>
      {participants.length ? (
        <div className="mt-3 space-y-2">
          {participants.map((member) => (
            <div key={member.user_id || member.id} className="rounded-md bg-muted/40 p-3">
              <p className="text-sm font-semibold text-foreground">{participantName(member, user, profile)}</p>
              {participantMeta(member) && <p className="mt-1 text-xs text-muted-foreground">{participantMeta(member)}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No one has signed up yet.</p>
      )}
    </section>
  );
}

function participantName(member, user, profile) {
  if (member.participant_name) return member.participant_name;
  if (member.user_id === user?.id) return profile?.preferred_name || user?.full_name || "You";
  return "Campus student";
}

function participantMeta(member) {
  return [member.participant_academic_year, member.participant_field_of_study].filter(Boolean).join(" - ");
}
