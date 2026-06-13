import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Globe2, GraduationCap, LifeBuoy, Shapes } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ElysiumLogo from "@/components/elysium/ElysiumLogo";
import { cn } from "@/lib/utils";
import { demoFaculties, demoUniversity } from "@/lib/demoData";
import { isOnboardingStepValid } from "@/lib/productUtils";

const languages = [
  { key: "en", short: "EN", name: "English" },
  { key: "he", short: "עב", name: "עברית" },
  { key: "ar", short: "عر", name: "العربية" },
];
const years = ["Preparatory", "1st Year", "2nd Year", "3rd Year", "4th Year+"];
const interests = {
  en: ["Football", "Basketball", "Running", "Gym", "Board games", "Gaming", "Music", "Film", "Coffee", "Volunteering"],
  he: ["כדורגל", "כדורסל", "ריצה", "חדר כושר", "משחקי קופסה", "גיימינג", "מוזיקה", "קולנוע", "קפה", "התנדבות"],
  ar: ["كرة القدم", "كرة السلة", "الجري", "النادي الرياضي", "ألعاب الطاولة", "الألعاب الإلكترونية", "الموسيقى", "الأفلام", "القهوة", "التطوع"],
};
const helpOptions = {
  en: ["Study partners", "Private tutoring", "Peer questions", "Deadlines and scheduling", "Scholarships", "University systems", "Academic terminology", "Social belonging", "Housing and commuting", "Reserve duty support"],
  he: ["שותפים ללימוד", "שיעורים פרטיים", "שאלות לעמיתים", "מועדים ולוח זמנים", "מלגות", "מערכות האוניברסיטה", "מונחים אקדמיים", "שייכות חברתית", "מגורים ונסיעות", "תמיכה במשרתי מילואים"],
  ar: ["شركاء دراسة", "دروس خصوصية", "أسئلة للزملاء", "المواعيد والجدولة", "المنح الدراسية", "أنظمة الجامعة", "المصطلحات الأكاديمية", "الانتماء الاجتماعي", "السكن والتنقل", "دعم خدمة الاحتياط"],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { locale, setLocale, isRTL } = useLanguage();
  const p = (key) => productText(locale, key);
  const [step, setStep] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ preferred_name: "", preferred_locale: locale, university_id: "", faculty_id: "", field_of_study: "", academic_year: "", courses: [], interests: [], help_needs: [], living_context: "", language_preferences: [locale], theme_preference: "system", onboarding_complete: false });
  const [error, setError] = useState("");
  const totalSteps = 4;
  const stepIcons = [Globe2, GraduationCap, Shapes, LifeBuoy];
  const StepIcon = stepIcons[step - 1];

  useEffect(() => { base44.entities.University.list().then((rows) => setUniversities(rows?.length ? rows : [demoUniversity])).catch(() => setUniversities([demoUniversity])); }, []);
  useEffect(() => { if (form.university_id) base44.entities.Faculty.filter({ university_id: form.university_id }).then((rows) => setFaculties(rows?.length ? rows : demoFaculties)).catch(() => setFaculties(demoFaculties)); }, [form.university_id]);

  const selectLocale = (nextLocale) => {
    setLocale(nextLocale);
    setForm((current) => ({ ...current, preferred_locale: nextLocale, language_preferences: [nextLocale] }));
  };
  const toggleListValue = (field, value) => setForm((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  const canContinue = isOnboardingStepValid(form, step);
  const continueOnboarding = () => {
    if (!canContinue) { setError("Complete the required choices before continuing."); return; }
    setError("");
    setStep((current) => current + 1);
  };
  const finish = async () => {
    if (!canContinue) { setError("Choose at least one help need and your living or commuting context."); return; }
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.StudentProfile.create({ ...form, user_id: user.id, preferred_language: locale === "he" ? "Hebrew" : locale === "ar" ? "Arabic" : "English", onboarding_complete: true });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5"><ElysiumLogo size={38} /><span className="hidden text-sm font-extrabold tracking-[0.16em] sm:inline">ELYSIUM</span></div>
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
              <div className="grid gap-2 sm:grid-cols-3">{languages.map((language) => <button key={language.key} onClick={() => selectLocale(language.key)} className={cn("flex min-h-24 flex-col items-start justify-between rounded-lg border p-3 text-start", form.preferred_locale === language.key ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40")}><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-muted px-2 text-xs font-bold text-foreground">{language.short}</span><span className="mt-3 text-sm font-semibold text-foreground">{language.name}</span></button>)}</div>
              <div className="mt-6"><Label>{p("onboarding_name")}</Label><Input value={form.preferred_name} onChange={(event) => setForm((current) => ({ ...current, preferred_name: event.target.value }))} /></div>
            </Step>}

            {step === 2 && <Step title={p("onboarding_university_title")} body={p("onboarding_university_body")}>
              {universities.length ? <div className="grid gap-2 sm:grid-cols-2">{universities.map((university) => <Choice key={university.id} selected={form.university_id === university.id} onClick={() => setForm((current) => ({ ...current, university_id: university.id, faculty_id: "" }))}><p className="text-sm font-semibold text-foreground">{university.name}</p>{university.city && <p className="mt-1 text-xs text-muted-foreground">{university.city}</p>}</Choice>)}</div> : <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{p("onboarding_no_university")}</div>}
              {faculties.length > 0 && <div className="mt-5"><Label>{p("onboarding_faculty")}</Label><div className="grid gap-2 sm:grid-cols-2">{faculties.map((faculty) => <Choice key={faculty.id} selected={form.faculty_id === faculty.id} onClick={() => setForm((current) => ({ ...current, faculty_id: faculty.id }))}><p className="text-sm font-semibold text-foreground">{faculty.name}</p></Choice>)}</div></div>}
              <div className="mt-5"><Label>{p("onboarding_year")}</Label><div className="flex flex-wrap gap-2">{years.map((year) => <Pill key={year} selected={form.academic_year === year} onClick={() => setForm((current) => ({ ...current, academic_year: year }))}>{year}</Pill>)}</div></div>
              <div className="mt-5"><Label>{p("onboarding_field")}</Label><Input value={form.field_of_study} onChange={(event) => setForm((current) => ({ ...current, field_of_study: event.target.value }))} /></div>
            </Step>}

            {step === 3 && <Step title={p("onboarding_courses_title")} body={p("onboarding_courses_body")}>
              <Label>{p("onboarding_courses")}</Label><Input value={form.courses.join(", ")} onChange={(event) => setForm((current) => ({ ...current, courses: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Calculus 2, Data Structures" />
              <div className="mt-6"><Label>{p("onboarding_interests")}</Label><div className="flex flex-wrap gap-2">{interests[locale].map((interest) => <Pill key={interest} selected={form.interests.includes(interest)} onClick={() => toggleListValue("interests", interest)}>{interest}</Pill>)}</div></div>
            </Step>}

            {step === 4 && <Step title={p("onboarding_help_title")} body={p("onboarding_help_body")}>
              <div className="grid gap-2 sm:grid-cols-2">{helpOptions[locale].map((option) => <Choice key={option} selected={form.help_needs.includes(option)} onClick={() => toggleListValue("help_needs", option)}><div className="flex items-center gap-2"><span className={cn("flex h-5 w-5 items-center justify-center rounded border", form.help_needs.includes(option) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{form.help_needs.includes(option) && <Check className="h-3 w-3" />}</span><span className="text-sm font-medium text-foreground">{option}</span></div></Choice>)}</div>
              <div className="mt-6"><Label>Living and commute context</Label><div className="flex flex-wrap gap-2">{["Dorms", "Commuting", "Near Campus", "Other"].map((option) => <Pill key={option} selected={form.living_context === option} onClick={() => setForm((current) => ({ ...current, living_context: option }))}>{option}</Pill>)}</div></div>
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
function Choice({ selected, onClick, children }) { return <button onClick={onClick} className={cn("w-full rounded-lg border p-3 text-start", selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40")}>{children}</button>; }
function Pill({ selected, onClick, children }) { return <button onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground")}>{children}</button>; }
