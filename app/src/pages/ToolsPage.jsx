import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bell,
  Calculator,
  CalendarSync,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Layers3,
  Map,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  Upload,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { calculateGpa, calculateRequiredGrade, localizedField } from "@/lib/productUtils";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";

const toolDefinitions = [
  { key: "gpa", icon: Calculator, component: GpaCalculator },
  { key: "grade", icon: Target, component: GradeNeeded },
  { key: "flashcards", icon: Layers3, component: FlashcardsSection },
];

const plannedFeatures = [
  [CreditCard, "Tutor payments"],
  [MessageSquare, "In-app messaging"],
  [CalendarSync, "Google and Outlook sync"],
  [Bell, "Push notifications"],
  [Upload, "Moodle, Inbar and syllabus import"],
  [Map, "Campus maps"],
  [Sparkles, "Advanced Ely automation"],
];

function safeQuery(promise) {
  return promise.catch(() => []);
}

export default function ToolsPage() {
  const [params] = useSearchParams();
  const { profile } = useProfile();
  const { t, locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const [guides, setGuides] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeTool, setActiveTool] = useState(params.get("tool") || null);
  const [expandedGuide, setExpandedGuide] = useState(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      safeQuery(base44.entities.Guide.filter({ is_published: true })),
      safeQuery(base44.entities.HelpfulLink.filter({ is_published: true })),
    ]).then(([guideRows, linkRows]) => {
      setGuides(withDemoFallback((guideRows || []).filter((item) => !item.university_id || item.university_id === profile.university_id), demoContent.guides));
      setLinks(withDemoFallback((linkRows || []).filter((item) => !item.university_id || item.university_id === profile.university_id), demoContent.links));
    });
  }, [profile]);

  const toolLabels = { gpa: t("tools_gpa"), grade: t("tools_grade"), flashcards: t("tools_flashcards") };
  const activeDefinition = toolDefinitions.find((tool) => tool.key === activeTool);

  return (
    <PageLayout wide>
      <header className="mb-7 max-w-2xl"><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("tools_title")}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("tools_body")}</p></header>

      <SectionHeader label={t("tools_calculators")} />
      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-3">
        {toolDefinitions.map(({ key, icon: Icon }) => <button key={key} onClick={() => setActiveTool(activeTool === key ? null : key)} className={cn("min-h-28 rounded-lg border p-3 text-start transition-colors", activeTool === key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")}><span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="mt-3 block text-sm font-semibold text-foreground">{toolLabels[key]}</span></button>)}
      </div>

      {activeDefinition && <section className="mb-7 rounded-lg border border-border bg-card p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-foreground">{toolLabels[activeDefinition.key]}</h2><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => setActiveTool(null)} aria-label="Close tool"><X className="h-4 w-4" /></button></div>{React.createElement(activeDefinition.component)}</section>}

      <SectionHeader label={t("tools_find_person")} />
      <div className="mb-7 grid grid-cols-2 gap-2">
        <Link to="/discover?tab=tutors" className="min-h-28 rounded-lg border border-border bg-card p-3 hover:border-primary/40"><GraduationCap className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{t("nav_tutors")}</p><p className="mt-1 text-xs text-muted-foreground">{t("tools_tutor_short")}</p></Link>
        <Link to="/discover?tab=helpers" className="min-h-28 rounded-lg border border-border bg-card p-3 hover:border-primary/40"><HelpCircle className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{t("nav_helpers")}</p><p className="mt-1 text-xs text-muted-foreground">{t("tools_helper_short")}</p></Link>
      </div>

      <SectionHeader label={t("tools_links")} />
      <div className="mb-7 grid gap-2 md:grid-cols-2">{links.map((link) => <a key={link.id} href={link.official_url} target="_blank" rel="noreferrer" className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40" dir="auto"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{localizedField(link, "title", locale)}</p><p className="mt-1 text-xs text-muted-foreground">{localizedField(link, "description", locale)}</p>{link.last_reviewed_date && <p className="mt-1 text-[11px] text-muted-foreground">Reviewed {link.last_reviewed_date}</p>}</div><ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" /></a>)}</div>

      <SectionHeader label={t("tools_guides")} />
      <div className="mb-7 space-y-2">{guides.map((guide) => <GuideRow key={guide.id} guide={guide} locale={locale} expanded={expandedGuide === guide.id} onToggle={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)} />)}</div>

      <SectionHeader label="Coming soon" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{plannedFeatures.map(([Icon, label]) => <div key={label} className="flex min-h-16 items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3 opacity-70"><Icon className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="text-sm font-medium text-muted-foreground">{label}</span></div>)}</div>
    </PageLayout>
  );
}

function SectionHeader({ label }) {
  return <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{label}</h2>;
}

function GuideRow({ guide, locale, expanded, onToggle }) {
  return <article className="overflow-hidden rounded-lg border border-border bg-card" dir="auto"><button onClick={onToggle} className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-muted/30"><div><p className="text-sm font-semibold text-foreground">{localizedField(guide, "title", locale)}</p><p className="mt-1 text-xs text-muted-foreground">{guide.category}</p></div>{expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}</button>{expanded && <div className="space-y-3 border-t border-border px-4 py-4"><p className="text-sm text-muted-foreground">{localizedField(guide, "situation", locale)}</p><p className="text-sm leading-relaxed text-foreground">{localizedField(guide, "content", locale)}</p>{localizedField(guide, "what_to_do", locale) && <div><p className="text-xs font-semibold text-primary">Next steps</p><p className="mt-1 whitespace-pre-line text-sm text-foreground">{localizedField(guide, "what_to_do", locale)}</p></div>}{guide.source_url && <a href={guide.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ExternalLink className="h-4 w-4" />Official source</a>}</div>}</article>;
}

function GpaCalculator() {
  const [courses, setCourses] = useState([{ name: "", grade: "", credits: "" }]);
  const result = useMemo(() => calculateGpa(courses), [courses]);
  const updateCourse = (index, field, value) => setCourses((current) => current.map((course, courseIndex) => courseIndex === index ? { ...course, [field]: value } : course));
  return <div className="space-y-3">{courses.map((course, index) => <div key={index} className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_44px] gap-2"><Input aria-label="Course" placeholder="Course" value={course.name} onChange={(event) => updateCourse(index, "name", event.target.value)} /><Input aria-label="Grade" type="number" min="0" max="100" placeholder="Grade" value={course.grade} onChange={(event) => updateCourse(index, "grade", event.target.value)} /><Input aria-label="Credits" type="number" min="0.5" max="20" step="0.5" placeholder="Credits" value={course.credits} onChange={(event) => updateCourse(index, "credits", event.target.value)} /><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setCourses((current) => current.length > 1 ? current.filter((_, courseIndex) => courseIndex !== index) : current)} aria-label="Remove course"><X className="h-4 w-4" /></button></div>)}<Button variant="outline" className="gap-2" onClick={() => setCourses((current) => [...current, { name: "", grade: "", credits: "" }])}><Plus className="h-4 w-4" />Add course</Button>{result && <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center"><p className="text-xs text-muted-foreground">Weighted average across {result.credits} credits</p><p className="mt-1 text-4xl font-bold text-primary">{result.average.toFixed(2)}</p><p className="mt-2 text-xs text-muted-foreground">Sum of grade times credits, divided by total credits.</p></div>}</div>;
}

function GradeNeeded() {
  const [current, setCurrent] = useState("");
  const [completedWeight, setCompletedWeight] = useState("");
  const [target, setTarget] = useState("60");
  const needed = useMemo(() => calculateRequiredGrade(current, completedWeight, target), [current, completedWeight, target]);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Field label="Current average"><Input type="number" min="0" max="100" value={current} onChange={(event) => setCurrent(event.target.value)} /></Field><Field label="Coursework completed (%)"><Input type="number" min="0" max="99" value={completedWeight} onChange={(event) => setCompletedWeight(event.target.value)} /></Field><Field label="Target final grade"><Input type="number" min="0" max="100" value={target} onChange={(event) => setTarget(event.target.value)} /></Field></div>{needed !== null && <div className={cn("rounded-lg border p-4 text-center", needed > 100 ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-primary/5")}><p className="text-xs text-muted-foreground">Required average on the remaining work</p><p className={cn("mt-1 text-4xl font-bold", needed > 100 ? "text-destructive" : "text-primary")}>{needed <= 0 ? "Target reached" : needed > 100 ? "Above 100" : needed.toFixed(1)}</p></div>}</div>;
}

function FlashcardsSection() {
  const { user } = useProfile();
  const { locale, isRTL } = useLanguage();
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  useEffect(() => { if (user?.id) safeQuery(base44.entities.FlashcardDeck.filter({ owner_user_id: user.id })).then(setDecks); }, [user?.id]);
  useEffect(() => { if (activeDeck) safeQuery(base44.entities.Flashcard.filter({ deck_id: activeDeck.id })).then((rows) => setCards((rows || []).sort((a, b) => (a.card_order || 0) - (b.card_order || 0)))); }, [activeDeck]);

  const createDeck = async () => { if (!user?.id || !deckName) return; const deck = await base44.entities.FlashcardDeck.create({ owner_user_id: user.id, name: deckName, language: locale }); setDecks((current) => [...current, deck]); setActiveDeck(deck); setDeckName(""); };
  const addCard = async () => { if (!user?.id || !activeDeck || !front || !back) return; const card = await base44.entities.Flashcard.create({ owner_user_id: user.id, deck_id: activeDeck.id, front, back, card_order: cards.length, review_status: "new" }); setCards((current) => [...current, card]); setFront(""); setBack(""); };
  const previousIcon = isRTL ? ChevronRight : ChevronLeft;
  const nextIcon = isRTL ? ChevronLeft : ChevronRight;
  const PreviousIcon = previousIcon;
  const NextIcon = nextIcon;

  if (!activeDeck) return <div><div className="mb-3 grid gap-2 sm:grid-cols-2">{decks.map((deck) => <button key={deck.id} className="min-h-16 rounded-lg border border-border bg-muted/20 p-3 text-start hover:border-primary/40" onClick={() => setActiveDeck(deck)}><p className="text-sm font-semibold text-foreground">{deck.name}</p><p className="mt-1 text-xs text-muted-foreground">{deck.subject || "Flashcard deck"}</p></button>)}</div><div className="flex gap-2"><Input value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder="New deck name" /><Button disabled={!deckName} onClick={createDeck}>Create</Button></div></div>;

  const currentCard = cards[cardIndex];
  return <div><button className="mb-4 min-h-11 text-sm font-semibold text-primary" onClick={() => { setActiveDeck(null); setCards([]); }}>All decks</button><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-foreground">{activeDeck.name}</h3><span className="text-xs text-muted-foreground">{cards.length} cards</span></div>{currentCard && <div><button className={cn("flex min-h-44 w-full items-center justify-center rounded-lg border p-6 text-center", flipped ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/30 text-foreground")} onClick={() => setFlipped((current) => !current)} dir="auto"><span className="text-lg font-semibold">{flipped ? currentCard.back : currentCard.front}</span></button><div className="mt-3 flex items-center justify-between"><button className="flex h-11 w-11 items-center justify-center rounded-md border border-border" onClick={() => { setCardIndex((current) => Math.max(0, current - 1)); setFlipped(false); }} aria-label="Previous card"><PreviousIcon className="h-4 w-4" /></button><span className="text-xs text-muted-foreground">{cardIndex + 1} / {cards.length}</span><button className="flex h-11 w-11 items-center justify-center rounded-md border border-border" onClick={() => { setCardIndex((current) => Math.min(cards.length - 1, current + 1)); setFlipped(false); }} aria-label="Next card"><NextIcon className="h-4 w-4" /></button></div></div>}<div className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto]"><Input value={front} onChange={(event) => setFront(event.target.value)} placeholder="Front" /><Input value={back} onChange={(event) => setBack(event.target.value)} placeholder="Back" /><Button disabled={!front || !back} onClick={addCard}>Add card</Button></div></div>;
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
