import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import { cn } from "@/lib/utils";
import { calculateGpa, directionForLocale } from "@/lib/productUtils";
import {
  COURSE_SEMESTERS,
  courseProfileUpdate,
  normalizeCourseRecords,
  normalizeCourseSemester,
} from "@/lib/profileCourses";
import { mergeCourseSuggestions, registerCourses } from "@/lib/courseCatalog";

const SEMESTER_FILTERS = [{ value: "all", label: "All", shortLabel: "All" }, ...COURSE_SEMESTERS];

const EMPTY_COURSE = {
  name: "",
  status: "active",
  semester: "semester_a",
  grade: "",
  credits: "",
};

function makeRow(course = {}) {
  return {
    ...EMPTY_COURSE,
    ...course,
    semester: normalizeCourseSemester(course.semester || EMPTY_COURSE.semester),
    _rowId: course._rowId || `${Date.now()}-${Math.random()}`,
  };
}

function displayNumber(value, digits = 2) {
  if (!Number.isFinite(Number(value))) return "N/A";
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function cleanCourses(courses) {
  return courses.filter((course) => course.name.trim());
}

function semesterMeta(value) {
  return COURSE_SEMESTERS.find((semester) => semester.value === value) || COURSE_SEMESTERS[COURSE_SEMESTERS.length - 1];
}

function buildSemesterSummaries(courses) {
  return COURSE_SEMESTERS.map((semester) => {
    const rows = courses.filter((course) => course.semester === semester.value);
    const result = calculateGpa(rows);
    const credits = rows.reduce((total, course) => {
      const hasCredits = course.credits !== "" && course.credits !== null && course.credits !== undefined;
      return hasCredits && Number.isFinite(Number(course.credits)) ? total + Number(course.credits) : total;
    }, 0);
    return {
      ...semester,
      courses: rows,
      average: result?.average ?? null,
      credits,
    };
  });
}

export default function GpaPage() {
  const { user, profile, setProfile } = useProfile();
  const { locale } = useLanguage();
  const dir = directionForLocale(locale);
  const [courses, setCourses] = useState(() => normalizeCourseRecords(profile).map(makeRow));
  const [courseSuggestions, setCourseSuggestions] = useState([]);
  const [activeSemester, setActiveSemester] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(makeRow());
  const [editingId, setEditingId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCourses(normalizeCourseRecords(profile).map(makeRow));
    setDirty(false);
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.university_id) return;
    Promise.all([
      base44.entities.CourseCatalog.filter({ university_id: profile.university_id }).catch(() => []),
      base44.entities.StudySession.filter({ university_id: profile.university_id }).catch(() => []),
    ]).then(([catalog, sessions]) => {
      setCourseSuggestions(mergeCourseSuggestions(catalog, sessions, normalizeCourseRecords(profile)));
    });
  }, [profile?.university_id]);

  const savedCourses = useMemo(() => cleanCourses(courses), [courses]);
  const overall = useMemo(() => calculateGpa(savedCourses), [savedCourses]);
  const summaries = useMemo(() => buildSemesterSummaries(savedCourses), [savedCourses]);
  const visibleSummaries = useMemo(() => (
    activeSemester === "all" ? summaries.filter((semester) => semester.courses.length) : summaries.filter((semester) => semester.value === activeSemester)
  ), [activeSemester, summaries]);
  const completedCourses = savedCourses.filter((course) => calculateGpa([course]));
  const enteredCredits = savedCourses.reduce((total, course) => {
    const hasCredits = course.credits !== "" && course.credits !== null && course.credits !== undefined;
    return hasCredits && Number.isFinite(Number(course.credits)) ? total + Number(course.credits) : total;
  }, 0);

  const openAddDialog = () => {
    setEditingId(null);
    setDraft(makeRow({ semester: activeSemester !== "all" ? activeSemester : "semester_a" }));
    setDialogOpen(true);
  };

  const openEditDialog = (course) => {
    setEditingId(course._rowId);
    setDraft(makeRow(course));
    setDialogOpen(true);
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const upsertDraft = ({ keepOpen = false } = {}) => {
    const name = draft.name.trim().replace(/\s+/g, " ");
    if (!name) return;
    const next = makeRow({ ...draft, name, semester: normalizeCourseSemester(draft.semester) });
    setCourses((current) => {
      if (editingId) {
        return current.map((course) => (course._rowId === editingId ? { ...next, _rowId: course._rowId } : course));
      }
      return [...current, next];
    });
    setDirty(true);
    if (keepOpen) {
      setEditingId(null);
      setDraft(makeRow({ semester: next.semester }));
    } else {
      setDialogOpen(false);
    }
  };

  const removeCourse = (rowId) => {
    setCourses((current) => current.filter((course) => course._rowId !== rowId));
    setDirty(true);
  };

  const saveProfileCourses = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const update = courseProfileUpdate(savedCourses);
      await base44.entities.StudentProfile.update(profile.id, update);
      await registerCourses(base44, { universityId: profile.university_id, userId: user?.id, courses: update.course_records });
      setProfile((current) => ({ ...current, ...update }));
      setCourses(update.course_records.map(makeRow));
      setCourseSuggestions((current) => mergeCourseSuggestions(current, update.course_records));
      setDirty(false);
      toast({ title: "GPA saved", description: "Your courses and grades are updated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "GPA was not saved", description: "Try again in a moment." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout wide className="max-w-7xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to="/tools" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          Tools
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_32%),linear-gradient(135deg,rgba(37,99,235,0.85),rgba(22,78,99,0.92)_52%,rgba(5,20,22,0.98))] p-5 text-white shadow-2xl shadow-primary/10 sm:p-6" dir={dir}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-100">
              <GraduationCap className="h-4 w-4" />
              Student grades
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">GPA Calculator</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Track courses by semester, save real grades to your profile, and keep your study tools in sync.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            <HeroMetric label="Average" value={overall ? displayNumber(overall.average) : "N/A"} />
            <HeroMetric label="Credits" value={displayNumber(overall?.credits ?? 0, 1)} />
            <HeroMetric label="Courses" value={String(savedCourses.length)} />
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button type="button" className="h-12 gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-400" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add course
          </Button>
          <Button
            type="button"
            className="h-12 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
            variant="outline"
            onClick={saveProfileCourses}
            disabled={saving || !dirty}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
          </Button>
          <div className="flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/10 px-3 text-center text-xs font-medium text-white/75">
            {completedCourses.length} completed with grades out of {savedCourses.length || 0}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {SEMESTER_FILTERS.map((semester) => {
            const summary = semester.value === "all" ? { average: overall?.average ?? null, credits: enteredCredits, courses: savedCourses } : summaries.find((item) => item.value === semester.value);
            const active = activeSemester === semester.value;
            return (
              <button
                key={semester.value}
                type="button"
                onClick={() => setActiveSemester(semester.value)}
                className={cn(
                  "rounded-xl border p-3 text-start transition-colors",
                  active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <span className="block text-xs font-semibold uppercase">{semester.label}</span>
                <span className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-bold">{summary?.average === null || summary?.average === undefined ? "N/A" : displayNumber(summary.average)}</span>
                  <span className="text-xs">{summary?.courses?.length || 0} courses</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {savedCourses.length ? (
            visibleSummaries.map((summary) => (
              <SemesterSection
                key={summary.value}
                summary={summary}
                onAdd={() => {
                  setActiveSemester(summary.value);
                  setEditingId(null);
                  setDraft(makeRow({ semester: summary.value }));
                  setDialogOpen(true);
                }}
                onEdit={openEditDialog}
                onRemove={removeCourse}
              />
            ))
          ) : (
            <EmptyState onAdd={openAddDialog} />
          )}
        </div>

        <aside className="space-y-3">
          <InsightCard
            icon={Calculator}
            title="How it is calculated"
            body="Each grade is multiplied by its credits. Elysium divides the total points by graded credits only, so blank grades stay out of your average."
          />
          <InsightCard
            icon={Sparkles}
            title="Course suggestions"
            body="Course names come from your profile, campus catalog, and study groups created by students at your university."
          />
          <InsightCard
            icon={BookOpenCheck}
            title="Study matching"
            body="Saved active courses still power study-group recommendations from your Me page."
          />
        </aside>
      </div>

      <CourseDialog
        courseSuggestions={courseSuggestions}
        draft={draft}
        editing={Boolean(editingId)}
        onChange={updateDraft}
        onDelete={editingId ? () => {
          removeCourse(editingId);
          setDialogOpen(false);
        } : null}
        onOpenChange={setDialogOpen}
        onSave={() => upsertDraft()}
        onSaveAndAdd={() => upsertDraft({ keepOpen: true })}
        open={dialogOpen}
      />
    </PageLayout>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
    </div>
  );
}

function SemesterSection({ summary, onAdd, onEdit, onRemove }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{summary.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.credits ? `${displayNumber(summary.credits, 1)} credits` : "No credits yet"} · {summary.average === null ? "No average yet" : `${displayNumber(summary.average)} average`}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add here
        </Button>
      </div>

      {summary.courses.length ? (
        <div className="divide-y divide-border">
          {summary.courses.map((course) => (
            <CourseRow key={course._rowId} course={course} onEdit={() => onEdit(course)} onRemove={() => onRemove(course._rowId)} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No courses in this semester yet.
        </div>
      )}
    </section>
  );
}

function CourseRow({ course, onEdit, onRemove }) {
  const hasGpa = Boolean(calculateGpa([course]));
  return (
    <article className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_170px_120px_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-bold text-foreground">{course.name}</h3>
          {hasGpa && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Included in average" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{semesterMeta(course.semester).label} · {course.status === "finished" ? "Finished" : "Active"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:text-end">
        <MetricPill label="Grade" value={course.grade === "" || course.grade === undefined ? "N/A" : `${course.grade}/100`} />
        <MetricPill label="Credits" value={course.credits === "" || course.credits === undefined ? "N/A" : course.credits} />
      </div>
      <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-semibold sm:justify-self-end", hasGpa ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300")}>
        {hasGpa ? "Counts" : "Missing grade"}
      </span>
      <div className="flex items-center gap-1 sm:justify-end">
        <button type="button" onClick={onEdit} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${course.name}`}>
          <Edit3 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onRemove} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${course.name}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function MetricPill({ label, value }) {
  return (
    <span className="rounded-lg border border-border bg-background/70 px-2.5 py-2">
      <span className="block text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
      <span className="mt-0.5 block font-semibold text-foreground">{value}</span>
    </span>
  );
}

function InsightCard({ icon: Icon, title, body }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </section>
  );
}

function EmptyState({ onAdd }) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Calculator className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-foreground">No GPA courses yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Add a course, credits, and a final grade. You can leave the grade empty until it is published.
      </p>
      <Button className="mt-5 gap-2" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add first course
      </Button>
    </section>
  );
}

function CourseDialog({
  courseSuggestions,
  draft,
  editing,
  onChange,
  onDelete,
  onOpenChange,
  onSave,
  onSaveAndAdd,
  open,
}) {
  const canSave = draft.name.trim();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 left-0 top-auto max-h-[92vh] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-3xl border-border p-5 sm:left-[50%] sm:top-[50%] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:p-6">
        <DialogHeader className="text-start">
          <DialogTitle className="text-2xl font-bold">{editing ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>
            Grades can stay blank until the course is finished. Blank grades do not affect the GPA.
          </DialogDescription>
        </DialogHeader>

        <datalist id="gpa-page-course-suggestions">
          {courseSuggestions.map((name) => <option key={name} value={name} />)}
        </datalist>

        <div className="grid gap-4">
          <Field label="Course name">
            <Input
              autoComplete="off"
              list="gpa-page-course-suggestions"
              placeholder="Introduction to CS"
              value={draft.name}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Credits">
              <Input
                type="number"
                min="0"
                max="30"
                step="0.5"
                placeholder="5"
                value={draft.credits ?? ""}
                onChange={(event) => onChange("credits", event.target.value)}
              />
            </Field>
            <Field label="Final grade">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Leave blank"
                value={draft.grade ?? ""}
                onChange={(event) => onChange("grade", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Semester">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COURSE_SEMESTERS.filter((semester) => semester.value !== "unassigned").map((semester) => (
                <button
                  key={semester.value}
                  type="button"
                  aria-pressed={draft.semester === semester.value}
                  onClick={() => onChange("semester", semester.value)}
                  className={cn(
                    "min-h-12 rounded-xl border px-3 text-sm font-semibold transition-colors",
                    draft.semester === semester.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {semester.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Course status">
            <select
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={draft.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="finished">Finished</option>
            </select>
          </Field>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {onDelete && (
            <Button type="button" variant="destructive" className="gap-2 sm:me-auto" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!editing && (
            <Button type="button" variant="outline" disabled={!canSave} onClick={onSaveAndAdd}>
              Save and add another
            </Button>
          )}
          <Button type="button" disabled={!canSave} onClick={onSave}>
            Save course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
