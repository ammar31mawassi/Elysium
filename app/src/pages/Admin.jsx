import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Shield, Plus, Edit2, Eye, EyeOff, Check, X, BookOpen, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORIES = ['first_week','course_registration','exams_appeals','student_rights','email_templates','mental_health','study_skills'];

export default function Admin() {
  const { tr } = useLanguage();
  const [tab, setTab] = useState('guides');
  const [guides, setGuides] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editGuide, setEditGuide] = useState(null);
  // Stats icons used inline below
  const [form, setForm] = useState({ title: '', title_he: '', title_ar: '', category: 'first_week', situation: '', situation_he: '', situation_ar: '', content_en: '', content_he: '', content_ar: '', what_to_do_en: '', what_to_do_he: '', what_to_do_ar: '', who_to_contact: '', source_url: '', university_id: '', is_published: true });

  useEffect(() => {
    Promise.all([
      base44.entities.Guide.list(),
      base44.entities.Mentor.filter({ is_approved: false }),
      base44.entities.University.list(),
    ]).then(([g, m, u]) => {
      setGuides(g);
      setPendingMentors(m);
      setUniversities(u);
      setLoading(false);
    });
  }, []);

  const saveGuide = async () => {
    if (editGuide) {
      const updated = await base44.entities.Guide.update(editGuide.id, form);
      setGuides(prev => prev.map(g => g.id === editGuide.id ? updated : g));
    } else {
      const created = await base44.entities.Guide.create(form);
      setGuides(prev => [...prev, created]);
    }
    setShowCreate(false);
    setEditGuide(null);
    setForm({ title: '', title_he: '', title_ar: '', category: 'first_week', situation: '', situation_he: '', situation_ar: '', content_en: '', content_he: '', content_ar: '', what_to_do_en: '', what_to_do_he: '', what_to_do_ar: '', who_to_contact: '', source_url: '', university_id: '', is_published: true });
  };

  const togglePublish = async (guide) => {
    const updated = await base44.entities.Guide.update(guide.id, { is_published: !guide.is_published });
    setGuides(prev => prev.map(g => g.id === guide.id ? updated : g));
  };

  const approveMentor = async (mentor) => {
    await base44.entities.Mentor.update(mentor.id, { is_approved: true });
    setPendingMentors(prev => prev.filter(m => m.id !== mentor.id));
  };

  const rejectMentor = async (mentor) => {
    await base44.entities.Mentor.delete(mentor.id);
    setPendingMentors(prev => prev.filter(m => m.id !== mentor.id));
  };

  const openEdit = (guide) => {
    setEditGuide(guide);
    setForm({ ...guide });
    setShowCreate(true);
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{tr('admin')}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total guides', value: guides.length, icon: BookOpen },
          { label: 'Pending mentors', value: pendingMentors.length, icon: Users },
          { label: 'Universities', value: universities.length, icon: Building2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[['guides','Guides'],['mentors','Mentor Approvals']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative',
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {label}
            {key === 'mentors' && pendingMentors.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{pendingMentors.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Guides tab */}
      {tab === 'guides' && (
        <div className="space-y-4">
          <Button onClick={() => { setEditGuide(null); setShowCreate(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Create guide
          </Button>
          <div className="space-y-2">
            {guides.map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{g.title}</p>
                    <Badge variant={g.is_published ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {g.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tr(g.category)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(g)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(g)}>
                    {g.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentor approvals tab */}
      {tab === 'mentors' && (
        <div className="space-y-3">
          {pendingMentors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No pending mentor applications.</p>
            </div>
          ) : (
            pendingMentors.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                  {m.display_name?.[0]?.toUpperCase() || 'M'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{m.display_name}</p>
                  <p className="text-xs text-muted-foreground">{m.year} · {m.languages?.join(', ')}</p>
                  {m.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.bio}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.topics?.map(t => <Badge key={t} variant="secondary" className="text-xs">{tr(t)}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => rejectMentor(m)} className="gap-1 text-destructive hover:border-destructive hover:bg-destructive/5">
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => approveMentor(m)} className="gap-1">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Guide create/edit modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{editGuide ? 'Edit guide' : 'Create guide'}</h2>
              <button onClick={() => { setShowCreate(false); setEditGuide(null); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title (EN) *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title (HE)</label><Input value={form.title_he} onChange={e => setForm(f => ({ ...f, title_he: e.target.value }))} dir="rtl" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title (AR)</label><Input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} dir="rtl" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{tr(c)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">University (leave empty for universal)</label>
                <Select value={form.university_id || 'universal'} onValueChange={v => setForm(f => ({ ...f, university_id: v === 'universal' ? '' : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal">🌐 Universal</SelectItem>
                    {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Situation (EN)</label>
              <Textarea value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))} rows={2} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Situation (HE)</label><Textarea value={form.situation_he} onChange={e => setForm(f => ({ ...f, situation_he: e.target.value }))} rows={2} dir="rtl" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Situation (AR)</label><Textarea value={form.situation_ar} onChange={e => setForm(f => ({ ...f, situation_ar: e.target.value }))} rows={2} dir="rtl" /></div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Content / What it means (EN, markdown)</label>
              <Textarea value={form.content_en} onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))} rows={4} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Content (HE)</label><Textarea value={form.content_he} onChange={e => setForm(f => ({ ...f, content_he: e.target.value }))} rows={4} dir="rtl" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Content (AR)</label><Textarea value={form.content_ar} onChange={e => setForm(f => ({ ...f, content_ar: e.target.value }))} rows={4} dir="rtl" /></div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">What to do (EN, markdown)</label>
              <Textarea value={form.what_to_do_en} onChange={e => setForm(f => ({ ...f, what_to_do_en: e.target.value }))} rows={4} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Who to contact</label>
              <Input value={form.who_to_contact} onChange={e => setForm(f => ({ ...f, who_to_contact: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source URL</label>
              <Input value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              <span className="text-sm font-medium">Published</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowCreate(false); setEditGuide(null); }} className="flex-1">{tr('cancel')}</Button>
              <Button onClick={saveGuide} disabled={!form.title} className="flex-1">{tr('save')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}