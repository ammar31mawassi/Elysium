import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpenCheck, CalendarDays, Check, Circle, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import { useCreateAction } from "@/components/elysium/CreateActionProvider";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeCourseRecords } from "@/lib/profileCourses";

const PERSONAL_KINDS = ["homework", "exam", "other"];
const PRIORITIES = ["normal", "important", "urgent"];
const DEADLINE_KINDS = new Set(["homework", "exam"]);
const FIND_PROMPT = "Didn't find what you are looking for? Why not make one yourself!";
const CALENDAR_REFRESH_MS = 60 * 1000;
const CATEGORY_FILTERS = [
  ["all", "All events"],
  ["deadlines", "Deadlines"],
  ["social_activity", "Social events"],
  ["study_session", "Study groups"],
];

function safeQuery(promise) {
  return promise.catch(() => []);
}

function makeEmptyForm(kind = "other") {
  return { title: "", starts_at: "", notes: "", priority: "normal", all_day: false, personal_kind: kind, course_name: "" };
}

function toDateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function calendarPayloadFromForm(form) {
  return {
    personal_kind: form.personal_kind,
    course_name: form.personal_kind === "other" ? "" : form.course_name,
    title: form.title.trim(),
    starts_at: new Date(form.starts_at).toISOString(),
    notes: form.notes,
    priority: form.priority,
    all_day: form.all_day,
  };
}

function itemTone(item) {
  if (item.source_type === "personal" && ["important", "urgent"].includes(item.priority)) {
    return "bg-destructive/10 text-destructive";
  }
  if (item.source_type === "social_activity") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (item.source_type === "study_session") {
    return "bg-primary/10 text-primary";
  }
  if (item.source_type === "personal") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "bg-muted text-muted-foreground";
}

function typeLabel(item) {
  return item.source_type === "personal" ? item.personal_kind || "other" : item.source_type.replaceAll("_", " ");
}

function isDeadlineItem(item) {
  return item.source_type === "personal" && DEADLINE_KINDS.has(item.personal_kind);
}

function matchesCategory(item, category) {
  if (category === "all") return true;
  if (category === "deadlines") return isDeadlineItem(item);
  return item.source_type === category;
}

function sourceIsCanceled(item, events = [], sessions = []) {
  if (item.source_type === "social_activity") {
    return events.some((event) => event.id === item.source_id && event.status === "canceled");
  }
  if (item.source_type === "study_session") {
    return sessions.some((session) => session.id === item.source_id && session.status === "canceled");
  }
  return false;
}

function itemStartTime(item) {
  const time = new Date(item.starts_at).getTime();
  return Number.isFinite(time) ? time : null;
}

export default function CalendarPage() {
  const location = useLocation();
  const { openCreateAction } = useCreateAction();
  const { user, profile } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("upcoming");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const initialParams = new URLSearchParams(location.search);
  const initialKind = PERSONAL_KINDS.includes(initialParams.get("type")) ? initialParams.get("type") : "other";
  const [showEditor, setShowEditor] = useState(initialParams.get("create") === "1");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(() => makeEmptyForm(initialKind));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kind = PERSONAL_KINDS.includes(params.get("type")) ? params.get("type") : "other";
    const createRequested = params.get("create") === "1";
    if (createRequested) {
      setEditingItem(null);
      setForm(makeEmptyForm(kind));
    }
    setShowEditor(createRequested);
  }, [location.search]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id })),
      profile?.university_id ? safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })) : Promise.resolve([]),
      profile?.university_id ? safeQuery(base44.entities.StudySession.filter({ university_id: profile.university_id })) : Promise.resolve([]),
    ]).then(async ([rows, events, sessions]) => {
      const staleItems = (rows || []).filter((item) => sourceIsCanceled(item, events, sessions));
      await Promise.all(staleItems.map((item) => base44.entities.CalendarItem.delete(item.id).catch(() => null)));
      if (active) {
        setItems((rows || []).filter((item) => !staleItems.some((stale) => stale.id === item.id)));
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [user?.id, profile?.university_id]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), CALENDAR_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleCreated = (event) => {
      const item = event.detail?.calendarItem;
      if (!item) return;
      setItems((current) => current.some((row) => row.id === item.id) ? current.map((row) => row.id === item.id ? item : row) : [...current, item]);
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, []);

  const timeFilteredItems = useMemo(() => {
    return items
      .filter((item) => item.status !== "canceled")
      .filter((item) => {
        const startTime = itemStartTime(item);
        if (startTime === null) return tab === "upcoming";
        return tab === "upcoming" ? startTime >= currentTime : startTime < currentTime;
      })
      .sort((a, b) => {
        const aTime = itemStartTime(a) ?? Number.MAX_SAFE_INTEGER;
        const bTime = itemStartTime(b) ?? Number.MAX_SAFE_INTEGER;
        return tab === "past" ? bTime - aTime : aTime - bTime;
      });
  }, [items, tab, currentTime]);

  const displayed = useMemo(() => (
    timeFilteredItems.filter((item) => matchesCategory(item, categoryFilter))
  ), [timeFilteredItems, categoryFilter]);

  const openCreate = (kind = "other") => {
    setEditingItem(null);
    setForm(makeEmptyForm(kind));
    setShowEditor(true);
  };

  const emptyContent = (() => {
    if (categoryFilter === "deadlines") {
      return {
        icon: CalendarDays,
        title: "no upcoming deadlines, want to add a new one",
        action: <Button size="sm" onClick={() => openCreate("homework")}>Add deadline</Button>,
      };
    }
    return {
      icon: CalendarDays,
      title: tab === "past" ? "No past events yet." : "No upcoming events yet.",
      message: "Use the filters above or add a new deadline when something comes up.",
      action: <Button size="sm" onClick={() => openCreate("homework")}>Add deadline</Button>,
    };
  })();

  const activityPrompt = categoryFilter === "study_session"
    ? { icon: BookOpenCheck, tone: "study", buttonLabel: "Start a study group", action: "study" }
    : categoryFilter === "social_activity"
      ? { icon: Users, tone: "social", buttonLabel: "Create social group", action: "social" }
      : null;

  const openEdit = (item) => {
    if (item.source_type !== "personal") return;
    const kind = PERSONAL_KINDS.includes(item.personal_kind) ? item.personal_kind : "other";
    setEditingItem(item);
    setForm({
      title: item.title || "",
      starts_at: toDateTimeInputValue(item.starts_at),
      notes: item.notes || "",
      priority: PRIORITIES.includes(item.priority) ? item.priority : "normal",
      all_day: Boolean(item.all_day),
      personal_kind: kind,
      course_name: item.course_name || "",
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingItem(null);
    setForm(makeEmptyForm(initialKind));
  };

  const saveItem = async () => {
    if (!user?.id || !form.title.trim() || !form.starts_at) return;
    setSaving(true);
    try {
      const payload = calendarPayloadFromForm(form);
      if (editingItem) {
        await base44.entities.CalendarItem.update(editingItem.id, payload);
        setItems((current) => current.map((row) => row.id === editingItem.id ? { ...row, ...payload } : row));
      } else {
        const item = await base44.entities.CalendarItem.create({
          owner_user_id: user.id,
          source_type: "personal",
          ...payload,
          completed: false,
          status: "active",
        });
        setItems((current) => [...current, item]);
      }
      closeEditor();
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (item) => {
    const completed = !item.completed;
    await base44.entities.CalendarItem.update(item.id, { completed, status: completed ? "completed" : "active" });
    setItems((current) => current.map((row) => row.id === item.id ? { ...row, completed, status: completed ? "completed" : "active" } : row));
  };

  const removeItem = async (item) => {
    await base44.entities.CalendarItem.delete(item.id);
    setItems((current) => current.filter((row) => row.id !== item.id));
  };

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("calendar_title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{p("calendar_body")}</p>
        </div>
        <Button className="min-h-11 gap-2 self-start" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" />
          Add calendar item
        </Button>
      </header>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex max-w-sm rounded-md bg-muted p-1">
          {[["upcoming", p("calendar_upcoming")], ["past", p("calendar_past")]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={cn("h-10 flex-1 rounded-md px-3 text-sm font-semibold", tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>{label}</button>
          ))}
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1" role="group" aria-label="Calendar event category filter">
          {CATEGORY_FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={cn("min-h-10 shrink-0 rounded-md px-3 text-xs font-semibold", categoryFilter === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={2} />)}</div>
      ) : displayed.length === 0 && activityPrompt ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <CalendarCreatePrompt
            icon={activityPrompt.icon}
            tone={activityPrompt.tone}
            buttonLabel={activityPrompt.buttonLabel}
            onClick={() => openCreateAction(activityPrompt.action)}
            standalone
          />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={emptyContent.icon}
          title={emptyContent.title}
          message={emptyContent.message}
          action={emptyContent.action}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {displayed.map((item, index) => (
            <article key={item.id} className={cn("flex items-start gap-3 p-4 sm:p-5", index !== displayed.length - 1 && "border-b border-border")}>
              <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary hover:bg-primary/10" onClick={() => toggleComplete(item)} aria-label={item.completed ? "Mark incomplete" : "Mark complete"}>
                {item.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1" dir="auto">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className={cn("text-sm font-semibold text-foreground", item.completed && "line-through text-muted-foreground")}>{item.title}</h2>
                  <span className={cn("rounded px-2 py-0.5 text-xs font-semibold capitalize", itemTone(item))}>{typeLabel(item)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.starts_at).toLocaleString(locale)}{item.course_name ? ` ֲ· ${item.course_name}` : ""}</p>
                {item.notes && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{item.notes}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {item.source_type === "personal" && (
                  <button onClick={() => openEdit(item)} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Edit calendar item">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => removeItem(item)} className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete calendar item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {activityPrompt && (
            <CalendarCreatePrompt
              icon={activityPrompt.icon}
              tone={activityPrompt.tone}
              buttonLabel={activityPrompt.buttonLabel}
              onClick={() => openCreateAction(activityPrompt.action)}
            />
          )}
        </div>
      )}

      {showEditor && (
        <Modal title={`${editingItem ? "Edit" : "Add"} ${form.personal_kind === "other" ? "calendar item" : form.personal_kind}`} onClose={closeEditor}>
          <CalendarItemForm
            form={form}
            setForm={setForm}
            profile={profile}
            saving={saving}
            submitLabel={editingItem ? "Save changes" : t("common_save")}
            onSubmit={saveItem}
          />
        </Modal>
      )}
    </PageLayout>
  );
}

function CalendarCreatePrompt({ icon: Icon, tone, buttonLabel, onClick, standalone = false }) {
  const toneClass = tone === "study" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return (
    <article className={cn("flex items-start gap-3 border-dashed border-border bg-muted/20 p-4 sm:p-5", !standalone && "border-t")}>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", toneClass)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{FIND_PROMPT}</h2>
        <div className="mt-3">
          <Button size="sm" onClick={onClick}>{buttonLabel}</Button>
        </div>
      </div>
    </article>
  );
}

function CalendarItemForm({ form, setForm, profile, saving, submitLabel, onSubmit }) {
  return (
    <div className="space-y-4">
      <Field label="Type">
        <div className="grid grid-cols-3 gap-2">
          {PERSONAL_KINDS.map((kind) => (
            <button key={kind} type="button" onClick={() => setForm((current) => ({ ...current, personal_kind: kind, course_name: kind === "other" ? "" : current.course_name }))} className={cn("h-10 rounded-md border text-xs font-semibold capitalize", form.personal_kind === kind ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{kind}</button>
          ))}
        </div>
      </Field>
      <Field label="Title">
        <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus />
      </Field>
      {form.personal_kind !== "other" && (
        <Field label="Course (optional)">
          <select value={form.course_name} onChange={(event) => setForm((current) => ({ ...current, course_name: event.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">No course</option>
            {normalizeCourseRecords(profile).map((course) => <option key={course.name} value={course.name}>{course.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Date and time">
        <Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} />
      </Field>
      <Field label="Priority">
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((priority) => (
            <button key={priority} type="button" onClick={() => setForm((current) => ({ ...current, priority }))} className={cn("h-10 rounded-md border text-xs font-semibold capitalize", form.priority === priority ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{priority}</button>
          ))}
        </div>
      </Field>
      <Field label="Notes or location">
        <Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
      </Field>
      <Button className="w-full" disabled={saving || !form.title.trim() || !form.starts_at} onClick={onSubmit}>{saving ? "Saving..." : submitLabel}</Button>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
