import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Calendar, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isThisWeek, isFuture, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

const CAT_COLORS = {
  exam: 'bg-red-100 text-red-700 border-red-200',
  scholarship: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  personal: 'bg-purple-100 text-purple-700 border-purple-200',
};
const CAT_ICONS = { exam: '📝', scholarship: '💰', admin: '📋', personal: '⭐' };

export default function Planner() {
  const { tr, lang } = useLanguage();
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [form, setForm] = useState({ title: '', date: '', category: 'personal' });

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const dl = await base44.entities.Deadline.list('date', 100);
      setDeadlines(dl);
      setLoading(false);
    };
    load();
  }, []);

  const addDeadline = async () => {
    const d = await base44.entities.Deadline.create({ ...form, user_id: user.id });
    setDeadlines(prev => [...prev, d]);
    setShowAdd(false);
    setForm({ title: '', date: '', category: 'personal' });
  };

  const deleteDeadline = async (id) => {
    await base44.entities.Deadline.delete(id);
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  const getTitle = (d) => {
    if (lang === 'he' && d.title_he) return d.title_he;
    if (lang === 'ar' && d.title_ar) return d.title_ar;
    return d.title;
  };

  const sorted = [...deadlines].sort((a, b) => a.date?.localeCompare(b.date));
  const upcoming = sorted.filter(d => {
    try { return !isPast(parseISO(d.date)) || isThisWeek(parseISO(d.date), { weekStartsOn: 0 }); } catch { return true; }
  });
  const past = sorted.filter(d => {
    try { return isPast(parseISO(d.date)) && !isThisWeek(parseISO(d.date), { weekStartsOn: 0 }); } catch { return false; }
  });
  const curated = sorted.filter(d => d.is_curated);
  const personal = sorted.filter(d => !d.is_curated);

  const displayList = tab === 'upcoming' ? upcoming : tab === 'curated' ? curated : tab === 'personal' ? personal : past;

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> {tr('planner')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Stay on top of every important date.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {tr('addDeadline')}
        </Button>
      </div>

      {/* This week banner */}
      {upcoming.filter(d => { try { return isThisWeek(parseISO(d.date), { weekStartsOn: 0 }); } catch { return false; } }).length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm font-semibold text-primary mb-2">📅 This week</p>
          <div className="space-y-2">
            {upcoming.filter(d => { try { return isThisWeek(parseISO(d.date), { weekStartsOn: 0 }); } catch { return false; } }).map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm">
                <span>{CAT_ICONS[d.category]}</span>
                <span className="font-medium text-foreground">{getTitle(d)}</span>
                <span className="text-muted-foreground text-xs ms-auto">{format(parseISO(d.date), 'EEE, MMM d')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
        {[['upcoming','Upcoming'],['curated',tr('curatedDeadlines')],['personal',tr('myDeadlines')],['past','Past']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {/* Deadlines */}
      <div className="space-y-2">
        {displayList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No deadlines here.</p>
          </div>
        ) : (
          displayList.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4 hover:border-primary/30 transition-all">
              <span className="text-xl shrink-0">{CAT_ICONS[d.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{getTitle(d)}</p>
                {d.source && <p className="text-xs text-muted-foreground">{d.source}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge className={cn('text-xs border', CAT_COLORS[d.category])}>{d.category}</Badge>
                <span className="text-xs text-muted-foreground font-medium min-w-20 text-end">
                  {d.date ? format(parseISO(d.date), 'MMM d, yyyy') : '—'}
                </span>
                {!d.is_curated && (
                  <button onClick={() => deleteDeadline(d.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{tr('addDeadline')}</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">📝 Exam</SelectItem>
                    <SelectItem value="scholarship">💰 Scholarship</SelectItem>
                    <SelectItem value="admin">📋 Admin</SelectItem>
                    <SelectItem value="personal">⭐ Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">{tr('cancel')}</Button>
              <Button onClick={addDeadline} disabled={!form.title || !form.date} className="flex-1">{tr('save')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}