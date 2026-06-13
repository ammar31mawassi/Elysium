import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { UsersRound, Plus, X, ChevronDown, ChevronUp, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LANG_LABELS = { he: '🇮🇱 Hebrew', en: '🇬🇧 English', ar: '🇵🇸 Arabic', any: '🌐 Any' };

export default function StudyGroups() {
  const { tr } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showSession, setShowSession] = useState(null);
  const [tab, setTab] = useState('all');

  const [form, setForm] = useState({ name: '', course_name: '', description: '', max_members: 10, preferred_language: 'any', is_general_skills: false, university_id: '', faculty_id: '' });
  const [sessionForm, setSessionForm] = useState({ location: '', date_time: '', notes: '', max_spots: 10 });

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.StudentProfile.filter({ user_id: u.id });
      const p = profiles[0] || null;
      setProfile(p);
      const [grps, unis, mems, sess] = await Promise.all([
        base44.entities.StudyGroup.filter({ is_active: true }),
        base44.entities.University.list(),
        base44.entities.StudyGroupMember.filter({ user_id: u.id }),
        base44.entities.StudySession.list('-date_time', 30),
      ]);
      setGroups(grps);
      setUniversities(unis);
      setMembers(mems);
      setSessions(sess);
      if (p?.university_id) setForm(f => ({ ...f, university_id: p.university_id, faculty_id: p.faculty_id || '' }));
      setLoading(false);
    };
    load();
  }, []);

  const myGroupIds = new Set(members.map(m => m.group_id));

  const joinGroup = async (groupId) => {
    await base44.entities.StudyGroupMember.create({ group_id: groupId, user_id: user.id, joined_date: new Date().toISOString().split('T')[0], role: 'member' });
    setMembers(m => [...m, { group_id: groupId, user_id: user.id, role: 'member' }]);
  };

  const leaveGroup = async (groupId) => {
    const mem = members.find(m => m.group_id === groupId && m.user_id === user.id);
    if (mem?.id) await base44.entities.StudyGroupMember.delete(mem.id);
    setMembers(m => m.filter(x => !(x.group_id === groupId && x.user_id === user.id)));
  };

  const createGroup = async () => {
    const g = await base44.entities.StudyGroup.create({ ...form, created_by: user.id, is_active: true });
    await base44.entities.StudyGroupMember.create({ group_id: g.id, user_id: user.id, role: 'leader', joined_date: new Date().toISOString().split('T')[0] });
    setGroups(prev => [...prev, g]);
    setMembers(m => [...m, { group_id: g.id, user_id: user.id, role: 'leader' }]);
    setShowCreate(false);
  };

  const addSession = async (groupId) => {
    const s = await base44.entities.StudySession.create({ ...sessionForm, group_id: groupId, created_by: user.id });
    setSessions(prev => [...prev, s]);
    setShowSession(null);
    setSessionForm({ location: '', date_time: '', notes: '', max_spots: 10 });
  };

  const getGroupSessions = (groupId) => sessions.filter(s => s.group_id === groupId);
  const getUniName = (id) => universities.find(u => u.id === id)?.name || '';

  const displayGroups = groups.filter(g => {
    if (tab === 'mine') return myGroupIds.has(g.id);
    if (tab === 'general') return g.is_general_skills;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UsersRound className="w-6 h-6 text-primary" /> {tr('studyGroups')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Find your people. Study together.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {tr('createGroup')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[['all','All groups'],['mine','My groups'],['general','General Skills']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {/* Groups list */}
      <div className="space-y-3">
        {displayGroups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UsersRound className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No groups found.</p>
          </div>
        )}
        {displayGroups.map(g => {
          const isMember = myGroupIds.has(g.id);
          const groupSessions = getGroupSessions(g.id);
          const isExpanded = expandedGroup === g.id;
          return (
            <div key={g.id} className="bg-card border border-border rounded-2xl overflow-hidden transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{g.name}</h3>
                      {g.is_general_skills && <Badge variant="secondary" className="text-xs">🌐 {tr('generalSkills')}</Badge>}
                      <Badge variant="outline" className="text-xs">{LANG_LABELS[g.preferred_language]}</Badge>
                    </div>
                    {g.course_name && <p className="text-xs text-muted-foreground mt-0.5">{g.course_name}</p>}
                    {g.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{g.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{getUniName(g.university_id)} · max {g.max_members} members</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isMember ? (
                      <Button size="sm" variant="outline" onClick={() => leaveGroup(g.id)} className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive">
                        {tr('leaveGroup')}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => joinGroup(g.id)} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> {tr('joinGroup')}
                      </Button>
                    )}
                    <button onClick={() => setExpandedGroup(isExpanded ? null : g.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Study Sessions</p>
                    {isMember && (
                      <Button size="sm" variant="outline" onClick={() => setShowSession(g.id)} className="gap-1.5 text-xs">
                        <Plus className="w-3 h-3" /> {tr('addSession')}
                      </Button>
                    )}
                  </div>
                  {groupSessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No sessions scheduled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {groupSessions.map(s => (
                        <div key={s.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                          <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{s.date_time ? format(new Date(s.date_time), 'EEE, MMM d · HH:mm') : '—'}</p>
                            {s.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.location}</p>}
                            {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create group modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{tr('createGroup')}</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Group name *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Calculus 2 study group" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Course name</label>
                <Input value={form.course_name} onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                  <Select value={form.preferred_language} onValueChange={v => setForm(f => ({ ...f, preferred_language: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(LANG_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Max members</label>
                  <Input type="number" value={form.max_members} onChange={e => setForm(f => ({ ...f, max_members: +e.target.value }))} min={2} max={50} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">University</label>
                <Select value={form.university_id} onValueChange={v => setForm(f => ({ ...f, university_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                  <SelectContent>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_general_skills} onChange={e => setForm(f => ({ ...f, is_general_skills: e.target.checked }))} className="rounded" />
                <span className="text-sm">{tr('generalSkills')} (open to all students)</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">{tr('cancel')}</Button>
              <Button onClick={createGroup} disabled={!form.name} className="flex-1">{tr('createGroup')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add session modal */}
      {showSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{tr('addSession')}</h2>
              <button onClick={() => setShowSession(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date & Time *</label>
                <Input type="datetime-local" value={sessionForm.date_time} onChange={e => setSessionForm(f => ({ ...f, date_time: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <Input value={sessionForm.location} onChange={e => setSessionForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Library Room 3" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <Textarea value={sessionForm.notes} onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Max spots</label>
                <Input type="number" value={sessionForm.max_spots} onChange={e => setSessionForm(f => ({ ...f, max_spots: +e.target.value }))} min={1} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSession(null)} className="flex-1">{tr('cancel')}</Button>
              <Button onClick={() => addSession(showSession)} disabled={!sessionForm.date_time} className="flex-1">{tr('save')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}