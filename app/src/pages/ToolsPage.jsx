import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  Calculator,
  CalendarSync,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Layers3,
  Map,
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
import { calculateNeededRequirementAverage, localizedField } from "@/lib/productUtils";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import LoadFailedState from "@/components/ui/LoadFailedState";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";
import { base44ErrorMessage, loadBase44Collection } from "@/lib/base44LoadState";

const toolDefinitions = [
  { key: "grade", icon: Target, component: GradeNeeded },
];

const toolLinks = [
  { key: "gpa", icon: Calculator, to: "/tools/gpa" },
  { key: "flashcards", icon: Layers3, to: "/flashcards" },
];

const plannedFeatures = [
  [CreditCard, "Tutor payments"],
  [CalendarSync, "Google and Outlook sync"],
  [Bell, "Push notifications"],
  [Upload, "Moodle, Inbar and syllabus import"],
  [Map, "Campus maps"],
  [Sparkles, "Advanced Ely automation"],
];

function makeRequirementRow(requirement = {}) {
  return { name: "", weight: "", grade: "", ...requirement, _rowId: `${Date.now()}-${Math.random()}` };
}

export default function ToolsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { t, locale } = useLanguage();
  const p = (key) => productText(locale, key);
  const [guides, setGuides] = useState([]);
  const [links, setLinks] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");
  const [resourcesLoadKey, setResourcesLoadKey] = useState(0);
  const [activeTool, setActiveTool] = useState(params.get("tool") || null);
  const [expandedGuide, setExpandedGuide] = useState(null);

  useEffect(() => {
    if (params.get("tool") === "flashcards") {
      navigate("/flashcards", { replace: true });
    }
    if (params.get("tool") === "gpa") {
      navigate("/tools/gpa", { replace: true });
    }
  }, [navigate, params]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    setResourcesLoading(true);
    setResourcesError("");
    Promise.all([
      loadBase44Collection(() => base44.entities.Guide.filter({ is_published: true }), "Guides timed out"),
      loadBase44Collection(() => base44.entities.HelpfulLink.filter({ is_published: true }), "Helpful links timed out"),
    ]).then(([guideRows, linkRows]) => {
      if (!active) return;
      setGuides(withDemoFallback((guideRows || []).filter((item) => !item.university_id || item.university_id === profile.university_id), demoContent.guides));
      setLinks(withDemoFallback((linkRows || []).filter((item) => !item.university_id || item.university_id === profile.university_id), demoContent.links));
    }).catch((error) => {
      if (active) setResourcesError(base44ErrorMessage(error));
    }).finally(() => active && setResourcesLoading(false));
    return () => { active = false; };
  }, [profile, resourcesLoadKey]);

  const toolLabels = { gpa: t("tools_gpa"), grade: t("tools_grade"), flashcards: t("tools_flashcards") };
  const activeDefinition = toolDefinitions.find((tool) => tool.key === activeTool);

  return (
    <PageLayout wide>
      <header className="mb-7 max-w-2xl"><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("tools_title")}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p("tools_body")}</p></header>

      <SectionHeader label={t("tools_calculators")} />
      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-3">
        {toolLinks.map(({ key, icon: Icon, to }) => <Link key={key} to={to} className="min-h-28 rounded-lg border border-border bg-card p-3 text-start transition-colors hover:border-primary/40"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="mt-3 block text-sm font-semibold text-foreground">{toolLabels[key]}</span></Link>)}
        {toolDefinitions.map(({ key, icon: Icon }) => <button key={key} onClick={() => setActiveTool(activeTool === key ? null : key)} className={cn("min-h-28 rounded-lg border p-3 text-start transition-colors", activeTool === key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")}><span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="mt-3 block text-sm font-semibold text-foreground">{toolLabels[key]}</span></button>)}
      </div>

      {activeDefinition && <section className="mb-7 rounded-lg border border-border bg-card p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-foreground">{toolLabels[activeDefinition.key]}</h2><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => setActiveTool(null)} aria-label="Close tool"><X className="h-4 w-4" /></button></div>{React.createElement(activeDefinition.component)}</section>}

      <SectionHeader label={t("tools_find_person")} />
      <div className="mb-7 grid grid-cols-2 gap-2">
        <Link to="/discover?tab=tutors" className="min-h-28 rounded-lg border border-border bg-card p-3 hover:border-primary/40"><GraduationCap className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{t("nav_tutors")}</p><p className="mt-1 text-xs text-muted-foreground">{t("tools_tutor_short")}</p></Link>
        <Link to="/discover?tab=helpers" className="min-h-28 rounded-lg border border-border bg-card p-3 hover:border-primary/40"><HelpCircle className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{t("nav_helpers")}</p><p className="mt-1 text-xs text-muted-foreground">{t("tools_helper_short")}</p></Link>
      </div>

      <SectionHeader label={t("tools_links")} />
      {resourcesError ? (
        <div className="mb-7">
          <LoadFailedState message={resourcesError} onRetry={() => setResourcesLoadKey((key) => key + 1)} />
        </div>
      ) : resourcesLoading ? (
        <div className="mb-7 grid gap-2 md:grid-cols-2"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
      ) : (
        links.length ? (
          <div className="mb-7 grid gap-2 md:grid-cols-2">{links.map((link) => <a key={link.id} href={link.official_url} target="_blank" rel="noreferrer" className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40" dir="auto"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{localizedField(link, "title", locale)}</p><p className="mt-1 text-xs text-muted-foreground">{localizedField(link, "description", locale)}</p>{link.last_reviewed_date && <p className="mt-1 text-[11px] text-muted-foreground">Reviewed {link.last_reviewed_date}</p>}</div><ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" /></a>)}</div>
        ) : (
          <div className="mb-7 rounded-lg border border-dashed border-border bg-card">
            <EmptyState icon={ExternalLink} title="No helpful links yet" message="Official links for your university will appear here once they are published." />
          </div>
        )
      )}

      <SectionHeader label={t("tools_guides")} />
      {resourcesError ? null : resourcesLoading ? (
        <div className="mb-7 space-y-2"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
      ) : (
        guides.length ? (
          <div className="mb-7 space-y-2">{guides.map((guide) => <GuideRow key={guide.id} guide={guide} locale={locale} expanded={expandedGuide === guide.id} onToggle={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)} />)}</div>
        ) : (
          <div className="mb-7 rounded-lg border border-dashed border-border bg-card">
            <EmptyState icon={GraduationCap} title="No guides yet" message="Campus guides for your university will appear here once they are published." />
          </div>
        )
      )}

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

function GradeNeeded() {
  const [target, setTarget] = useState("60");
  const [requirements, setRequirements] = useState(() => [
    makeRequirementRow({ name: "Requirement 1", weight: "", grade: "" }),
    makeRequirementRow({ name: "Requirement 2", weight: "", grade: "" }),
    makeRequirementRow({ name: "Requirement 3", weight: "", grade: "" }),
  ]);
  const result = useMemo(() => calculateNeededRequirementAverage(requirements, target), [requirements, target]);
  const totalWeight = result?.totalWeight ?? 0;
  const weightsComplete = Math.abs(totalWeight - 100) < 0.01;
  const hasMissingRequirements = result ? result.missingWeight > 0 : false;

  const updateRequirement = (index, field, value) => {
    setRequirements((current) => current.map((requirement, requirementIndex) => (
      requirementIndex === index ? { ...requirement, [field]: value } : requirement
    )));
  };

  const addRequirement = () => {
    setRequirements((current) => [...current, makeRequirementRow({ name: `Requirement ${current.length + 1}` })]);
  };

  const removeRequirement = (index) => {
    setRequirements((current) => current.length > 1 ? current.filter((_, requirementIndex) => requirementIndex !== index) : current);
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Target final grade">
        <Input type="number" min="0" max="100" value={target} onChange={(event) => setTarget(event.target.value)} />
      </Field>

      <div className="flex flex-col gap-3">
        {requirements.map((requirement, index) => (
          <div key={requirement._rowId} className="grid min-w-0 gap-2 rounded-md border border-border p-2 sm:grid-cols-[minmax(0,2fr)_minmax(88px,1fr)_minmax(88px,1fr)_44px] sm:border-0 sm:p-0">
            <Input
              className="min-w-0"
              aria-label={`Requirement ${index + 1} name`}
              placeholder="Requirement name"
              value={requirement.name}
              onChange={(event) => updateRequirement(index, "name", event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <Input
                className="min-w-0"
                aria-label={`Requirement ${index + 1} percentage`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="%"
                value={requirement.weight}
                onChange={(event) => updateRequirement(index, "weight", event.target.value)}
              />
              <Input
                className="min-w-0"
                aria-label={`Requirement ${index + 1} grade`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Grade"
                value={requirement.grade}
                onChange={(event) => updateRequirement(index, "grade", event.target.value)}
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeRequirement(index)} aria-label={`Remove requirement ${index + 1}`}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={addRequirement}><Plus className="h-4 w-4" />Add requirement</Button>
        <span className={cn("text-xs font-semibold", weightsComplete ? "text-primary" : "text-muted-foreground")}>Weights entered: {totalWeight.toFixed(1)}%</span>
      </div>

      {result && !weightsComplete && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          Add requirements until the weights total 100%.
        </div>
      )}

      {result && weightsComplete && hasMissingRequirements && (
        <div className={cn("rounded-lg border p-4 text-center", result.neededAverage > 100 ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-primary/5")}>
          <p className="text-xs text-muted-foreground">Average needed on blank requirements</p>
          <p className={cn("mt-1 text-4xl font-bold", result.neededAverage > 100 ? "text-destructive" : "text-primary")}>{result.neededAverage <= 0 ? "Target reached" : result.neededAverage > 100 ? "Above 100" : result.neededAverage.toFixed(1)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Across the remaining {result.missingWeight.toFixed(1)}% of the course.</p>
        </div>
      )}

      {result && weightsComplete && !hasMissingRequirements && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs text-muted-foreground">Final grade from entered requirements</p>
          <p className="mt-1 text-4xl font-bold text-primary">{result.finalGrade.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
