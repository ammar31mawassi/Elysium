import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { User, BookOpen, LogOut, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  first_week: '🏫', course_registration: '📋', exams_appeals: '📝',
  student_rights: '⚖️', email_templates: '📧', mental_health: '🧠', study_skills: '📚'
};
const HELP_NEEDS = ['scholarships','housing','exams','social','rights','bureaucracy','study_partners'];
const YEARS = ['prep','1st','2nd','3rd','4th+'];

export default function Profile() {
  const { tr, lang, setLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedGuides, setSavedGuides] = useState([]);
  const [guides, setGuides] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, unis, saved] = await Promise.all([
        base44.entities.StudentProfile.filter({ user_id: u.id }),
        base44.entities.University.list(),
        base44.entities.SavedGuide.filter({ user_id: u.id }),
      ]);
      const p = profiles[0] || null;
      setProfile(p);
      setUniversities(unis);
      setSavedGuides(saved);
      if (saved.length > 0) {
        const guideIds = saved.map(s => s.guide_id);
        const allGuides = await base44.entities.Guide.list('-created_date', 100);
        setGuides(allGuides.filter(g => guideIds.includes(g.id)));
      }
      if (p) setEditForm({ university_id: p.university_id || '', year: p.year || '', preferred_language: p.preferred_language || 'en', help_needs: p.help_needs || [] });
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    await base44.entities.StudentProfile.update(profile.id, editForm);
    setProfile(p => ({ ...p, ...editForm }));
    setLang(editForm.preferred_language);
    setEditing(false);
  };

  const toggleHelp = (need) => setEditForm(f => ({
    ...f, help_needs: f.help_needs?.includes(need) ? f.help_needs.filter(n => n !== need) : [...(f.help_needs || []), need]
  }));

  const unsaveGuide = async (savedId, guideId) => {
    await base44.entities.SavedGuide.delete(savedId);
    setSavedGuides(prev => prev.filter(s => s.id !== savedId));
    setGuides(prev => prev.filter(g => g.id !== guideId));
  };

  const getGuideTitle = (g) => {
    if (lang === 'he' && g.title_he) return g.title_he;
    if (lang === 'ar' && g.title_ar) return g.title_ar;
    return g.title;
  };

  const getUniName = (id) => universities.find(u => u.id === id)?.name || '—';

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <User className="w-6 h-6 text-primary" /> {tr('profile')}
      </h1>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.full_name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">{user?.full_name || 'Student'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile && <p className="text-sm text-muted-foreground">{getUniName(profile.university_id)} · {profile.year && tr(profile.year)}</p>}
            </div>
          </div>
          {profile && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Edit2 className="w-3.5 h-3.5" /> {tr('edit')}
            </Button>
          )}
          {editing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="w-4 h-4" /></Button>
              <Button size="sm" onClick={saveProfile}><Check className="w-4 h-4" /></Button>
            </div>
          )}
        </div>

        {editing && editForm && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">University</label>
                <Select value={editForm.university_id} onValueChange={v => setEditForm(f => ({ ...f, university_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
                <Select value={editForm.year} onValueChange={v => setEditForm(f => ({ ...f, year: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{tr(y)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Preferred language</label>
              <Select value={editForm.preferred_language} onValueChange={v => setEditForm(f => ({ ...f, preferred_language: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="he">🇮🇱 Hebrew</SelectItem>
                  <SelectItem value="ar">🇵🇸 Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Help needs</label>
              <div className="flex flex-wrap gap-2">
                {HELP_NEEDS.map(n => (
                  <button key={n} onClick={() => toggleHelp(n)}
                    className={cn('px-2.5 py-1 rounded-lg border text-xs transition-all',
                      editForm.help_needs?.includes(n) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40')}>
                    {tr(n)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!editing && profile?.help_needs?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {profile.help_needs.map(n => <Badge key={n} variant="secondary" className="text-xs">{tr(n)}</Badge>)}
          </div>
        )}
      </div>

      {/* Saved guides */}
      <section>
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" /> {tr('savedGuides')} ({savedGuides.length})
        </h2>
        {guides.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
            No saved guides yet. Browse the <Link to="/guides" className="text-primary hover:underline">guide library</Link>.
          </div>
        ) : (
          <div className="space-y-2">
            {guides.map(g => {
              const sv = savedGuides.find(s => s.guide_id === g.id);
              return (
                <div key={g.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICONS[g.category]}</span>
                  <Link to={`/guides/${g.id}`} className="flex-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {getGuideTitle(g)}
                  </Link>
                  <button onClick={() => sv && unsaveGuide(sv.id, g.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Logout */}
      <div className="pt-4">
        <Button variant="outline" onClick={() => base44.auth.logout()} className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}