import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { Plus, X, ChevronDown, ChevronUp, ExternalLink, GraduationCap, HelpCircle, Calculator, Target, Layers3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";
import { productText } from "@/lib/productCopy";

const TOOL_ICONS = { gpa: Calculator, grade: Target, flashcards: Layers3 };

export default function ToolsPage() {
  const [params] = useSearchParams();
  const { profile } = useProfile();
  const { t, locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const [guides, setGuides] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeTool, setActiveTool] = useState(params.get('tool') || null);
  const [expandedGuide, setExpandedGuide] = useState(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      base44.entities.Guide.filter({ is_published: true }),
      base44.entities.HelpfulLink.filter({ is_published: true }),
    ]).then(([g, l]) => {
      setGuides((g || []).filter(x => !x.university_id || x.university_id === profile.university_id));
      setLinks((l || []).filter(x => !x.university_id || x.university_id === profile.university_id));
    });
  }, [profile?.university_id]);

  const TOOLS = [
    { key: 'gpa', label: t('tools_gpa'), emoji: '🎓', Component: GpaCalculator },
    { key: 'grade', label: t('tools_grade'), emoji: '🎯', Component: GradeNeeded },
    { key: 'flashcards', label: t('tools_flashcards'), emoji: '🃏', Component: FlashcardsSection },
  ];

  return (
    <PageLayout wide>
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p('tools_title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p('tools_body')}</p>
      </header>
      {/* SECTION A: CALCULATORS */}
      <SectionHeader label={t('tools_calculators')} />
      <div className="grid grid-cols-2 gap-2 mb-6 md:grid-cols-3">
        {TOOLS.map(tool => (
          <button key={tool.key} onClick={() => setActiveTool(activeTool === tool.key ? null : tool.key)}
            className={cn("flex flex-col items-start gap-2 p-3 rounded-lg border text-start transition-all hover:shadow-sm", activeTool === tool.key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              {React.createElement(TOOL_ICONS[tool.key], { className: "h-4 w-4" })}
            </span>
            <span className="text-sm font-semibold text-foreground">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Active tool panel */}
      {activeTool && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{TOOLS.find(tool => tool.key === activeTool)?.label}</h3>
            <button onClick={() => setActiveTool(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {TOOLS.find(tool => tool.key === activeTool)?.Component && React.createElement(TOOLS.find(tool => tool.key === activeTool).Component, { t, locale })}
        </div>
      )}

      {/* SECTION C: FIND A PERSON */}
      <SectionHeader label={t('tools_find_person')} />
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Link to="/discover?tab=tutors">
          <div className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-semibold text-foreground">{t('nav_tutors')}</p>
            <p className="text-xs text-muted-foreground leading-tight">{t('tools_tutor_short')}</p>
          </div>
        </Link>
        <Link to="/discover?tab=helpers">
          <div className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
            <HelpCircle className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">{t('nav_helpers')}</p>
            <p className="text-xs text-muted-foreground leading-tight">{t('tools_helper_short')}</p>
          </div>
        </Link>
      </div>

      {/* SECTION D: HELPFUL LINKS */}
      {links.length > 0 && (
        <>
          <SectionHeader label={t('tools_links')} />
          <div className="space-y-2 mb-6">
            {links.map(link => (
              <a key={link.id} href={link.official_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {locale === 'he' && link.title_he ? link.title_he : locale === 'ar' && link.title_ar ? link.title_ar : link.title}
                  </p>
                  {link.description && <p className="text-xs text-muted-foreground truncate">{link.description}</p>}
                  {link.last_reviewed_date && <p className="text-xs text-muted-foreground/60">{t('common_last_reviewed')}: {link.last_reviewed_date}</p>}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </>
      )}

      {/* SECTION E: GUIDES */}
      {guides.length > 0 && (
        <>
          <SectionHeader label={t('tools_guides')} />
          <div className="space-y-2">
            {guides.map(guide => (
              <GuideRow key={guide.id} guide={guide} expanded={expandedGuide === guide.id} onToggle={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)} t={t} />
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}

function SectionHeader({ label }) {
  return <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</h2>;
}

function GuideRow({ guide, expanded, onToggle, t }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-muted/40 transition-colors">
        <div>
          <p className="text-sm font-medium text-foreground">{guide.title}</p>
          <p className="text-xs text-muted-foreground">{guide.category}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fade-in">
          {guide.situation && <p className="text-xs text-muted-foreground italic leading-relaxed">{guide.situation}</p>}
          {guide.content && <p className="text-sm text-foreground leading-relaxed">{guide.content}</p>}
          {guide.what_to_do && (
            <div>
              <p className="text-xs font-semibold text-primary mb-1.5">What to do:</p>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{guide.what_to_do}</p>
            </div>
          )}
          {guide.who_to_contact && <p className="text-xs text-muted-foreground"><span className="font-semibold">Contact:</span> {guide.who_to_contact}</p>}
          {guide.source_url && (
            <a href={guide.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" />{t('common_official_source')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* GPA Calculator */
function GpaCalculator({ t }) {
  const [courses, setCourses] = useState([{ name: '', grade: '', credits: '' }]);

  const addCourse = () => setCourses(c => [...c, { name: '', grade: '', credits: '' }]);
  const removeCourse = (i) => setCourses(c => c.filter((_, idx) => idx !== i));
  const update = (i, field, val) => setCourses(c => c.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const result = useMemo(() => {
    const valid = courses.filter(c => c.grade !== '' && c.credits !== '' && !isNaN(+c.grade) && !isNaN(+c.credits) && +c.credits > 0);
    if (!valid.length) return null;
    const totalCredits = valid.reduce((s, c) => s + +c.credits, 0);
    const weighted = valid.reduce((s, c) => s + +c.grade * +c.credits, 0);
    return { avg: (weighted / totalCredits).toFixed(2), totalCredits };
  }, [courses]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {courses.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input className="flex-[2] text-xs h-8" placeholder="Course" value={c.name} onChange={e => update(i, 'name', e.target.value)} />
            <Input className="flex-1 text-xs h-8" placeholder="Grade" type="number" min={0} max={100} value={c.grade} onChange={e => update(i, 'grade', e.target.value)} />
            <Input className="flex-1 text-xs h-8" placeholder="Credits" type="number" min={1} max={10} value={c.credits} onChange={e => update(i, 'credits', e.target.value)} />
            {courses.length > 1 && <button onClick={() => removeCourse(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-4 h-4" /></button>}
          </div>
        ))}
      </div>
      <button onClick={addCourse} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
        <Plus className="w-3.5 h-3.5" /> Add course
      </button>
      {result && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Weighted Average ({result.totalCredits} credits)</p>
          <p className="text-4xl font-bold text-primary">{result.avg}</p>
          <div className="w-full bg-border rounded-full h-2 mt-3">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (+result.avg / 100) * 100)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Formula: Σ(grade × credits) / Σcredits</p>
        </div>
      )}
    </div>
  );
}

/* Grade Needed */
function GradeNeeded({ t }) {
  const [current, setCurrent] = useState('');
  const [weight, setWeight] = useState('');
  const [target, setTarget] = useState('60');

  const needed = useMemo(() => {
    const c = parseFloat(current), w = parseFloat(weight) / 100, tgt = parseFloat(target);
    if (isNaN(c) || isNaN(w) || isNaN(tgt) || w <= 0 || w >= 1 || c < 0 || c > 100) return null;
    const n = (tgt - c * (1 - w)) / w;
    return n;
  }, [current, weight, target]);

  const isImpossible = needed !== null && needed > 100;
  const isAlready = needed !== null && needed <= 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Current score (0–100)</label>
          <Input type="number" min={0} max={100} value={current} onChange={e => setCurrent(e.target.value)} className="text-sm" placeholder="65" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Final exam weight (%)</label>
          <Input type="number" min={1} max={99} value={weight} onChange={e => setWeight(e.target.value)} className="text-sm" placeholder="40" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Target grade</label>
        <div className="flex gap-1.5">
          {['55', '60', '70', '80', '90'].map(v => (
            <button key={v} onClick={() => setTarget(v)} className={cn("flex-1 py-2 rounded-md border text-xs font-semibold transition-all", target === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{v}</button>
          ))}
        </div>
      </div>
      {needed !== null && !isNaN(needed) && (
        <div className={cn("rounded-lg p-4 text-center border", isImpossible ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : isAlready ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-primary/5 border-primary/20")}>
          <p className="text-xs text-muted-foreground mb-1">You need on the final exam</p>
          <p className={cn("text-4xl font-bold", isImpossible ? "text-destructive" : isAlready ? "text-success" : "text-primary")}>
            {isAlready ? '✓' : isImpossible ? '✗' : `${needed.toFixed(1)}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isImpossible ? 'Not achievable — the required score exceeds 100.' : isAlready ? 'You have already reached your target!' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

/* Flashcards */
function FlashcardsSection({ t }) {
  const { user } = useProfile();
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.FlashcardDeck.filter({ owner_user_id: user.id }).then(setDecks);
  }, [user?.id]);

  useEffect(() => {
    if (!activeDeck) return;
    base44.entities.Flashcard.filter({ deck_id: activeDeck.id }).then(c => setCards((c || []).sort((a, b) => (a.card_order || 0) - (b.card_order || 0))));
  }, [activeDeck?.id]);

  const createDeck = async () => {
    if (!newDeckName || !user?.id) return;
    setSaving(true);
    const d = await base44.entities.FlashcardDeck.create({ name: newDeckName, owner_user_id: user.id });
    setDecks(p => [...p, d]);
    setActiveDeck(d);
    setNewDeckName('');
    setSaving(false);
  };

  const addCard = async () => {
    if (!newFront || !newBack || !activeDeck || !user?.id) return;
    const c = await base44.entities.Flashcard.create({ deck_id: activeDeck.id, owner_user_id: user.id, front: newFront, back: newBack, card_order: cards.length });
    setCards(p => [...p, c]);
    setNewFront(''); setNewBack('');
  };

  const currentDeck = activeDeck ? (decks.find(d => d.id === activeDeck.id) || activeDeck) : null;

  if (studyMode && currentDeck) return (
    <div>
      <button onClick={() => setStudyMode(false)} className="text-xs text-primary mb-3 font-semibold hover:underline">← Back to deck</button>
      {cards.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No cards yet.</p> : (
        <div>
          <div className="cursor-pointer" onClick={() => setFlipped(f => !f)}>
            <div className={cn("rounded-xl p-8 text-center min-h-[160px] flex items-center justify-center transition-colors border", flipped ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border")}>
              <p className="text-lg font-bold leading-relaxed">{flipped ? cards[cardIndex]?.back : cards[cardIndex]?.front}</p>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-1.5">{flipped ? 'Back' : 'Front'} — tap to flip</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setFlipped(false); }} className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">←</button>
            <span className="text-xs text-muted-foreground">{cardIndex + 1} / {cards.length}</span>
            <button onClick={() => { setCardIndex(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">→</button>
          </div>
        </div>
      )}
    </div>
  );

  if (activeDeck && currentDeck) return (
    <div>
      <button onClick={() => setActiveDeck(null)} className="text-xs text-primary mb-3 font-semibold hover:underline">← All decks</button>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{currentDeck.name} ({cards.length} cards)</p>
        {cards.length > 0 && <button onClick={() => { setStudyMode(true); setCardIndex(0); setFlipped(false); }} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-semibold">Study ▶</button>}
      </div>
      <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
        {cards.map((c, i) => (
          <div key={c.id} className="flex gap-2 text-xs p-2 bg-muted/40 rounded-lg">
            <span className="flex-1 font-medium">{c.front}</span>
            <span className="text-muted-foreground flex-1">{c.back}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-2 border-t border-border">
        <Input className="text-sm" placeholder="Front" value={newFront} onChange={e => setNewFront(e.target.value)} />
        <Input className="text-sm" placeholder="Back" value={newBack} onChange={e => setNewBack(e.target.value)} />
        <Button size="sm" className="w-full" disabled={!newFront || !newBack} onClick={addCard}>+ Add Card</Button>
      </div>
    </div>
  );

  return (
    <div>
      {decks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-3 mb-3">No decks yet.</p> : (
        <div className="space-y-1.5 mb-3">
          {decks.map(d => (
            <button key={d.id} onClick={() => setActiveDeck(d)} className="w-full text-start p-3 bg-muted/40 hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
              <p className="text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.subject || ''}</p>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input className="flex-1 text-sm" placeholder="New deck name…" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} />
        <Button size="sm" disabled={!newDeckName || saving} onClick={createDeck}>Create</Button>
      </div>
    </div>
  );
}
