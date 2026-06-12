import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Users, Plus, Check, X, Search, Languages, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const LANG_FLAGS = { he: '🇮🇱', en: '🇬🇧', ar: '🇵🇸' };
const TOPIC_ICONS = {
  scholarships: '💰', housing: '🏠', exams: '📝', social: '👥',
  rights: '⚖️', bureaucracy: '📋', study_partners: '📚', career: '💼', mental_health: '🧠'
};

export default function Mentors() {
  const { tr, lang } = useLanguage();
  const [mentors, setMentors] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [user, setUser] = useState(null);
  const [myMentor, setMyMentor] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterUni, setFilterUni] = useState('all');
  const [form, setForm] = useState({ display_name: '', bio: '', languages: [], topics: [], contact_method: '', year: '2nd', university_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [m, unis, mine] = await Promise.all([
        base44.entities.Mentor.filter({ is_approved: true, is_active: true }),
        base44.entities.University.list(),
        base44.entities.Mentor.filter({ user_id: u.id })
      ]);
      setMentors(m);
      setUniversities(unis);
      if (mine.length) { setMyMentor(mine[0]); }
      setForm(f => ({ ...f, display_name: u.full_name || '' }));
      setLoading(false);
    };
    load();
  }, []);

  const toggleArr = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val]
  }));

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    await base44.entities.Mentor.create({ ...form, user_id: user.id, is_approved: false, is_active: true });
    setSubmitting(false);
    setApplied(true);
    setShowApply(false);
  };

  const filtered = mentors.filter(m => {
    const matchLang = filterLang === 'all' || m.languages?.includes(filterLang);
    const matchTopic = filterTopic === 'all' || m.topics?.includes(filterTopic);
    const matchUni = filterUni === 'all' || m.university_id === filterUni;
    const matchSearch = !search || m.display_name?.toLowerCase().includes(search.toLowerCase()) || m.bio?.toLowerCase().includes(search.toLowerCase());
    return matchLang && matchTopic && matchUni && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> {tr('mentors')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Connect with student mentors who've been there.</p>
        </div>
        {!myMentor && !applied && (
          <Button onClick={() => setShowApply(true)} className="gap-2">
            <Plus className="w-4 h-4" /> {tr('becomeMentor')}
          </Button>
        )}
        {myMentor && (
          <Badge className={myMentor.is_approved ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'}>
            {myMentor.is_approved ? tr('approved') : tr('pendingApproval')}
          </Badge>
        )}
        {applied && <Badge className="bg-yellow-100 text-yellow-700">{tr('pendingApproval')}</Badge>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr('search')} className="ps-9" />
        </div>
        <Select value={filterUni} onValueChange={setFilterUni}>
          <SelectTrigger className="w-40"><SelectValue placeholder={tr('university')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tr('all')}</SelectItem>
            {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterLang} onValueChange={setFilterLang}>
          <SelectTrigger className="w-32"><SelectValue placeholder={tr('language')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tr('all')}</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="he">🇮🇱 Hebrew</SelectItem>
            <SelectItem value="ar">🇵🇸 Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mentor cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No mentors found with these filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {m.display_name?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{m.display_name}</p>
                  <p className="text-xs text-muted-foreground">{m.year} year</p>
                  <div className="flex gap-1 mt-1">
                    {m.languages?.map(l => <span key={l} className="text-sm">{LANG_FLAGS[l]}</span>)}
                  </div>
                </div>
              </div>
              {m.bio && <p className="text-xs text-muted-foreground line-clamp-3">{m.bio}</p>}
              {m.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.topics.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs gap-1">
                      {TOPIC_ICONS[t]} {tr(t)}
                    </Badge>
                  ))}
                </div>
              )}
              {m.contact_method && (
                <Button size="sm" variant="outline" className="w-full gap-2 mt-auto">
                  {tr('contactMentor')}: {m.contact_method}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{tr('becomeMentor')}</h2>
              <button onClick={() => setShowApply(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Display name</label>
                <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">University</label>
                <Select value={form.university_id} onValueChange={v => setForm(f => ({ ...f, university_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                  <SelectContent>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
                <Select value={form.year} onValueChange={v => setForm(f => ({ ...f, year: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['2nd','3rd','4th+','grad'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell students about yourself..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Languages</label>
                <div className="flex gap-2">
                  {['en','he','ar'].map(l => (
                    <button key={l} onClick={() => toggleArr('languages', l)}
                      className={cn('px-3 py-1.5 rounded-lg border text-sm transition-all', form.languages.includes(l) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40')}>
                      {LANG_FLAGS[l]} {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Topics you can help with</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TOPIC_ICONS).map(t => (
                    <button key={t} onClick={() => toggleArr('topics', t)}
                      className={cn('px-2.5 py-1 rounded-lg border text-xs transition-all', form.topics.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40')}>
                      {TOPIC_ICONS[t]} {tr(t)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact method (WhatsApp, email, etc.)</label>
                <Input value={form.contact_method} onChange={e => setForm(f => ({ ...f, contact_method: e.target.value }))} placeholder="e.g. WhatsApp: +972..." />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowApply(false)} className="flex-1">{tr('cancel')}</Button>
              <Button onClick={handleApply} disabled={submitting || !form.display_name} className="flex-1">{tr('submit')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}