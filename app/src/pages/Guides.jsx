import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'first_week', 'course_registration', 'exams_appeals',
  'student_rights', 'email_templates', 'mental_health', 'study_skills'
];

const CATEGORY_ICONS = {
  first_week: '🏫', course_registration: '📋', exams_appeals: '📝',
  student_rights: '⚖️', email_templates: '📧', mental_health: '🧠', study_skills: '📚'
};

export default function Guides() {
  const { tr, lang } = useLanguage();
  const [guides, setGuides] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeUni, setActiveUni] = useState('all');

  useEffect(() => {
    Promise.all([
      base44.entities.Guide.filter({ is_published: true }),
      base44.entities.University.list()
    ]).then(([g, u]) => {
      setGuides(g);
      setUniversities(u);
      setLoading(false);
    });
  }, []);

  const getTitle = (g) => {
    if (lang === 'he' && g.title_he) return g.title_he;
    if (lang === 'ar' && g.title_ar) return g.title_ar;
    return g.title;
  };

  const getSituation = (g) => {
    if (lang === 'he' && g.situation_he) return g.situation_he;
    if (lang === 'ar' && g.situation_ar) return g.situation_ar;
    return g.situation || '';
  };

  const filtered = guides.filter(g => {
    const matchCat = activeCategory === 'all' || g.category === activeCategory;
    const matchUni = activeUni === 'all' || !g.university_id || g.university_id === activeUni;
    const title = getTitle(g).toLowerCase();
    const matchSearch = !search || title.includes(search.toLowerCase()) || getSituation(g).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchUni && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> {tr('guides')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Everything you need to navigate university life.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tr('search')}
          className="ps-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40'
          )}>
          {tr('all')}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40'
            )}>
            {CATEGORY_ICONS[cat]} {tr(cat)}
          </button>
        ))}
      </div>

      {/* University filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveUni('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            activeUni === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'bg-card border-border text-muted-foreground hover:border-foreground/40'
          )}>
          🌐 All universities
        </button>
        {universities.map(u => (
          <button key={u.id}
            onClick={() => setActiveUni(u.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeUni === u.id
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-foreground/40'
            )}>
            {u.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} guides</p>

      {/* Guide grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{tr('noResults')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <Link key={g.id} to={`/guides/${g.id}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span className="text-2xl">{CATEGORY_ICONS[g.category]}</span>
                {!g.university_id && (
                  <Badge variant="secondary" className="text-xs">Universal</Badge>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {getTitle(g)}
                </p>
                {getSituation(g) && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{getSituation(g)}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{tr(g.category)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}