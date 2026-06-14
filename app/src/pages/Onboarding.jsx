import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Globe2, GraduationCap, LifeBuoy, Plus, Search, Shapes, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ElysiumLogo from "@/components/elysium/ElysiumLogo";
import { cn } from "@/lib/utils";
import { demoUniversity } from "@/lib/demoData";
import { isOnboardingStepValid, localizedField } from "@/lib/productUtils";
import {
  DEFAULT_INTERESTS,
  FIELD_OPTIONS,
  filterLocalizedOptions,
  localizedOption,
  mergeInterestOptions,
  normalizeOptionName,
} from "@/lib/onboardingOptions";

const languages = [
  { key: "en", short: "EN", name: "English" },
  { key: "he", short: "עב", name: "עברית" },
  { key: "ar", short: "عر", name: "العربية" },
];
const years = ["Preparatory", "1st Year", "2nd Year", "3rd Year", "4th Year+"];
const helpOptions = {
  en: ["Study partners", "Private tutoring", "Peer questions", "Deadlines and scheduling", "Scholarships", "University systems", "Academic terminology", "Social belonging", "Reserve duty support"],
  he: ["שותפים ללימוד", "שיעורים פרטיים", "שאלות לעמיתים", "מועדים ולוח זמנים", "מלגות", "מערכות האוניברסיטה", "מונחים אקדמיים", "שייכות חברתית", "תמיכה במשרתי מילואים"],
  ar: ["شركاء دراسة", "دروس خصوصية", "أسئلة للزملاء", "المواعيد والجدولة", "المنح الدراسية", "أنظمة الجامعة", "المصطلحات الأكاديمية", "الانتماء الاجتماعي", "دعم خدمة الاحتياط"],
};

function safeQuery(promise, fallback = []) {
  return promise.then((rows) => rows || fallback).catch(() => fallback);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { locale, setLocale, isRTL } = useLanguage();
  const p = (key) => productText(locale, key);
  const [step, setStep] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
  const [customInterests, setCustomInterests] = useState([]);
  const [fieldQuery, setFieldQuery] = useState("");
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  const [interestSearch, setInterestSearch] = useState("");
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterest, setCustomInterest] = useState({ en: "", he: "" });
  const [customInterestMessage, setCustomInterestMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    preferred_name: "",
    preferred_locale: "en",
    university_id: "",
    field_of_study: "",
    academic_year: "",
    courses: [],
    interests: [],
    help_needs: [],
    language_preferences: ["en"],
    theme_preference: "system",
    onboarding_complete: false,
  });
  const totalSteps = 4;
  const stepIcons = [Globe2, GraduationCap, Shapes, LifeBuoy];
  const StepIcon = stepIcons[step - 1];

  useEffect(() => { setLocale("en"); }, [setLocale]);
  useEffect(() => {
    safeQuery(base44.entities.University.list(), [demoUniversity]).then((rows) => setUniversities(rows.length ? rows : [demoUniversity]));
    const interestQuery = base44.entities.Interest?.filter
      ? base44.entities.Interest.filter({ is_active: true })
      : Promise.resolve([]);
    safeQuery(interestQuery).then((rows) => setInterestOptions(mergeInterestOptions(rows)));
  }, []);

  const filteredFields = useMemo(() => filterLocalizedOptions(FIELD_OPTIONS, fieldQuery).slice(0, 8), [fieldQuery]);
  const filteredInterests = useMemo(() => filterLocalizedOptions(interestOptions, interestSearch).slice(0, 24), [interestOptions, interestSearch]);
  const canContinue = isOnboardingStepValid(form, step);

  const selectLocale = (nextLocale) => {
    setLocale(nextLocale);
    const selectedField = FIELD_OPTIONS.find((field) => field.en === form.field_of_study);
    if (selectedField) setFieldQuery(localizedOption(selectedField, nextLocale));
    setForm((current) => ({ ...current, preferred_locale: nextLocale, language_preferences: [nextLocale] }));
  };

  const chooseField = (field) => {
    setForm((current) => ({ ...current, field_of_study: field.en }));
    setFieldQuery(localizedOption(field, locale));
    setShowFieldOptions(false);
    setError("");
  };

  const toggleListValue = (field, value) => setForm((current) => ({
    ...current,
    [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value],
  }));

  const addCustomInterest = () => {
    const english = customInterest.en.trim();
    const hebrew = customInterest.he.trim();
    if (!english || !hebrew) return;
    const normalized = normalizeOptionName(english);
    const existing = interestOptions.find((interest) => normalizeOptionName(interest.en) === normalized);

    if (existing) {
      setForm((current) => ({ ...current, interests: current.interests.includes(existing.en) ? current.interests : [...current.interests, existing.en] }));
      setCustomInterestMessage(p("onboarding_interest_duplicate"));
      return;
    }

    const option = { id: `custom-${normalized.replace(/[^a-z0-9]+/g, "-")}`, en: english, he: hebrew, ar: english, custom: true };
    setInterestOptions((current) => [...current, option]);
    setCustomInterests((current) => [...current, option]);
    setForm((current) => ({ ...current, interests: [...current.interests, option.en] }));
    setCustomInterest({ en: "", he: "" });
    setCustomInterestMessage("");
    setShowCustomInterest(false);
    setInterestSearch("");
  };

  const continueOnboarding = () => {
    if (!canContinue) {
      setError(step === 2 ? p("onboarding_field_select") : "Complete the required choices before continuing.");
      return;
    }
    setError("");
    setStep((current) => current + 1);
  };

  const finish = async () => {
    setSaving(true);
    setError("");
    try {
      const user = await base44.auth.me();
      await Promise.all(customInterests.map((interest) => base44.entities.Interest.create({
        name_en: interest.en,
        name_he: interest.he,
        normalized_key: normalizeOptionName(interest.en),
        created_by: user.id,
        is_active: true,
      })));
      const profileData = {
        ...form,
        user_id: user.id,
        preferred_language: locale === "he" ? "Hebrew" : locale === "ar" ? "Arabic" : "English",
        onboarding_complete: true,
      };
      const existingProfiles = await base44.entities.StudentProfile.filter({ user_id: user.id });
      if (existingProfiles.length) {
        await base44.entities.StudentProfile.update(existingProfiles[0].id, profileData);
      } else {
        await base44.entities.StudentProfile.create(profileData);
      }
      navigate("/");
    } catch (cause) {
      console.error(cause);
      setError("Elysium could not save your profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5"><ElysiumLogo size={44} /><span className="hidden text-sm font-extrabold tracking-[0.16em] sm:inline">ELYSIUM</span></div>
          <span className="text-xs font-semibold text-muted-foreground">{p("onboarding_step")} {step} {p("onboarding_of")} {totalSteps}</span>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-5xl md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-e border-border p-7 md:flex md:flex-col">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><StepIcon className="h-5 w-5" /></span>
          <div className="mt-8 space-y-4">{Array.from({ length: totalSteps }).map((_, index) => <div key={index} className="flex items-center gap-3"><span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", index + 1 < step ? "border-primary bg-primary text-primary-foreground" : index + 1 === step ? "border-primary text-primary" : "border-border text-muted-foreground")}>{index + 1 < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={cn("h-px flex-1", index + 1 <= step ? "bg-primary" : "bg-border")} /></div>)}</div>
          <p className="mt-auto text-sm leading-relaxed text-muted-foreground">{p("onboarding_side_note")}</p>
        </aside>

        <section className="flex min-w-0 flex-col px-4 py-7 sm:px-8 md:px-12 md:py-10">
          <div className="mb-7 flex gap-1 md:hidden">{Array.from({ length: totalSteps }).map((_, index) => <span key={index} className={cn("h-1 flex-1 rounded-full", index + 1 <= step ? "bg-primary" : "bg-border")} />)}</div>
          <div className="flex-1">
            {step === 1 && <Step title={p("onboarding_language_title")} body={p("onboarding_language_body")}>
              <div className="grid gap-2 sm:grid-cols-3">{languages.map((language) => <button key={language.key} onClick={() => selectLocale(language.key)} className={cn("flex min-h-24 flex-col items-start justify-between rounded-lg border p-3 text-start transition-colors", form.preferred_locale === language.key ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40")}><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-muted px-2 text-xs font-bold text-foreground">{language.short}</span><span className="mt-3 text-sm font-semibold text-foreground">{language.name}</span></button>)}</div>
              <div className="mt-6"><Label>{p("onboarding_name")}</Label><Input value={form.preferred_name} onChange={(event) => setForm((current) => ({ ...current, preferred_name: event.target.value }))} /></div>
            </Step>}

            {step === 2 && <Step title={p("onboarding_university_title")} body={p("onboarding_university_body")}>
              {universities.length ? <div className="grid gap-2 sm:grid-cols-2">{universities.map((university) => <Choice key={university.id} selected={form.university_id === university.id} onClick={() => setForm((current) => ({ ...current, university_id: university.id }))}><p className="text-sm font-semibold text-foreground">{localizedField(university, "name", locale)}</p>{university.city && <p className="mt-1 text-xs text-muted-foreground">{university.city}</p>}</Choice>)}</div> : <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{p("onboarding_no_university")}</div>}
              <div className="mt-5"><Label>{p("onboarding_year")}</Label><div className="flex flex-wrap gap-2">{years.map((year) => <Pill key={year} selected={form.academic_year === year} onClick={() => setForm((current) => ({ ...current, academic_year: year }))}>{year}</Pill>)}</div></div>
              <div className="relative mt-5"><Label>{p("onboarding_field")}</Label><div className="relative"><Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input role="combobox" aria-expanded={showFieldOptions} aria-controls="field-options" className="ps-9" value={fieldQuery} placeholder={p("onboarding_field_search")} onFocus={() => setShowFieldOptions(true)} onChange={(event) => { setFieldQuery(event.target.value); setForm((current) => ({ ...current, field_of_study: "" })); setShowFieldOptions(true); }} /></div>{showFieldOptions && <div id="field-options" role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl">{filteredFields.length ? filteredFields.map((field) => <button key={field.id} role="option" aria-selected={form.field_of_study === field.en} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseField(field)} className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm text-popover-foreground hover:bg-muted"><span>{localizedOption(field, locale)}</span>{form.field_of_study === field.en && <Check className="h-4 w-4 text-primary" />}</button>) : <p className="px-3 py-4 text-sm text-muted-foreground">{p("onboarding_field_select")}</p>}</div>}</div>
            </Step>}

            {step === 3 && <Step title={p("onboarding_courses_title")} body={p("onboarding_courses_body")}>
              <Label>{p("onboarding_courses")}</Label><Input value={form.courses.join(", ")} onChange={(event) => setForm((current) => ({ ...current, courses: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Calculus 2, Data Structures" /><p className="mt-1.5 text-xs text-muted-foreground">{p("onboarding_courses_optional")}</p>
              <div className="mt-6"><Label>{p("onboarding_interests")}</Label><div className="relative"><Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" value={interestSearch} onChange={(event) => setInterestSearch(event.target.value)} placeholder={p("onboarding_interest_search")} /></div><div className="mt-3 flex max-h-52 flex-wrap gap-2 overflow-y-auto pe-1">{filteredInterests.map((interest) => <Pill key={interest.id} selected={form.interests.includes(interest.en)} onClick={() => toggleListValue("interests", interest.en)}>{localizedOption(interest, locale)}</Pill>)}</div><Button type="button" variant="outline" className="mt-4 min-h-11 gap-2" onClick={() => { setShowCustomInterest((current) => !current); setCustomInterestMessage(""); }}><Plus className="h-4 w-4" />{p("onboarding_add_interest")}</Button>
                {showCustomInterest && <div className="mt-3 rounded-lg border border-border bg-card p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">{p("onboarding_add_interest")}</p><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => setShowCustomInterest(false)} aria-label="Close"><X className="h-4 w-4" /></button></div><div className="mt-2 grid gap-2 sm:grid-cols-2"><Input value={customInterest.en} onChange={(event) => setCustomInterest((current) => ({ ...current, en: event.target.value }))} placeholder={p("onboarding_interest_en")} /><Input dir="rtl" value={customInterest.he} onChange={(event) => setCustomInterest((current) => ({ ...current, he: event.target.value }))} placeholder={p("onboarding_interest_he")} /></div>{customInterestMessage && <p className="mt-2 text-xs text-primary">{customInterestMessage}</p>}<Button type="button" className="mt-3" disabled={!customInterest.en.trim() || !customInterest.he.trim()} onClick={addCustomInterest}>{p("onboarding_interest_save")}</Button></div>}
              </div>
            </Step>}

            {step === 4 && <Step title={p("onboarding_help_title")} body={p("onboarding_help_body")}>
              <div className="grid gap-2 sm:grid-cols-2">{helpOptions[locale].map((option) => <Choice key={option} selected={form.help_needs.includes(option)} onClick={() => toggleListValue("help_needs", option)}><div className="flex items-center gap-2"><span className={cn("flex h-5 w-5 items-center justify-center rounded border", form.help_needs.includes(option) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{form.help_needs.includes(option) && <Check className="h-3 w-3" />}</span><span className="text-sm font-medium text-foreground">{option}</span></div></Choice>)}</div>
            </Step>}
          </div>

          {error && <p className="mt-5 text-sm font-medium text-destructive" role="alert">{error}</p>}
          <footer className="mt-8 flex gap-3 border-t border-border pt-5">{step > 1 && <Button variant="outline" className="min-h-11 min-w-28 gap-2" onClick={() => { setError(""); setStep((current) => current - 1); }}>{isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}{p("onboarding_back")}</Button>}{step < totalSteps ? <Button className="ms-auto min-h-11 min-w-32 gap-2" onClick={continueOnboarding}>{p("onboarding_continue")}{isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button> : <Button className="ms-auto min-h-11 min-w-40" onClick={finish} disabled={saving}>{saving ? "..." : p("onboarding_finish")}</Button>}</footer>
        </section>
      </main>
    </div>
  );
}

function Step({ title, body, children }) { return <div className="animate-fade-in"><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1><p className="mb-7 mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>{children}</div>; }
function Label({ children }) { return <label className="mb-2 block text-xs font-semibold text-muted-foreground">{children}</label>; }
function Choice({ selected, onClick, children }) { return <button type="button" onClick={onClick} className={cn("min-h-14 w-full rounded-lg border p-3 text-start transition-colors", selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40")}>{children}</button>; }
function Pill({ selected, onClick, children }) { return <button type="button" onClick={onClick} className={cn("min-h-10 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>{children}</button>; }
