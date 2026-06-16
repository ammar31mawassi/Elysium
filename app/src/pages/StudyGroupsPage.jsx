import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Check, MapPin, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { activeCourseNames } from "@/lib/profileCourses";
import { buildCourseOptions } from "@/lib/creationOptions";
import { domainTones } from "@/lib/domainTones";
import PageLayout from "@/components/layout/PageLayout";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Modal from "@/components/ui/Modal";
import SearchableChoice from "@/components/elysium/SearchableChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PARTICIPATION_FILTERS,
  countParticipants,
  filterMembershipsForUniversity,
  filterByParticipation,
  joinedIdsFromState,
  mergeRecordsById,
  participantSnapshot,
} from "@/lib/communityMatching";

const emptyForm = { title: "", course_name: "", preferred_language: "", session_date: "", end_time: "", location: "", notes: "", max_spots: 8, is_marathon: false };
const FIND_PROMPT = "didn't find what you are loking for? why not make one your self!";

function safeQuery(promise) {
  return promise.catch(() => []);
}

function asIso(value) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function StudyGroupsPage() {
  const location = useLocation();
  const { user, profile } = useProfile();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [participationFilter, setParticipationFilter] = useState(PARTICIPATION_FILTERS.all);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudySessionMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_type: "study_session" })),
    ]).then(([sessionRows, memberRows, ownMemberRows, calendarRows]) => {
      if (!active) return;
      setSessions(sessionRows || []);
      setMembers(filterMembershipsForUniversity(mergeRecordsById(memberRows, ownMemberRows), profile.university_id));
      setCalendarItems(calendarRows || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile?.university_id, user?.id]);

  useEffect(() => {
    const handleCreated = (event) => {
      const detail = event.detail;
      if (detail?.type !== "study") return;
      setSessions((current) => [detail.session, ...current.filter((item) => item.id !== detail.session.id && !String(item.id).startsWith("demo-"))]);
      if (detail.membership) setMembers((current) => mergeRecordsById(current, [detail.membership]));
      if (detail.calendarItem) setCalendarItems((current) => mergeRecordsById(current, [detail.calendarItem]));
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, []);

  const activeCourses = useMemo(() => activeCourseNames(profile), [profile]);
  const courseOptions = useMemo(() => buildCourseOptions(activeCourses), [activeCourses]);
  const myMemberships = useMemo(() => members.filter((item) => item.user_id === user?.id), [members, user?.id]);
  const mySessionIds = useMemo(() => joinedIdsFromState({
    memberships: members,
    calendarItems,
    idField: "session_id",
    userId: user?.id,
    sourceType: "study_session",
  }), [members, calendarItems, user?.id]);
  const memberCount = (sessionId) => countParticipants(members, "session_id", sessionId, mySessionIds);
  const visibleSessions = useMemo(() => {
    const activeSet = new Set(activeCourses.map((course) => course.toLocaleLowerCase("en")));
    const filtered = sessions
      .filter((session) => session.host_id === user?.id || mySessionIds.has(session.id) || activeSet.has((session.course_name || "").toLocaleLowerCase("en")));
    return filterByParticipation(filtered, mySessionIds, participationFilter)
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
  }, [activeCourses, sessions, user?.id, mySessionIds, participationFilter]);

  useEffect(() => {
    const requested = ["1", "session"].includes(new URLSearchParams(location.search).get("create"));
    setShowForm(requested && activeCourses.length > 0);
  }, [location.search, activeCourses.length]);

  const createGroup = async () => {
    if (!form.title || !activeCourses.includes(form.course_name) || !form.session_date || !user?.id || !profile?.university_id) return;
    setSaving(true);
    try {
      const session = await base44.entities.StudySession.create({
        ...form,
        university_id: profile.university_id,
        session_date: asIso(form.session_date),
        end_time: asIso(form.end_time),
        host_id: user.id,
        host_name: profile.preferred_name || user.full_name || "Student",
        host_academic_year: profile.academic_year || "",
        host_field_of_study: profile.field_of_study || "",
        status: "open",
      });
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, university_id: profile.university_id, owner_user_id: user.id, user_id: user.id, ...participantSnapshot({ profile, user }) });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "study_session", source_id: session.id, course_name: session.course_name, title: session.title, starts_at: session.session_date, ends_at: session.end_time, notes: session.location || "", status: "active" });
      setSessions((current) => [session, ...current.filter((item) => !String(item.id).startsWith("demo-"))]);
      setMembers((current) => mergeRecordsById(current, [membership]));
      setCalendarItems((current) => mergeRecordsById(current, [calendarItem]));
      setShowForm(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const joinGroup = async (session) => {
    if (!user?.id || mySessionIds.has(session.id) || memberCount(session.id) >= session.max_spots || String(session.id).startsWith("demo-")) return;
    setSaving(true);
    try {
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, university_id: profile.university_id, owner_user_id: session.host_id, user_id: user.id, ...participantSnapshot({ profile, user }) });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "study_session", source_id: session.id, course_name: session.course_name, title: session.title, starts_at: session.session_date, ends_at: session.end_time, notes: session.location || "", status: "active" });
      setMembers((current) => mergeRecordsById(current, [membership]));
      setCalendarItems((current) => mergeRecordsById(current, [calendarItem]));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const leaveGroup = async (session) => {
    const membership = myMemberships.find((item) => item.session_id === session.id);
    const calendarItem = calendarItems.find((item) => item.source_id === session.id);
    if (session.host_id === user?.id || (!membership && !calendarItem)) return;
    setSaving(true);
    try {
      if (membership) await base44.entities.StudySessionMember.delete(membership.id);
      if (calendarItem) await base44.entities.CalendarItem.delete(calendarItem.id);
      setMembers((current) => current.filter((item) => item.id !== membership?.id && !(item.session_id === session.id && item.user_id === user?.id)));
      setCalendarItems((current) => current.filter((item) => item.source_id !== session.id));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const cancelGroup = async (session) => {
    if (session.host_id !== user?.id) return;
    setSaving(true);
    try {
      await base44.entities.StudySession.update(session.id, { status: "canceled" });
      setSessions((current) => current.map((item) => item.id === session.id ? { ...item, status: "canceled" } : item));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-foreground sm:text-3xl">Study groups</h1><p className="mt-2 text-sm text-muted-foreground">One-time groups and marathons matched to your active courses.</p></div><div className="flex flex-wrap items-center gap-2"><ParticipationFilter value={participationFilter} onChange={setParticipationFilter} /><Button className="min-h-11 gap-2 self-start" onClick={() => setShowForm(true)} disabled={!activeCourses.length}><Plus className="h-4 w-4" />Create study group</Button></div></header>

      {!activeCourses.length && <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">Add an active course in <Link to="/me" className="font-semibold text-primary underline">Me</Link> before creating or discovering study groups.</div>}

      {loading ? <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={3} />)}</div> : visibleSessions.length === 0 ? <EmptyState icon={BookOpenCheck} title="No study groups yet." message="Why not be the first to start one." action={<Button size="sm" onClick={() => setShowForm(true)}>Start a study group</Button>} /> : <div className="grid gap-3 md:grid-cols-2">{visibleSessions.map((session) => {
        const joined = mySessionIds.has(session.id);
        const count = memberCount(session.id);
        return <button key={session.id} onClick={() => setSelected(session)} className={cn("rounded-lg border border-border bg-card p-4 text-start", domainTones.study.border)}><div className="flex items-start gap-3"><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", domainTones.study.icon)}><BookOpenCheck className="h-5 w-5" /></span><div className="min-w-0 flex-1" dir="auto"><div className="flex justify-between gap-3"><h2 className="font-semibold text-foreground">{session.title}</h2><span className={cn("shrink-0 text-xs font-semibold", session.status === "canceled" ? "text-destructive" : "text-emerald-600")}>{session.status === "canceled" ? "Canceled" : joined ? "Joined" : "Open"}</span></div><p className={cn("mt-1 text-xs font-semibold", domainTones.study.text)}>{session.is_marathon ? "Study marathon" : "Study group"} · {session.course_name}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" />{new Date(session.session_date).toLocaleString()}</p>{session.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{session.location}</p>}{session.preferred_language && <p className="mt-1 text-xs text-muted-foreground">Preferred language: {session.preferred_language}</p>}<p className="mt-2 text-xs text-muted-foreground">{count} / {session.max_spots} joined</p></div></div></button>;
      })}<CreateStudyPrompt onClick={() => setShowForm(true)} /></div>}

      {selected && <Modal title={selected.title} onClose={() => setSelected(null)}><div className="space-y-4" dir="auto"><p className={cn("text-xs font-semibold", domainTones.study.text)}>{selected.is_marathon ? "Study marathon" : "Study group"} · {selected.course_name}{selected.preferred_language ? ` · ${selected.preferred_language}` : ""}</p><p className="text-sm text-muted-foreground">{selected.notes || "Bring the material you want to work on."}</p><div className="rounded-md border border-border p-3"><p className="text-xs font-semibold text-muted-foreground">Hosted by</p><p className="mt-1 text-sm font-semibold text-foreground">{selected.host_name || (selected.host_id === user?.id ? profile?.preferred_name || user?.full_name : "Campus student")}</p>{(selected.host_academic_year || selected.host_field_of_study) && <p className="mt-1 text-xs text-muted-foreground">{[selected.host_academic_year, selected.host_field_of_study].filter(Boolean).join(" · ")}</p>}</div><div className="rounded-md bg-muted/50 p-3 text-sm"><p>{new Date(selected.session_date).toLocaleString()}</p>{selected.location && <p className="mt-1 text-muted-foreground">{selected.location}</p>}<p className="mt-1 text-muted-foreground">{memberCount(selected.id)} of {selected.max_spots} spots</p></div>{selected.host_id === user?.id ? <Button variant="destructive" className="w-full" disabled={saving || selected.status === "canceled"} onClick={() => cancelGroup(selected)}><X className="me-2 h-4 w-4" />Cancel group</Button> : mySessionIds.has(selected.id) ? <Button variant="outline" className="w-full" disabled={saving} onClick={() => leaveGroup(selected)}>Leave group</Button> : <Button className="w-full" disabled={saving || selected.status === "canceled" || memberCount(selected.id) >= selected.max_spots || String(selected.id).startsWith("demo-")} onClick={() => joinGroup(selected)}>Join group</Button>}{String(selected.id).startsWith("demo-") && <p className="text-center text-xs text-muted-foreground">Demo preview. Seed it to Base44 before the live demo to enable joining.</p>}</div></Modal>}

      {showForm && <Modal title={form.is_marathon ? "Create study marathon" : "Create study group"} onClose={() => setShowForm(false)}><div className="space-y-4"><div><p className="mb-1.5 text-xs font-semibold text-muted-foreground">Format</p><div role="group" aria-label="Study format" className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1"><button type="button" onClick={() => setForm((current) => ({ ...current, is_marathon: false }))} className={cn("min-h-10 rounded-md text-sm font-semibold", !form.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study group</button><button type="button" onClick={() => setForm((current) => ({ ...current, is_marathon: true }))} className={cn("min-h-10 rounded-md text-sm font-semibold", form.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study marathon</button></div></div><Field label={form.is_marathon ? "Marathon title" : "Group title"}><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field><Field label="Active course"><SearchableChoice value={form.course_name} options={courseOptions} placeholder="Select one of your active courses" emptyLabel="Add an active course in Me first." onChange={(option) => setForm((current) => ({ ...current, course_name: option?.value || "" }))} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Starts"><Input type="datetime-local" value={form.session_date} onChange={(event) => setForm((current) => ({ ...current, session_date: event.target.value }))} /></Field><Field label="Ends"><Input type="datetime-local" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} /></Field></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Preferred language (optional)"><select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.preferred_language} onChange={(event) => setForm((current) => ({ ...current, preferred_language: event.target.value }))}><option value="">Any language</option><option value="English">English</option><option value="Hebrew">Hebrew</option><option value="Arabic">Arabic</option></select></Field><Field label="Capacity"><Input type="number" min="2" max="50" value={form.max_spots} onChange={(event) => setForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field></div><Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field><Field label="What will you study?"><Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field><Button className="w-full" disabled={saving || !form.title || !activeCourses.includes(form.course_name) || !form.session_date} onClick={createGroup}>{saving ? t("common_loading") : form.is_marathon ? "Create marathon" : "Create study group"}</Button></div></Modal>}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function CreateStudyPrompt({ onClick }) {
  return (
    <article className={cn("rounded-lg border border-dashed bg-card p-4 text-start", domainTones.study.border)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", domainTones.study.icon)}>
          <BookOpenCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">{FIND_PROMPT}</h2>
          <Button size="sm" className="mt-4" onClick={onClick}>Start a study group</Button>
        </div>
      </div>
    </article>
  );
}

function ParticipationFilter({ value, onChange }) {
  const options = [
    [PARTICIPATION_FILTERS.all, "All", BookOpenCheck],
    [PARTICIPATION_FILTERS.joined, "Joined", Check],
    [PARTICIPATION_FILTERS.notJoined, "Not joined", Plus],
  ];
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1" role="group" aria-label="Study participation filter">
      {options.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn("flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold", value === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
