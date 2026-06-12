import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { format } from "date-fns";
import { Plus, Users, MapPin, Calendar, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/layout/PageLayout";
import ElCard from "@/components/ui/ElCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export default function StudyGroupsPage() {
  const location = useLocation();
  const initialParams = new URLSearchParams(location.search);
  const { user, profile } = useProfile();
  const { t } = useLanguage();
  const [tab, setTab] = useState(initialParams.get("tab") === "sessions" ? "sessions" : "groups");
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showGroupForm, setShowGroupForm] = useState(initialParams.get("create") === "1");
  const [showSessionForm, setShowSessionForm] = useState(initialParams.get("create") === "session");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupForm, setGroupForm] = useState({ name: "", course_name: "", description: "", max_members: 10, preferred_language: "English" });
  const [sessionForm, setSessionForm] = useState({ group_id: "", title: "", session_date: "", end_time: "", location: "", notes: "", max_spots: 10, is_marathon: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "sessions") setTab("sessions");
    if (params.get("create") === "1") setShowGroupForm(true);
    if (params.get("create") === "session") { setTab("sessions"); setShowSessionForm(true); }
  }, [location.search]);

  useEffect(() => {
    if (!profile?.university_id) return;
    Promise.all([
      base44.entities.StudyGroup.filter({ university_id: profile.university_id, is_active: true }),
      base44.entities.StudyGroupMember.filter({ user_id: user?.id }),
      base44.entities.Faculty.filter({ university_id: profile.university_id }),
    ]).then(([g, m, f]) => {
      setGroups(g);
      setMemberships(m);
      setFaculties(f);
      setLoading(false);
    });
  }, [profile?.university_id, user?.id]);

  useEffect(() => {
    if (!profile?.university_id || !memberships.length) { setSessions([]); return; }
    const myGroupIds = memberships.map(m => m.group_id);
    base44.entities.StudySession.list("-session_date", 50).then(all => {
      setSessions(all.filter(s => myGroupIds.includes(s.group_id)));
    });
  }, [memberships.length]);

  const myGroupIds = new Set(memberships.map(m => m.group_id));

  const handleJoin = async (groupId) => {
    const m = await base44.entities.StudyGroupMember.create({ group_id: groupId, user_id: user.id, role: "Member" });
    setMemberships(prev => [...prev, m]);
  };

  const handleLeave = async (groupId) => {
    const mem = memberships.find(m => m.group_id === groupId);
    if (mem) {
      await base44.entities.StudyGroupMember.delete(mem.id);
      setMemberships(prev => prev.filter(m => m.group_id !== groupId));
    }
  };

  const handleCreateGroup = async () => {
    setSaving(true);
    const g = await base44.entities.StudyGroup.create({
      ...groupForm,
      university_id: profile.university_id,
      faculty_id: profile.faculty_id,
      is_active: true,
      created_by: user.id,
    });
    await base44.entities.StudyGroupMember.create({ group_id: g.id, user_id: user.id, role: "Leader" });
    setGroups(prev => [g, ...prev]);
    setMemberships(prev => [...prev, { group_id: g.id, user_id: user.id, role: "Leader" }]);
    setGroupForm({ name: "", course_name: "", description: "", max_members: 10, preferred_language: "English" });
    setShowGroupForm(false);
    setSaving(false);
  };

  const handleCreateSession = async () => {
    setSaving(true);
    const s = await base44.entities.StudySession.create({ ...sessionForm, host_id: user.id });
    setSessions(prev => [s, ...prev]);
    setSessionForm({ group_id: "", title: "", session_date: "", end_time: "", location: "", notes: "", max_spots: 10, is_marathon: false });
    setShowSessionForm(false);
    setSaving(false);
  };

  const getGroupName = (id) => groups.find(g => g.id === id)?.name || "Unknown Group";

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('groups_title')}</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{t('groups_subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-gray-100 p-1 mb-5 shadow-sm">
        {[["groups", t('groups_tab')], ["sessions", t('sessions_tab')]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all", tab === key ? "bg-teal text-white shadow-sm" : "text-slate")}>
            {label}
          </button>
        ))}
      </div>

      {/* GROUPS TAB */}
      {tab === "groups" && (
        <>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}</div>
          ) : groups.length === 0 ? (
            <EmptyState emoji="📚" title="No study groups yet" message="Create the first group for your course — others are probably searching too!" />
          ) : (
            <div className="space-y-3">
              {groups.map(g => (
                <GroupCard key={g.id} group={g} isMember={myGroupIds.has(g.id)} memberCount={memberships.filter(m => m.group_id === g.id).length}
                  onJoin={() => handleJoin(g.id)} onLeave={() => handleLeave(g.id)} onDetail={() => setSelectedGroup(g)} />
              ))}
            </div>
          )}
          <button onClick={() => setShowGroupForm(true)}
            className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center shadow-lg z-40"
            style={{ boxShadow: "0 4px 20px rgba(10,112,117,0.4)" }}>
            <Plus className="w-6 h-6" />
          </button>
        </>
      )}

      {/* SESSIONS TAB */}
      {tab === "sessions" && (
        <>
          {sessions.length === 0 ? (
            <EmptyState emoji="⏰" title="No sessions yet" message="Join a study group first, then schedule sessions with your group members." />
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <SessionCard key={s.id} session={s} groupName={getGroupName(s.group_id)} />
              ))}
            </div>
          )}
          {myGroupIds.size > 0 && (
            <button onClick={() => setShowSessionForm(true)}
              className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center shadow-lg z-40"
              style={{ boxShadow: "0 4px 20px rgba(10,112,117,0.4)" }}>
              <Plus className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      {/* Group detail modal */}
      {selectedGroup && (
        <GroupDetailModal group={selectedGroup} isMember={myGroupIds.has(selectedGroup.id)} onClose={() => setSelectedGroup(null)}
          sessions={sessions.filter(s => s.group_id === selectedGroup.id)} userId={user?.id}
          onJoin={() => { handleJoin(selectedGroup.id); }}
          onNewSession={() => { setSessionForm(f => ({ ...f, group_id: selectedGroup.id })); setSelectedGroup(null); setShowSessionForm(true); }}
        />
      )}

      {/* Create group modal */}
      {showGroupForm && (
        <Modal title="Create Study Group" onClose={() => setShowGroupForm(false)}>
          <div className="space-y-3">
            <Field label="Group name *"><Input value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Calculus 2 Study Group" /></Field>
            <Field label="Course name"><Input value={groupForm.course_name} onChange={e => setGroupForm(f => ({ ...f, course_name: e.target.value }))} placeholder="e.g. Introduction to Algorithms" /></Field>
            <Field label="Description"><Textarea value={groupForm.description} onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} rows={2} className="text-sm resize-none" /></Field>
            <Field label="Language">
              <div className="flex gap-2">
                {["Hebrew", "Arabic", "English"].map(l => (
                  <button key={l} onClick={() => setGroupForm(f => ({ ...f, preferred_language: l }))}
                    className={cn("flex-1 py-2 rounded-xl border text-xs font-medium transition-all", groupForm.preferred_language === l ? "bg-teal text-white border-teal" : "border-gray-200 text-slate")}>
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Max members"><Input type="number" value={groupForm.max_members} min={2} max={50} onChange={e => setGroupForm(f => ({ ...f, max_members: +e.target.value }))} /></Field>
            <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={!groupForm.name || saving} onClick={handleCreateGroup}>
              {saving ? "Creating…" : "Create Group"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Create session modal */}
      {showSessionForm && (
        <Modal title="Schedule Session" onClose={() => setShowSessionForm(false)}>
          <div className="space-y-3">
            <Field label="Group *">
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={sessionForm.group_id} onChange={e => setSessionForm(f => ({ ...f, group_id: e.target.value }))}>
                <option value="">Select a group</option>
                {groups.filter(g => myGroupIds.has(g.id)).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Session title"><Input value={sessionForm.title} onChange={e => setSessionForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Pre-exam review" /></Field>
            <Field label="Date & time *"><Input type="datetime-local" value={sessionForm.session_date} onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))} /></Field>
            <Field label="End time"><Input type="time" value={sessionForm.end_time} onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))} /></Field>
            <Field label="Location"><Input value={sessionForm.location} onChange={e => setSessionForm(f => ({ ...f, location: e.target.value }))} placeholder="Library, Room 3…" /></Field>
            <Field label="Max spots"><Input type="number" value={sessionForm.max_spots} min={2} max={100} onChange={e => setSessionForm(f => ({ ...f, max_spots: +e.target.value }))} /></Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setSessionForm(f => ({ ...f, is_marathon: !f.is_marathon }))}
                className={cn("w-10 h-6 rounded-full transition-colors flex items-center px-1", sessionForm.is_marathon ? "bg-teal" : "bg-gray-200")}>
                <div className={cn("w-4 h-4 rounded-full bg-white shadow transition-transform", sessionForm.is_marathon ? "translate-x-4" : "")} />
              </div>
              <span className="text-sm text-[#1C1C2E]">🏃 Marathon session (long study session)</span>
            </label>
            <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={!sessionForm.group_id || !sessionForm.session_date || saving} onClick={handleCreateSession}>
              {saving ? "Scheduling…" : "Schedule Session"}
            </Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function GroupCard({ group, isMember, memberCount, onJoin, onLeave, onDetail }) {
  return (
    <ElCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onDetail}>
          <p className="font-semibold text-[#1C1C2E] text-sm">{group.name}</p>
          {group.course_name && <p className="text-xs text-slate mt-0.5">{group.course_name}</p>}
          {group.description && <p className="text-xs text-slate mt-1 line-clamp-2">{group.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate"><Users className="w-3 h-3" />{memberCount}/{group.max_members}</span>
            {group.preferred_language && (
              <span className="px-2 py-0.5 bg-teal/10 text-teal text-[10px] font-semibold rounded-full">{group.preferred_language}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-3">
          {isMember ? (
            <button onClick={onLeave} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all">Leave</button>
          ) : (
            <button onClick={onJoin} className="text-xs font-semibold text-teal bg-teal/10 border border-teal/20 px-3 py-1.5 rounded-xl hover:bg-teal hover:text-white transition-all">+ Join</button>
          )}
          <button onClick={onDetail} className="text-slate hover:text-teal transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </ElCard>
  );
}

function SessionCard({ session, groupName }) {
  return (
    <ElCard className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${session.is_marathon ? "bg-amber/10" : "bg-teal/10"}`}>
          {session.is_marathon ? "🏃" : "📖"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#1C1C2E] text-sm">{session.title || "Study Session"}</p>
            {session.is_marathon && <span className="px-1.5 py-0.5 bg-amber/20 text-amber text-[10px] font-bold rounded-full">Marathon</span>}
          </div>
          <p className="text-xs text-slate mt-0.5">{groupName}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate flex items-center gap-1"><Calendar className="w-3 h-3" />{session.session_date ? format(new Date(session.session_date), "MMM d · HH:mm") : "TBD"}</span>
            {session.location && <span className="text-xs text-slate flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>}
          </div>
        </div>
      </div>
    </ElCard>
  );
}

function GroupDetailModal({ group, isMember, sessions, onClose, onJoin, onNewSession, userId }) {
  return (
    <Modal title={group.name} onClose={onClose}>
      <div className="space-y-4">
        {group.course_name && <p className="text-slate text-sm">{group.course_name}</p>}
        {group.description && <p className="text-[#1C1C2E] text-sm leading-relaxed">{group.description}</p>}
        {!isMember && (
          <Button className="w-full bg-teal hover:bg-teal-dark text-white" onClick={onJoin}>Join Group</Button>
        )}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[#1C1C2E] text-sm">Upcoming Sessions</p>
            {isMember && (
              <button onClick={onNewSession} className="text-xs text-teal font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            )}
          </div>
          {sessions.length === 0 ? (
            <p className="text-slate text-xs text-center py-3">No sessions scheduled yet.</p>
          ) : sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-lg">{s.is_marathon ? "🏃" : "📖"}</span>
              <div>
                <p className="text-xs font-semibold text-[#1C1C2E]">{s.title || "Session"}</p>
                <p className="text-xs text-slate">{s.session_date ? format(new Date(s.session_date), "EEE MMM d · HH:mm") : "TBD"}{s.location ? ` · ${s.location}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}
