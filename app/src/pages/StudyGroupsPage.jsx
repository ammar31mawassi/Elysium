import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Check, MapPin, Plus, Users, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import PageLayout from "@/components/layout/PageLayout";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Modal from "@/components/ui/Modal";
import SearchableChoice from "@/components/elysium/SearchableChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { buildCourseOptions } from "@/lib/creationOptions";

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
  const params = new URLSearchParams(location.search);
  const [tab, setTab] = useState(params.get("tab") === "sessions" ? "sessions" : "groups");
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [sessionMembers, setSessionMembers] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(params.get("create") === "1");
  const [showSessionForm, setShowSessionForm] = useState(params.get("create") === "session");
  const [groupForm, setGroupForm] = useState({ name: "", course_name: "", description: "", max_members: 10, preferred_language: "English" });
  const [sessionForm, setSessionForm] = useState({ group_id: "", title: "", course_name: "", preferred_language: "English", session_date: "", end_time: "", location: "", notes: "", max_spots: 8, is_marathon: false });

  useEffect(() => {
    const next = new URLSearchParams(location.search);
    if (next.get("tab") === "sessions") setTab("sessions");
    if (next.get("create") === "1") setShowGroupForm(true);
    if (next.get("create") === "session") { setTab("sessions"); setShowSessionForm(true); }
  }, [location.search]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.StudyGroup.filter({ university_id: profile.university_id, is_active: true })),
      safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.StudyGroupMember.list()),
      safeQuery(base44.entities.StudySessionMember.list()),
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_type: "study_session" })),
    ]).then(([groupRows, sessionRows, groupMemberRows, sessionMemberRows, calendarRows]) => {
      if (!active) return;
      setGroups(groupRows || []);
      setSessions(withDemoFallback(sessionRows, demoContent.sessions));
      setGroupMembers(groupMemberRows || []);
      setSessionMembers(sessionMemberRows || []);
      setCalendarItems(calendarRows || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile?.university_id, user?.id]);

  const myGroupMembers = groupMembers.filter((item) => item.user_id === user?.id);
  const mySessionMembers = sessionMembers.filter((item) => item.user_id === user?.id);
  const myGroupIds = new Set(myGroupMembers.map((item) => item.group_id));
  const mySessionIds = new Set(mySessionMembers.map((item) => item.session_id));
  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => new Date(a.session_date) - new Date(b.session_date)), [sessions]);
  const courseOptions = useMemo(() => buildCourseOptions(profile?.courses || [], groups, sessions, demoContent.sessions), [groups, profile?.courses, sessions]);
  const groupCount = (id) => groupMembers.filter((item) => item.group_id === id).length;
  const sessionCount = (id) => sessionMembers.filter((item) => item.session_id === id).length;

  const createGroup = async () => {
    if (!groupForm.name || !user?.id || !profile?.university_id) return;
    setSaving(true);
    try {
      const group = await base44.entities.StudyGroup.create({ ...groupForm, university_id: profile.university_id, faculty_id: profile.faculty_id || "", created_by: user.id, is_active: true });
      const membership = await base44.entities.StudyGroupMember.create({ group_id: group.id, user_id: user.id, role: "Leader" });
      setGroups((current) => [group, ...current]);
      setGroupMembers((current) => [...current, membership]);
      setShowGroupForm(false);
      setGroupForm({ name: "", course_name: "", description: "", max_members: 10, preferred_language: "English" });
    } finally { setSaving(false); }
  };

  const joinGroup = async (group) => {
    if (!user?.id || myGroupIds.has(group.id) || groupCount(group.id) >= group.max_members) return;
    const membership = await base44.entities.StudyGroupMember.create({ group_id: group.id, user_id: user.id, role: "Member" });
    setGroupMembers((current) => [...current, membership]);
  };

  const leaveGroup = async (group) => {
    const membership = myGroupMembers.find((item) => item.group_id === group.id);
    if (!membership || group.created_by === user?.id) return;
    await base44.entities.StudyGroupMember.delete(membership.id);
    setGroupMembers((current) => current.filter((item) => item.id !== membership.id));
  };

  const createSession = async () => {
    if (!sessionForm.title || !sessionForm.course_name || !sessionForm.session_date || !user?.id || !profile?.university_id) return;
    setSaving(true);
    try {
      const session = await base44.entities.StudySession.create({
        ...sessionForm,
        group_id: sessionForm.group_id || undefined,
        university_id: profile.university_id,
        session_date: asIso(sessionForm.session_date),
        end_time: asIso(sessionForm.end_time),
        host_id: user.id,
        status: "open",
      });
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, user_id: user.id });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "study_session", source_id: session.id, title: session.title, starts_at: session.session_date, ends_at: session.end_time, notes: session.location || "", status: "active" });
      setSessions((current) => [session, ...current.filter((item) => !String(item.id).startsWith("demo-"))]);
      setSessionMembers((current) => [...current, membership]);
      setCalendarItems((current) => [...current, calendarItem]);
      setShowSessionForm(false);
      setSessionForm({ group_id: "", title: "", course_name: "", preferred_language: "English", session_date: "", end_time: "", location: "", notes: "", max_spots: 8, is_marathon: false });
    } finally { setSaving(false); }
  };

  const joinSession = async (session) => {
    if (!user?.id || mySessionIds.has(session.id) || sessionCount(session.id) >= session.max_spots || String(session.id).startsWith("demo-")) return;
    setSaving(true);
    try {
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, user_id: user.id });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "study_session", source_id: session.id, title: session.title, starts_at: session.session_date, ends_at: session.end_time, notes: session.location || "", status: "active" });
      setSessionMembers((current) => [...current, membership]);
      setCalendarItems((current) => [...current, calendarItem]);
      setSelectedSession(null);
    } finally { setSaving(false); }
  };

  const leaveSession = async (session) => {
    const membership = mySessionMembers.find((item) => item.session_id === session.id);
    if (!membership || session.host_id === user?.id) return;
    setSaving(true);
    try {
      await base44.entities.StudySessionMember.delete(membership.id);
      const calendarItem = calendarItems.find((item) => item.source_id === session.id);
      if (calendarItem) await base44.entities.CalendarItem.delete(calendarItem.id);
      setSessionMembers((current) => current.filter((item) => item.id !== membership.id));
      setCalendarItems((current) => current.filter((item) => item.id !== calendarItem?.id));
      setSelectedSession(null);
    } finally { setSaving(false); }
  };

  const cancelSession = async (session) => {
    if (session.host_id !== user?.id) return;
    setSaving(true);
    try {
      await base44.entities.StudySession.update(session.id, { status: "canceled" });
      setSessions((current) => current.map((item) => item.id === session.id ? { ...item, status: "canceled" } : item));
      setSelectedSession(null);
    } finally { setSaving(false); }
  };

  return (
    <PageLayout wide>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("groups_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a one-time study session or build a persistent course group.</p>
      </header>

      <div className="mb-6 flex max-w-md rounded-md bg-muted p-1">
        <button className={cn("h-10 flex-1 rounded-md text-sm font-semibold", tab === "groups" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")} onClick={() => setTab("groups")}>{t("groups_tab")}</button>
        <button className={cn("h-10 flex-1 rounded-md text-sm font-semibold", tab === "sessions" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")} onClick={() => setTab("sessions")}>{t("sessions_tab")}</button>
      </div>

      {loading ? <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={3} />)}</div> : tab === "groups" ? (
        groups.length === 0 ? <EmptyState icon={Users} title="No course groups yet" message="Create a persistent group for classmates who want to keep studying together." /> : (
          <div className="grid gap-3 md:grid-cols-2">{groups.map((group) => {
            const count = groupCount(group.id);
            const joined = myGroupIds.has(group.id);
            return <button key={group.id} onClick={() => setSelectedGroup(group)} className="rounded-lg border border-border bg-card p-4 text-start hover:border-primary/40"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Users className="h-5 w-5" /></span><div className="min-w-0 flex-1" dir="auto"><div className="flex justify-between gap-3"><h2 className="font-semibold text-foreground">{group.name}</h2>{joined && <Check className="h-4 w-4 shrink-0 text-primary" />}</div><p className="mt-1 text-xs text-muted-foreground">{group.course_name || "Cross-course study group"}</p><p className="mt-3 text-xs text-muted-foreground">{count} / {group.max_members} members · {group.preferred_language}</p></div></div></button>;
          })}</div>
        )
      ) : (
        sortedSessions.length === 0 ? <EmptyState icon={BookOpenCheck} title="No study sessions yet" message="Create a library session without needing a permanent group first." /> : (
          <div className="grid gap-3 md:grid-cols-2">{sortedSessions.map((session) => {
            const joined = mySessionIds.has(session.id);
            const count = sessionCount(session.id);
            return <button key={session.id} onClick={() => setSelectedSession(session)} className="rounded-lg border border-border bg-card p-4 text-start hover:border-primary/40"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><BookOpenCheck className="h-5 w-5" /></span><div className="min-w-0 flex-1" dir="auto"><div className="flex justify-between gap-3"><h2 className="font-semibold text-foreground">{session.title}</h2><span className={cn("text-xs font-semibold", session.status === "canceled" ? "text-destructive" : "text-emerald-600")}>{session.status === "canceled" ? "Canceled" : joined ? "Joined" : "Open"}</span></div><p className="mt-1 text-xs font-semibold text-primary">{session.is_marathon ? "Study marathon" : "Study session"} · {session.course_name || "Course not specified"}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" />{new Date(session.session_date).toLocaleString()}</p>{session.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{session.location}</p>}<p className="mt-2 text-xs text-muted-foreground">{count} / {session.max_spots} joined</p></div></div></button>;
          })}</div>
        )
      )}

      <button onClick={() => tab === "groups" ? setShowGroupForm(true) : setShowSessionForm(true)} className="fixed bottom-24 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105" aria-label={tab === "groups" ? "Create study group" : "Create study session"}><Plus className="h-6 w-6" /></button>

      {selectedGroup && <Modal title={selectedGroup.name} onClose={() => setSelectedGroup(null)}><div className="space-y-4" dir="auto"><p className="text-sm leading-relaxed text-muted-foreground">{selectedGroup.description || "A persistent group for students who want to study this course together."}</p><p className="text-sm text-foreground">{groupCount(selectedGroup.id)} of {selectedGroup.max_members} members</p>{selectedGroup.created_by === user?.id ? <Button className="w-full" onClick={() => { setSessionForm((current) => ({ ...current, group_id: selectedGroup.id, course_name: selectedGroup.course_name || "" })); setSelectedGroup(null); setTab("sessions"); setShowSessionForm(true); }}>Create a group session</Button> : myGroupIds.has(selectedGroup.id) ? <Button variant="outline" className="w-full" onClick={() => leaveGroup(selectedGroup)}>Leave group</Button> : <Button className="w-full" disabled={groupCount(selectedGroup.id) >= selectedGroup.max_members} onClick={() => joinGroup(selectedGroup)}>Join group</Button>}</div></Modal>}

      {selectedSession && <Modal title={selectedSession.title} onClose={() => setSelectedSession(null)}><div className="space-y-4" dir="auto"><p className="text-xs font-semibold text-primary">{selectedSession.is_marathon ? "Study marathon" : "Study session"} · {selectedSession.course_name}</p><p className="text-sm text-muted-foreground">{selectedSession.notes || "Bring the material you want to work on."}</p><div className="rounded-md bg-muted/50 p-3 text-sm"><p>{new Date(selectedSession.session_date).toLocaleString()}</p>{selectedSession.location && <p className="mt-1 text-muted-foreground">{selectedSession.location}</p>}<p className="mt-1 text-muted-foreground">{sessionCount(selectedSession.id)} of {selectedSession.max_spots} spots</p></div>{selectedSession.host_id === user?.id ? <Button variant="destructive" className="w-full" disabled={saving || selectedSession.status === "canceled"} onClick={() => cancelSession(selectedSession)}><X className="me-2 h-4 w-4" />Cancel session</Button> : mySessionIds.has(selectedSession.id) ? <Button variant="outline" className="w-full" disabled={saving} onClick={() => leaveSession(selectedSession)}>Leave session</Button> : <Button className="w-full" disabled={saving || selectedSession.status === "canceled" || sessionCount(selectedSession.id) >= selectedSession.max_spots || String(selectedSession.id).startsWith("demo-")} onClick={() => joinSession(selectedSession)}>Join session</Button>}{String(selectedSession.id).startsWith("demo-") && <p className="text-center text-xs text-muted-foreground">Demo preview. Seed it to Base44 before the live demo to enable joining.</p>}</div></Modal>}

      {showGroupForm && <Modal title="Create course group" onClose={() => setShowGroupForm(false)}><div className="space-y-4"><Field label="Group name"><Input value={groupForm.name} onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))} autoFocus /></Field><Field label="Course"><Input value={groupForm.course_name} onChange={(event) => setGroupForm((current) => ({ ...current, course_name: event.target.value }))} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Language"><Input value={groupForm.preferred_language} onChange={(event) => setGroupForm((current) => ({ ...current, preferred_language: event.target.value }))} /></Field><Field label="Capacity"><Input type="number" min="2" max="100" value={groupForm.max_members} onChange={(event) => setGroupForm((current) => ({ ...current, max_members: Number(event.target.value) }))} /></Field></div><Field label="Description"><Textarea rows={3} value={groupForm.description} onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))} /></Field><Button className="w-full" disabled={saving || !groupForm.name} onClick={createGroup}>{saving ? t("common_loading") : "Create group"}</Button></div></Modal>}

      {showSessionForm && <Modal title={sessionForm.is_marathon ? "Create study marathon" : "Create study session"} onClose={() => setShowSessionForm(false)}><div className="space-y-4"><div><p className="mb-1.5 text-xs font-semibold text-muted-foreground">Format</p><div role="group" aria-label="Study format" className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1"><button type="button" onClick={() => setSessionForm((current) => ({ ...current, is_marathon: false }))} className={cn("min-h-10 rounded-md text-sm font-semibold", !sessionForm.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study session</button><button type="button" onClick={() => setSessionForm((current) => ({ ...current, is_marathon: true }))} className={cn("min-h-10 rounded-md text-sm font-semibold", sessionForm.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study marathon</button></div></div><Field label={sessionForm.is_marathon ? "Marathon title" : "Session title"}><Input value={sessionForm.title} onChange={(event) => setSessionForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field><Field label="Related course"><SearchableChoice value={sessionForm.course_name} options={courseOptions} placeholder="Search or enter a course" allowCustom customLabel={(query) => `Use course "${query}"`} onChange={(option) => setSessionForm((current) => ({ ...current, course_name: option?.value || "" }))} /></Field><Field label="Optional persistent group"><select value={sessionForm.group_id} onChange={(event) => { const group = groups.find((item) => item.id === event.target.value); setSessionForm((current) => ({ ...current, group_id: event.target.value, course_name: group?.course_name || current.course_name })); }} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No group, one-time session</option>{groups.filter((group) => myGroupIds.has(group.id)).map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></Field><div className="grid grid-cols-2 gap-3"><Field label="Starts"><Input type="datetime-local" value={sessionForm.session_date} onChange={(event) => setSessionForm((current) => ({ ...current, session_date: event.target.value }))} /></Field><Field label="Ends"><Input type="datetime-local" value={sessionForm.end_time} onChange={(event) => setSessionForm((current) => ({ ...current, end_time: event.target.value }))} /></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Language"><Input value={sessionForm.preferred_language} onChange={(event) => setSessionForm((current) => ({ ...current, preferred_language: event.target.value }))} /></Field><Field label="Capacity"><Input type="number" min="2" max="50" value={sessionForm.max_spots} onChange={(event) => setSessionForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field></div><Field label="Location"><Input value={sessionForm.location} onChange={(event) => setSessionForm((current) => ({ ...current, location: event.target.value }))} /></Field><Field label="What will you study?"><Textarea rows={3} value={sessionForm.notes} onChange={(event) => setSessionForm((current) => ({ ...current, notes: event.target.value }))} /></Field><Button className="w-full" disabled={saving || !sessionForm.title || !sessionForm.course_name || !sessionForm.session_date} onClick={createSession}>{saving ? t("common_loading") : sessionForm.is_marathon ? "Create marathon" : "Create session"}</Button></div></Modal>}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
