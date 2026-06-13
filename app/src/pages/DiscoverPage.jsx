import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { format, isAfter, isValid, parseISO, startOfDay } from "date-fns";
import {
  BookOpenCheck, CalendarDays, Check, Clock, Coffee, Gamepad2, GraduationCap,
  HelpCircle, Languages, Mail, MapPin, MessageCircle, Music2, Search, Star,
  Users, Dumbbell,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const eventIcons = { sports: Dumbbell, gaming: Gamepad2, music: Music2, social: Coffee, study_marathon: BookOpenCheck, other: Users };

function safeQuery(promise, timeout = 7000) {
  return Promise.race([promise.catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), timeout))]);
}

export default function DiscoverPage() {
  const { user, profile } = useProfile();
  const { locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const location = useLocation();
  const requestedTab = new URLSearchParams(location.search).get("tab") || "social";
  const [tab, setTab] = useState(requestedTab === "study" ? "sessions" : requestedTab);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ events: [], eventMemberships: [], groups: [], allGroupMemberships: [], sessions: [], tutors: [], helpers: [] });
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [requestForm, setRequestForm] = useState({ subject: "", preferred_datetime: "", message: "" });
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    setTab(requestedTab === "study" ? "sessions" : requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudyGroup.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.StudyGroupMember.list("-created_date", 500)),
      safeQuery(base44.entities.StudySession.list("session_date", 200)),
      safeQuery(base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.PeerHelper.filter({ university_id: profile.university_id, is_visible: true })),
    ]).then(([events, eventMemberships, groups, allGroupMemberships, sessions, tutors, helpers]) => {
      if (!active) return;
      const groupIds = new Set((groups || []).map((group) => group.id));
      setData({ events: events || [], eventMemberships: eventMemberships || [], groups: groups || [], allGroupMemberships: allGroupMemberships || [], sessions: (sessions || []).filter((session) => groupIds.has(session.group_id)), tutors: tutors || [], helpers: helpers || [] });
    }).catch(console.error).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id]);

  const tabs = [
    ["social", p("discover_social"), Users],
    ["sessions", p("discover_sessions"), BookOpenCheck],
    ["groups", p("discover_groups"), Languages],
    ["tutors", p("discover_tutors"), GraduationCap],
    ["helpers", p("discover_helpers"), HelpCircle],
  ];
  const eventMembershipIds = new Set(data.eventMemberships.map((item) => item.event_id));
  const myGroupMemberships = data.allGroupMemberships.filter((item) => item.user_id === user?.id);
  const myGroupIds = new Set(myGroupMemberships.map((item) => item.group_id));
  const normalizedQuery = query.trim().toLowerCase();
  const includesQuery = (...values) => !normalizedQuery || values.flat().filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);

  const view = useMemo(() => {
    const today = startOfDay(new Date());
    const events = data.events.filter((item) => {
      const date = parseISO(item.date || "");
      return isValid(date) && (isAfter(date, today) || +date === +today) && includesQuery(item.title, item.description, item.location, item.category);
    }).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const sessions = data.sessions.filter((item) => includesQuery(item.title, item.location, data.groups.find((group) => group.id === item.group_id)?.name)).sort((a, b) => (a.session_date || "").localeCompare(b.session_date || ""));
    const groups = data.groups.filter((item) => includesQuery(item.name, item.course_name, item.description, item.preferred_language));
    const tutors = data.tutors.filter((item) => includesQuery(item.display_name, item.subjects, item.bio));
    const helpers = data.helpers.filter((item) => includesQuery(item.display_name, item.help_topics, item.field_of_study, item.bio, item.languages));
    return { events, sessions, groups, tutors, helpers };
  }, [data, normalizedQuery]);

  const joinEvent = async (eventId) => {
    const membership = await base44.entities.SocialEventMember.create({ event_id: eventId, user_id: user.id, status: "approved" });
    setData((current) => ({ ...current, eventMemberships: [...current.eventMemberships, membership] }));
  };
  const leaveEvent = async (eventId) => {
    const membership = data.eventMemberships.find((item) => item.event_id === eventId);
    if (!membership) return;
    await base44.entities.SocialEventMember.delete(membership.id);
    setData((current) => ({ ...current, eventMemberships: current.eventMemberships.filter((item) => item.id !== membership.id) }));
  };
  const joinGroup = async (groupId) => {
    if (myGroupIds.has(groupId)) return;
    const membership = await base44.entities.StudyGroupMember.create({ group_id: groupId, user_id: user.id, role: "Member" });
    setData((current) => ({ ...current, allGroupMemberships: [...current.allGroupMemberships, membership] }));
  };
  const leaveGroup = async (groupId) => {
    const membership = myGroupMemberships.find((item) => item.group_id === groupId);
    if (!membership) return;
    await base44.entities.StudyGroupMember.delete(membership.id);
    setData((current) => ({ ...current, allGroupMemberships: current.allGroupMemberships.filter((item) => item.id !== membership.id) }));
  };
  const openTutor = (tutor) => {
    setSelectedTutor(tutor);
    setRequestSent(false);
    setRequestForm({ subject: tutor.subjects?.[0] || "", preferred_datetime: "", message: "" });
  };
  const sendTutorRequest = async () => {
    if (!requestForm.subject || !selectedTutor || !user?.id) return;
    setRequesting(true);
    await base44.entities.TutorRequest.create({ student_user_id: user.id, tutor_id: selectedTutor.id, ...requestForm, status: "pending" });
    setRequesting(false);
    setRequestSent(true);
  };
  const contactHelper = (helper) => {
    if (!helper.contact_consent || !helper.contact_value) return;
    if (helper.contact_method === "email") window.location.href = `mailto:${helper.contact_value}`;
    else if (helper.contact_method === "whatsapp") window.open(`https://wa.me/${helper.contact_value.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer");
  };

  return (
    <PageLayout wide>
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("discover_title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("discover_body")}</p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-5 border-y border-border bg-background/94 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={p("discover_search")} className="h-10 ps-9" />
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-md bg-muted p-1" role="tablist">
            {tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={cn("flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold", tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} role="tab" aria-selected={tab === key}><Icon className="h-4 w-4" />{label}</button>)}
          </div>
        </div>
      </div>

      {loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <SkeletonCard key={item} lines={3} />)}</div> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tab === "social" && view.events.map((event) => <SocialCard key={event.id} event={event} joined={eventMembershipIds.has(event.id)} onJoin={() => joinEvent(event.id)} onLeave={() => leaveEvent(event.id)} p={p} />)}
          {tab === "sessions" && view.sessions.map((session) => <SessionCard key={session.id} session={session} group={data.groups.find((group) => group.id === session.group_id)} joined={myGroupIds.has(session.group_id)} onJoin={() => joinGroup(session.group_id)} p={p} />)}
          {tab === "groups" && view.groups.map((group) => <GroupCard key={group.id} group={group} memberCount={data.allGroupMemberships.filter((item) => item.group_id === group.id).length} joined={myGroupIds.has(group.id)} onJoin={() => joinGroup(group.id)} onLeave={() => leaveGroup(group.id)} p={p} />)}
          {tab === "tutors" && view.tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} onRequest={() => openTutor(tutor)} p={p} />)}
          {tab === "helpers" && view.helpers.map((helper) => <HelperCard key={helper.id} helper={helper} onContact={() => contactHelper(helper)} p={p} />)}
        </div>
      )}
      {!loading && view[{ social: "events", sessions: "sessions", groups: "groups", tutors: "tutors", helpers: "helpers" }[tab]]?.length === 0 && <EmptyState icon={Search} title={p("discover_empty")} message={p("discover_body")} />}

      {selectedTutor && <Modal title={selectedTutor.display_name} onClose={() => setSelectedTutor(null)}>
        {requestSent ? <div className="py-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-5 w-5" /></span><p className="mt-3 font-semibold text-foreground">{p("request_sent")}</p></div> : <div className="space-y-4">
          <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{p("subject")}</label><Input value={requestForm.subject} onChange={(event) => setRequestForm((form) => ({ ...form, subject: event.target.value }))} /></div>
          <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{p("preferred_time")}</label><Input type="datetime-local" value={requestForm.preferred_datetime} onChange={(event) => setRequestForm((form) => ({ ...form, preferred_datetime: event.target.value }))} /></div>
          <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{p("message")}</label><Textarea rows={4} value={requestForm.message} onChange={(event) => setRequestForm((form) => ({ ...form, message: event.target.value }))} /></div>
          <Button className="w-full" onClick={sendTutorRequest} disabled={!requestForm.subject || requesting}>{requesting ? p("pending") : p("send_request")}</Button>
        </div>}
      </Modal>}
    </PageLayout>
  );
}

function Card({ children }) { return <article className="flex min-h-56 flex-col rounded-lg border border-border bg-card p-4 shadow-sm">{children}</article>; }
function Meta({ icon: Icon, children }) { return <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{children}</span></span>; }
function ActionButton({ joined, onJoin, onLeave, p }) { return <button onClick={joined ? onLeave : onJoin} className={cn("mt-auto h-9 rounded-md px-3 text-sm font-semibold", joined ? "border border-border text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground hover:brightness-105")}>{joined ? p("leave") : p("join")}</button>; }

function SocialCard({ event, joined, onJoin, onLeave, p }) {
  const Icon = eventIcons[event.category] || Users;
  return <Card><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-400"><Icon className="h-5 w-5" /></span><span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", event.is_open === false ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")}>{event.is_open === false ? "Closed" : p("open")}</span></div><h2 className="mt-4 text-base font-bold text-foreground">{event.title}</h2>{event.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>}<div className="my-4 space-y-2"><Meta icon={CalendarDays}>{event.date}{event.start_time ? ` · ${event.start_time}` : ""}</Meta>{event.location && <Meta icon={MapPin}>{event.location}</Meta>}</div><ActionButton joined={joined} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>;
}
function SessionCard({ session, group, joined, onJoin, p }) {
  const date = parseISO(session.session_date || "");
  return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><BookOpenCheck className="h-5 w-5" /></span><p className="mt-4 text-xs font-semibold text-primary">{group?.name || p("discover_groups")}</p><h2 className="mt-1 text-base font-bold text-foreground">{session.title || p("home_session")}</h2><div className="my-4 space-y-2">{isValid(date) && <Meta icon={Clock}>{format(date, "EEE, MMM d · HH:mm")}</Meta>}{session.location && <Meta icon={MapPin}>{session.location}</Meta>}</div><button onClick={onJoin} disabled={joined} className={cn("mt-auto h-9 rounded-md px-3 text-sm font-semibold", joined ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground")}>{joined ? p("joined") : p("join")}</button></Card>;
}
function GroupCard({ group, memberCount, joined, onJoin, onLeave, p }) {
  return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Users className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground">{group.name}</h2><p className="mt-1 text-sm text-muted-foreground">{group.course_name || group.description}</p><div className="my-4 flex flex-wrap gap-x-4 gap-y-2"><Meta icon={Users}>{memberCount}/{group.max_members || "—"}</Meta>{group.preferred_language && <Meta icon={Languages}>{group.preferred_language}</Meta>}</div><ActionButton joined={joined} onJoin={onJoin} onLeave={onLeave} p={p} /></Card>;
}
function TutorCard({ tutor, onRequest, p }) {
  return <Card><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400"><GraduationCap className="h-5 w-5" /></span>{tutor.rating_count > 0 && <Meta icon={Star}>{Number(tutor.rating_avg || 0).toFixed(1)}</Meta>}</div><h2 className="mt-4 text-base font-bold text-foreground">{tutor.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tutor.bio || tutor.subjects?.join(" · ")}</p><div className="my-4 flex flex-wrap gap-1.5">{tutor.subjects?.slice(0, 4).map((subject) => <span key={subject} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{subject}</span>)}</div><button onClick={onRequest} className="mt-auto h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">{p("request")}</button></Card>;
}
function HelperCard({ helper, onContact, p }) {
  const canContact = helper.contact_consent && helper.contact_value && helper.contact_method !== "none";
  return <Card><span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><HelpCircle className="h-5 w-5" /></span><h2 className="mt-4 text-base font-bold text-foreground">{helper.display_name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{helper.bio || helper.field_of_study}</p><div className="my-4 flex flex-wrap gap-1.5">{helper.help_topics?.slice(0, 4).map((topic) => <span key={topic} className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{topic}</span>)}</div><button onClick={onContact} disabled={!canContact} className="mt-auto flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground">{helper.contact_method === "email" ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}{p("contact")}</button></Card>;
}
