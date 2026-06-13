import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { BookOpenCheck, CalendarDays, Check, Clock, Coffee, Dumbbell, ExternalLink, Gamepad2, GraduationCap, HelpCircle, Languages, MapPin, MessageCircle, Music2, Search, ShieldCheck, Star, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { localizedField, parseDate } from "@/lib/productUtils";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const eventIcons = { sports: Dumbbell, gaming: Gamepad2, music: Music2, social: Coffee, study_marathon: BookOpenCheck, other: Users };
const tabAliases = { study: "sessions", teachers: "tutors", mentors: "helpers", guides: "resources" };

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
  const [data, setData] = useState({ events: [], eventMembers: [], groups: [], groupMembers: [], sessions: [], sessionMembers: [], tutors: [], helpers: [], guides: [], links: [] });
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [requestForm, setRequestForm] = useState({ subject: "", preferred_datetime: "", teaching_mode: "either", message: "" });
  const [helperForm, setHelperForm] = useState({ topic: "", message: "" });
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => setTab(requestedTab), [requestedTab]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.list("-created_date", 500)),
      safeQuery(base44.entities.StudyGroup.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.StudyGroupMember.list("-created_date", 500)),
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.list("-created_date", 500)),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true, is_approved: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
      safeQuery(base44.entities.Guide.filter({ is_published: true })),
      safeQuery(base44.entities.HelpfulLink.filter({ is_published: true })),
    ]).then(([events, eventMembers, groups, groupMembers, sessions, sessionMembers, tutors, helpers, guides, links]) => {
      if (!active) return;
      const allowBguDemo = !university?.name || /Ben-Gurion|בן-גוריון|بن غوريون/i.test(university.name);
      const forUniversity = (items) => (items || []).filter((item) => !item.university_id || item.university_id === profile.university_id);
      setData({
        events: allowBguDemo ? withDemoFallback(events, demoContent.events) : events || [], eventMembers: eventMembers || [],
        groups: groups || [], groupMembers: groupMembers || [], sessions: allowBguDemo ? withDemoFallback(sessions, demoContent.sessions) : sessions || [], sessionMembers: sessionMembers || [],
        tutors: allowBguDemo ? withDemoFallback(tutors, demoContent.tutors) : tutors || [], helpers: allowBguDemo ? withDemoFallback(helpers, demoContent.helpers) : helpers || [],
        guides: allowBguDemo ? withDemoFallback(forUniversity(guides), demoContent.guides) : forUniversity(guides), links: allowBguDemo ? withDemoFallback(forUniversity(links), demoContent.links) : forUniversity(links),
      });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, university?.name]);

  const tabs = [["social", p("discover_social"), Users], ["sessions", p("discover_sessions"), BookOpenCheck], ["groups", p("discover_groups"), Languages], ["tutors", p("discover_tutors"), GraduationCap], ["helpers", p("discover_helpers"), HelpCircle], ["resources", locale === "he" ? "משאבים" : locale === "ar" ? "المصادر" : "Resources", ShieldCheck]];
  const myEventIds = new Set(data.eventMembers.filter((item) => item.user_id === user?.id && item.status !== "rejected").map((item) => item.event_id));
  const myGroupIds = new Set(data.groupMembers.filter((item) => item.user_id === user?.id).map((item) => item.group_id));
  const mySessionIds = new Set(data.sessionMembers.filter((item) => item.user_id === user?.id).map((item) => item.session_id));
  const normalizedQuery = query.trim().toLowerCase();
  const includesQuery = (...values) => !normalizedQuery || values.flat().filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);

  const view = useMemo(() => {
    const now = new Date();
    return {
      events: data.events.filter((item) => { const date = parseDate(`${item.date}T${item.start_time || "12:00"}`); return date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.description, item.location, item.category); }).sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`)),
      sessions: data.sessions.filter((item) => { const date = parseDate(item.session_date); return date && date >= now && item.status !== "canceled" && includesQuery(item.title, item.course_name, item.location, item.preferred_language); }).sort((a, b) => (a.session_date || "").localeCompare(b.session_date || "")),
      groups: data.groups.filter((item) => includesQuery(item.name, item.course_name, item.description, item.preferred_language)),
      tutors: data.tutors.filter((item) => includesQuery(item.display_name, item.subjects, item.languages, item.bio, item.teaching_mode)),
      helpers: data.helpers.filter((item) => includesQuery(item.display_name, item.help_topics, item.field_of_study, item.bio, item.languages)),
      resources: [...data.guides.map((item) => ({ ...item, resourceType: "guide" })), ...data.links.map((item) => ({ ...item, resourceType: "link" }))].filter((item) => includesQuery(localizedField(item, "title", locale), localizedField(item, "description", locale), localizedField(item, "content", locale), item.category)),
    };
  }, [data, normalizedQuery, locale]);

  async function addCalendar(sourceType, sourceId, title, startsAt, notes) {
    const existing = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId }));
    if (!existing.length) await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: sourceType, source_id: sourceId, title, starts_at: startsAt, notes, status: "active", completed: false });
  }
  async function removeCalendar(sourceId) { const items = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_id: sourceId })); await Promise.all(items.map((item) => base44.entities.CalendarItem.delete(item.id))); }
  async function joinEvent(event) { const approved = data.eventMembers.filter((item) => item.event_id === event.id && item.status === "approved").length; if (approved >= (event.max_spots || Infinity)) return; const membership = await base44.entities.SocialEventMember.create({ event_id: event.id, user_id: user.id, status: "approved" }); setData((current) => ({ ...current, eventMembers: [...current.eventMembers, membership] })); await addCalendar("social_activity", event.id, event.title, `${event.date}T${event.start_time || "12:00"}`, event.location); }
  async function leaveEvent(eventId) { const membership = data.eventMembers.find((item) => item.event_id === eventId && item.user_id === user.id); if (!membership) return; await base44.entities.SocialEventMember.delete(membership.id); setData((current) => ({ ...current, eventMembers: current.eventMembers.filter((item) => item.id !== membership.id) })); await removeCalendar(eventId); }
  async function joinSession(session) { if (mySessionIds.has(session.id)) return; const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, user_id: user.id }); setData((current) => ({ ...current, sessionMembers: [...current.sessionMembers, membership] })); await addCalendar("study_session", session.id, session.title || session.course_name || "Study session", session.session_date, session.location); }
  async function leaveSession(sessionId) { const membership = data.sessionMembers.find((item) => item.session_id === sessionId && item.user_id === user.id); if (!membership) return; await base44.entities.StudySessionMember.delete(membership.id); setData((current) => ({ ...current, sessionMembers: current.sessionMembers.filter((item) => item.id !== membership.id) })); await removeCalendar(sessionId); }
  async function joinGroup(groupId) { if (myGroupIds.has(groupId)) return; const membership = await base44.entities.StudyGroupMember.create({ group_id: groupId, user_id: user.id, role: "Member" }); setData((current) => ({ ...current, groupMembers: [...current.groupMembers, membership] })); }
  async function leaveGroup(groupId) { const membership = data.groupMembers.find((item) => item.group_id === groupId && item.user_id === user.id); if (!membership) return; await base44.entities.StudyGroupMember.delete(membership.id); setData((current) => ({ ...current, groupMembers: current.groupMembers.filter((item) => item.id !== membership.id) })); }
  function openTutor(tutor) { setSelectedTutor(tutor); setRequestSent(false); setRequestForm({ subject: tutor.subjects?.[0] || "", preferred_datetime: "", teaching_mode: "either", message: "" }); }
  async function sendTutorRequest() { if (!requestForm.subject || !selectedTutor) return; setRequesting(true); await base44.entities.TutorRequest.create({ student_user_id: user.id, tutor_id: selectedTutor.id, tutor_user_id: selectedTutor.user_id, ...requestForm, status: "pending" }); setRequesting(false); setRequestSent(true); }
  function openHelper(helper) { setSelectedHelper(helper); setRequestSent(false); setHelperForm({ topic: helper.help_topics?.[0] || "", message: "" }); }
  async function sendHelperRequest() { if (!helperForm.topic || !selectedHelper) return; setRequesting(true); await base44.entities.PeerHelpRequest.create({ requester_user_id: user.id, helper_user_id: selectedHelper.owner_user_id, helper_id: selectedHelper.id, ...helperForm, status: "pending" }); setRequesting(false); setRequestSent(true); }

  const activeItems = view[tab] || [];
  return (
    <PageLayout wide>
      <header className="mb-6 max-w-2xl"><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("discover_title")}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("discover_body")}</p></header>
      <div className="sticky top-16 z-30 -mx-4 mb-5 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={p("discover_search")} className="h-11 ps-9" /></div><div className="no-scrollbar flex gap-1 overflow-x-auto rounded-md bg-muted p-1" role="tablist">{tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold", tab === key ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground")} role="tab" aria-selected={tab === key}><Icon className="h-4 w-4" />{label}</button>)}</div></div></div>
      {loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <SkeletonCard key={item} lines={3} />)}</div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tab === "social" && view.events.map((event) => <SocialCard key={event.id} event={event} members={data.eventMembers.filter((item) => item.event_id === event.id && item.status === "approved").length} joined={myEventIds.has(event.id)} onJoin={() => joinEvent(event)} onLeave={() => leaveEvent(event.id)} p={p} />)}
        {tab === "sessions" && view.sessions.map((session) => <SessionCard key={session.id} session={session} members={data.sessionMembers.filter((item) => item.session_id === session.id).length} joined={mySessionIds.has(session.id)} onJoin={() => joinSession(session)} onLeave={() => leaveSession(session.id)} p={p} />)}
        {tab === "groups" && view.groups.map((group) => <GroupCard key={group.id} group={group} memberCount={data.groupMembers.filter((item) => item.group_id === group.id).length} joined={myGroupIds.has(group.id)} onJoin={() => joinGroup(group.id)} onLeave={() => leaveGroup(group.id)} p={p} />)}
        {tab === "tutors" && view.tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} onRequest={() => openTutor(tutor)} p={p} />)}
        {tab === "helpers" && view.helpers.map((helper) => <HelperCard key={helper.id} helper={helper} onContact={() => openHelper(helper)} p={p} />)}
        {tab === "resources" && view.resources.map((resource) => <ResourceCard key={`${resource.resourceType}-${resource.id}`} resource={resource} locale={locale} />)}
      </div>}
      {!loading && activeItems.length === 0 && <EmptyState icon={Search} title={p("discover_empty")} message={p("discover_body")} />}

      {selectedTutor && <RequestModal title={selectedTutor.display_name} sent={requestSent} onClose={() => setSelectedTutor(null)}><Field label={p("subject")}><Input value={requestForm.subject} onChange={(event) => setRequestForm((form) => ({ ...form, subject: event.target.value }))} /></Field><Field label={p("preferred_time")}><Input type="datetime-local" value={requestForm.preferred_datetime} onChange={(event) => setRequestForm((form) => ({ ...form, preferred_datetime: event.target.value }))} /></Field><Field label={p("message")}><Textarea rows={4} value={requestForm.message} onChange={(event) => setRequestForm((form) => ({ ...form, message: event.target.value }))} /></Field><Button className="min-h-11 w-full" onClick={sendTutorRequest} disabled={!requestForm.subject || requesting}>{requesting ? p("pending") : p("send_request")}</Button></RequestModal>}
      {selectedHelper && <RequestModal title={selectedHelper.display_name} sent={requestSent} onClose={() => setSelectedHelper(null)}><Field label={locale === "he" ? "נושא" : locale === "ar" ? "الموضوع" : "Topic"}><Input value={helperForm.topic} onChange={(event) => setHelperForm((form) => ({ ...form, topic: event.target.value }))} /></Field><Field label={p("message")}><Textarea rows={4} value={helperForm.message} onChange={(event) => setHelperForm((form) => ({ ...form, message: event.target.value }))} /></Field><Button className="min-h-11 w-full" onClick={sendHelperRequest} disabled={!helperForm.topic || requesting}>{requesting ? p("pending") : p("send_request")}</Button></RequestModal>}
    </PageLayout>
  );
}

function Card({ children }) { return <article className="flex min-h-60 flex-col rounded-lg border border-border bg-card p-4">{children}</article>; }
function Meta({ icon: Icon, children }) { return <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{children}</span></span>; }
function ActionButton({ joined, disabled, onJoin, onLeave, p }) { return <button onClick={joined ? onLeave : onJoin} disabled={disabled} className={cn("mt-auto min-h-11 rounded-md px-3 text-sm font-semibold", joined ? "border border-border text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground", disabled && "cursor-not-allowed bg-muted text-muted-foreground")}>{joined ? p("leave") : disabled ? (p("full") || "Full") : p("join")}</button>; }
function SocialCard({ event, members, joined, onJoin, onLeave, p }) { const Icon = eventIcons[event.category] || Users; const full = members >= (event.max_spots || Infinity); return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400"><Icon className="h-5 w-5" /></span><Meta icon={Users}>{members}/{event.max_spots || "—"}</Meta></div><h2 className="mt-4 text-base font-bold text-foreground" dir="auto">{event.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{event.description}</p><div className="my-4 space-y-2"><Meta icon={CalendarDays}>{event.date}{event.start_time ? ` · ${event.start_time}` : ""}</Meta>{event.location && <Meta icon={MapPin}>{event.location}</Meta>}</div><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>; }
function SessionCard({ session, members, joined, onJoin, onLeave, p }) { const date = parseDate(session.session_date); const full = members >= (session.max_spots || Infinity); return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><BookOpenCheck className="h-5 w-5" /></span><Meta icon={Users}>{members}/{session.max_spots || "—"}</Meta></div><p className="mt-4 text-xs font-semibold text-primary">{session.course_name || p("discover_sessions")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{session.title || p("home_session")}</h2><div className="my-4 space-y-2">{date && <Meta icon={Clock}>{format(date, "EEE, MMM d · HH:mm")}</Meta>}{session.location && <Meta icon={MapPin}>{session.location}</Meta>}{session.preferred_language && <Meta icon={Languages}>{session.preferred_language}</Meta>}</div><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>; }
function GroupCard({ group, memberCount, joined, onJoin, onLeave, p }) { const full = memberCount >= (group.max_members || Infinity); return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Users className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground" dir="auto">{group.name}</h2><p className="mt-1 text-sm text-muted-foreground" dir="auto">{group.course_name || group.description}</p><div className="my-4 flex flex-wrap gap-4"><Meta icon={Users}>{memberCount}/{group.max_members || "—"}</Meta>{group.preferred_language && <Meta icon={Languages}>{group.preferred_language}</Meta>}</div><ActionButton joined={joined} disabled={!joined && full} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>; }
function TutorCard({ tutor, onRequest, p }) { return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400"><GraduationCap className="h-5 w-5" /></span>{tutor.rating_count > 0 && <Meta icon={Star}>{Number(tutor.rating_avg || 0).toFixed(1)}</Meta>}</div><h2 className="mt-4 text-base font-bold text-foreground">{tutor.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{tutor.bio}</p><div className="my-4 flex flex-wrap gap-1.5">{tutor.subjects?.slice(0, 4).map((subject) => <span key={subject} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{subject}</span>)}</div>{(tutor.price_min || tutor.teaching_mode) && <p className="mb-3 text-xs text-muted-foreground">{tutor.price_min ? `₪${tutor.price_min}${tutor.price_max ? `–${tutor.price_max}` : "+"}` : ""}{tutor.price_min && tutor.teaching_mode ? " · " : ""}{tutor.teaching_mode?.replace("_", " ")}</p>}<button onClick={onRequest} className="mt-auto min-h-11 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">{p("request")}</button></Card>; }
function HelperCard({ helper, onContact, p }) { return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><HelpCircle className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground">{helper.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{helper.bio || helper.field_of_study}</p><div className="my-4 flex flex-wrap gap-1.5">{helper.help_topics?.slice(0, 4).map((topic) => <span key={topic} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{topic}</span>)}</div><button onClick={onContact} className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"><MessageCircle className="h-4 w-4" />{p("contact")}</button></Card>; }
function ResourceCard({ resource, locale }) { const title = localizedField(resource, "title", locale); const description = localizedField(resource, "description", locale) || localizedField(resource, "situation", locale); const url = resource.official_url || resource.source_url; return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Official</span></div><p className="mt-4 text-xs font-semibold text-primary">{resource.category?.replaceAll("_", " ")}</p><h2 className="mt-1 text-base font-bold text-foreground" dir="auto">{title}</h2><p className="mt-1 line-clamp-3 text-sm text-muted-foreground" dir="auto">{description}</p>{url && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:border-primary/40">Open source<ExternalLink className="h-4 w-4" /></a>}</Card>; }
function RequestModal({ title, sent, onClose, children }) { return <Modal title={title} onClose={onClose}>{sent ? <div className="py-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-5 w-5" /></span><p className="mt-3 font-semibold text-foreground">Request sent</p></div> : <div className="space-y-4">{children}</div>}</Modal>; }
function Field({ label, children }) { return <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>{children}</div>; }
