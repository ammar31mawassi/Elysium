import React, { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CalendarDays, Heart, Plus, Search, Users, Wrench, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { courseProfileUpdate, normalizeCourseRecords } from "@/lib/profileCourses";
import { mergeCourseSuggestions, registerCourses } from "@/lib/courseCatalog";
import { DEFAULT_INTERESTS, filterLocalizedOptions, localizedOption, mergeInterestOptions, normalizeOptionName } from "@/lib/onboardingOptions";
import PageLayout from "@/components/layout/PageLayout";
import SearchableChoice from "@/components/elysium/SearchableChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { domainTones } from "@/lib/domainTones";

export default function MePage() {
  const { user, profile, setProfile } = useProfile();
  const { locale } = useLanguage();
  const [courseRecords, setCourseRecords] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [courseDraft, setCourseDraft] = useState({ name: "", status: "active" });
  const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
  const [interestSearch, setInterestSearch] = useState("");
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterest, setCustomInterest] = useState({ en: "", he: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => setCourseRecords(normalizeCourseRecords(profile)), [profile]);

  useEffect(() => {
    if (!profile?.university_id) return;
    Promise.all([
      base44.entities.CourseCatalog.filter({ university_id: profile.university_id }).catch(() => []),
      base44.entities.StudySession.filter({ university_id: profile.university_id }).catch(() => []),
      base44.entities.Interest.filter({ is_active: true }).catch(() => []),
    ]).then(([catalog, sessions, interests]) => {
      setCatalogCourses(mergeCourseSuggestions(catalog, sessions));
      setInterestOptions(mergeInterestOptions(interests));
    });
  }, [profile?.university_id]);

  const courseOptions = useMemo(() => mergeCourseSuggestions(catalogCourses, courseRecords).map((name) => ({ value: name, label: name })), [catalogCourses, courseRecords]);
  const filteredInterests = useMemo(() => filterLocalizedOptions(interestOptions, interestSearch).slice(0, 24), [interestOptions, interestSearch]);

  const persistCourses = async (nextCourses) => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const update = courseProfileUpdate(nextCourses);
      await base44.entities.StudentProfile.update(profile.id, update);
      await registerCourses(base44, { universityId: profile.university_id, userId: user.id, courses: update.course_records });
      setCourseRecords(update.course_records);
      setCatalogCourses((current) => mergeCourseSuggestions(current, update.course_records));
      setProfile((current) => ({ ...current, ...update }));
      toast({ title: "Courses saved" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Courses were not saved" });
    } finally {
      setSaving(false);
    }
  };

  const addCourse = async () => {
    const name = courseDraft.name.trim();
    if (!name || courseRecords.some((course) => course.name.toLocaleLowerCase("en") === name.toLocaleLowerCase("en"))) return;
    await persistCourses([...courseRecords, { name, status: courseDraft.status, grade: "", credits: "" }]);
    setCourseDraft({ name: "", status: "active" });
  };

  const saveInterests = async (interests) => {
    try {
      await base44.entities.StudentProfile.update(profile.id, { interests });
      setProfile((current) => ({ ...current, interests }));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Interests were not saved" });
    }
  };

  const toggleInterest = (name) => {
    const current = profile?.interests || [];
    saveInterests(current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  const addCustomInterest = async () => {
    const english = customInterest.en.trim();
    const hebrew = customInterest.he.trim();
    if (!english || !hebrew || !user?.id) return;
    try {
      const existing = interestOptions.find((interest) => normalizeOptionName(interest.en) === normalizeOptionName(english));
      let option = existing;
      if (!option) {
        const record = await base44.entities.Interest.create({ name_en: english, name_he: hebrew, normalized_key: normalizeOptionName(english), created_by: user.id, is_active: true });
        option = { id: record.id, en: english, he: hebrew, ar: english, persisted: true };
        setInterestOptions((current) => [...current, option]);
      }
      if (!(profile?.interests || []).includes(option.en)) await saveInterests([...(profile?.interests || []), option.en]);
      setCustomInterest({ en: "", he: "" });
      setShowCustomInterest(false);
      setInterestSearch("");
      toast({ title: "Activity added" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Activity was not added" });
    }
  };

  return (
    <PageLayout wide>
      <header className="mb-6"><p className="text-xs font-bold uppercase tracking-wide text-primary">My Elysium</p><h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Me</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Your courses, interests, calendar, and personal student tools in one place.</p></header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <PersonalLink to="/calendar" icon={CalendarDays} label="My calendar" detail="Deadlines and joined plans" tone="calendar" />
        <PersonalLink to="/discover" icon={Users} label="My communities" detail="Activities and study groups" tone="social" />
        <PersonalLink to="/tools" icon={Wrench} label="My tools" detail="Grades, GPA, and flashcards" tone="study" />
      </div>

      <section className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-start gap-3"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.study.icon)}><BookOpenCheck className="h-5 w-5" /></span><div><h2 className="font-bold text-foreground">My courses</h2><p className="mt-1 text-xs text-muted-foreground">Active courses power study-group matching. Finished courses remain available in grade tools.</p></div></div>
        <div className="space-y-2">{courseRecords.map((course) => <div key={course.name} className="flex min-w-0 items-center gap-2 rounded-md border border-border p-2"><span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{course.name}</span><select aria-label={`${course.name} status`} value={course.status} onChange={(event) => persistCourses(courseRecords.map((item) => item.name === course.name ? { ...item, status: event.target.value } : item))} className="h-10 rounded-md border border-input bg-background px-2 text-xs"><option value="active">Active</option><option value="finished">Finished</option></select><button onClick={() => persistCourses(courseRecords.filter((item) => item.name !== course.name))} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${course.name}`}><X className="h-4 w-4" /></button></div>)}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_130px_auto]"><SearchableChoice value={courseDraft.name} options={courseOptions} allowCustom customLabel={(query) => `+ Add "${query}"`} placeholder="Search courses added by students" onChange={(option) => setCourseDraft((current) => ({ ...current, name: option?.value || "" }))} /><select aria-label="New course status" value={courseDraft.status} onChange={(event) => setCourseDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-md border border-input bg-background px-3 text-sm"><option value="active">Active</option><option value="finished">Finished</option></select><Button variant="outline" className="h-11 gap-2" disabled={saving || !courseDraft.name.trim()} onClick={addCourse}><Plus className="h-4 w-4" />Add</Button></div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-start gap-3"><span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones.social.icon)}><Heart className="h-5 w-5" /></span><div><h2 className="font-bold text-foreground">Interests and activities</h2><p className="mt-1 text-xs text-muted-foreground">These improve recommendations but do not hide other campus activities.</p></div></div>
        <div className="relative"><Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" value={interestSearch} onChange={(event) => setInterestSearch(event.target.value)} placeholder="Search interests" /></div>
        <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto pe-1">{filteredInterests.map((interest) => { const selected = (profile?.interests || []).includes(interest.en); return <button key={interest.id} type="button" onClick={() => toggleInterest(interest.en)} className={cn("min-h-10 rounded-full border px-3 py-1.5 text-xs font-semibold", selected ? "border-sky-600 bg-sky-600 text-white" : "border-border text-muted-foreground hover:border-sky-500/50 hover:text-foreground")}>{localizedOption(interest, locale)}</button>; })}</div>
        <Button variant="outline" className="mt-3 gap-2" onClick={() => setShowCustomInterest((current) => !current)}><Plus className="h-4 w-4" />+ Add a new activity</Button>
        {showCustomInterest && <div className="mt-3 rounded-md border border-border p-3"><p className="mb-2 text-xs text-muted-foreground">Add English and Hebrew names so students can find the activity in either language.</p><div className="grid gap-2 sm:grid-cols-2"><Input value={customInterest.en} onChange={(event) => setCustomInterest((current) => ({ ...current, en: event.target.value }))} placeholder="English name" /><Input dir="rtl" value={customInterest.he} onChange={(event) => setCustomInterest((current) => ({ ...current, he: event.target.value }))} placeholder="Hebrew name" /></div><Button className="mt-3" disabled={!customInterest.en.trim() || !customInterest.he.trim()} onClick={addCustomInterest}>Add activity</Button></div>}
      </section>
    </PageLayout>
  );
}

function PersonalLink({ to, icon: Icon, label, detail, tone }) {
  return <Link to={to} className={cn("rounded-lg border border-border bg-card p-4 transition-colors", domainTones[tone].border)}><span className={cn("flex h-9 w-9 items-center justify-center rounded-md", domainTones[tone].icon)}><Icon className="h-4 w-4" /></span><p className="mt-3 text-sm font-bold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></Link>;
}
