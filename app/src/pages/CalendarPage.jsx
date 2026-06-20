import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpenCheck, CalendarClock, CalendarDays, Check, ChevronLeft, ChevronRight, Circle, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import { useCreateAction } from "@/components/elysium/CreateActionProvider";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadFailedState from "@/components/ui/LoadFailedState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeCourseRecords } from "@/lib/profileCourses";
import { base44ErrorMessage, loadBase44Collection } from "@/lib/base44LoadState";
import { getCachedQueryData, loadCachedQuery, setCachedQueryData, mergeRecordsById, removeRecordsById, invalidateAppDataCaches } from "@/lib/base44Cache";

const PERSONAL_KINDS = ["homework", "exam", "other"];
const PRIORITIES = ["normal", "important", "urgent"];
const DEADLINE_KINDS = new Set(["homework", "exam"]);
const calendarCreatePrompts = {
  study: {
    title: "No study sessions here yet.",
    body: "Start a group and add it to your calendar.",
  },
  social: {
    title: "No social plans here yet.",
    body: "Create one and keep it on your calendar.",
  },
};
const CALENDAR_REFRESH_MS = 60 * 1000;
const CATEGORY_FILTERS = [
  ["all", "All events"],
  ["deadlines", "Deadlines"],
  ["social_activity", "Social events"],
  ["study_session", "Study groups"],
];
const CALENDAR_VIEWS = ["month", "week", "day"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DATE_FORMAT = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
const MONTH_YEAR_FORMAT = { month: "long", year: "numeric" };
const SHORT_DATE_FORMAT = { month: "short", day: "numeric" };

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
  if (isImportantDeadlineItem(item)) {
    return "bg-destructive/10 text-destructive";
  }
  if (item.source_type === "social_activity") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
  if (item.source_type === "study_session") {
    return "bg-green-500/10 text-green-700 dark:text-green-300";
  }
  if (isDeadlineItem(item)) {
    return "bg-yellow-400/15 text-yellow-700 dark:text-yellow-300";
  }
  return "bg-muted text-muted-foreground";
}

function typeLabel(item) {
  return item.source_type === "personal" ? item.personal_kind || "other" : item.source_type.replaceAll("_", " ");
}

function isDeadlineItem(item) {
  return item.source_type === "personal" && DEADLINE_KINDS.has(item.personal_kind);
}

function isImportantDeadlineItem(item) {
  return isDeadlineItem(item) && ["important", "urgent"].includes(item.priority);
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

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date, amount) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function endOfWeek(date) {
  return addDays(startOfWeek(date), 6);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameCalendarDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function sameCalendarMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthGridDays(date) {
  const first = startOfWeek(startOfMonth(date));
  const last = endOfWeek(endOfMonth(date));
  const days = [];
  for (let day = first; day <= last; day = addDays(day, 1)) {
    days.push(new Date(day));
  }
  return days;
}

function getWeekDays(date) {
  return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(date), index));
}

function shiftCalendarDate(date, view, direction) {
  if (view === "month") return addMonths(date, direction);
  if (view === "week") return addDays(date, direction * 7);
  return addDays(date, direction);
}

function calendarRangeTitle(date, view, locale) {
  if (view === "month") return date.toLocaleDateString(locale, MONTH_YEAR_FORMAT);
  if (view === "week") {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return `${start.toLocaleDateString(locale, SHORT_DATE_FORMAT)} - ${end.toLocaleDateString(locale, SHORT_DATE_FORMAT)}`;
  }
  return date.toLocaleDateString(locale, FULL_DATE_FORMAT);
}

function formatFullDate(date, locale) {
  return date.toLocaleDateString(locale, FULL_DATE_FORMAT);
}

function formatItemTime(item, locale) {
  if (item.all_day) return "All day";
  const date = new Date(item.starts_at);
  if (Number.isNaN(date.getTime())) return "Time TBD";
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

function calendarPriorityRank(item) {
  return isImportantDeadlineItem(item) ? 0 : 1;
}

function compareCalendarItems(a, b) {
  const priorityDiff = calendarPriorityRank(a) - calendarPriorityRank(b);
  if (priorityDiff !== 0) return priorityDiff;
  return (itemStartTime(a) ?? 0) - (itemStartTime(b) ?? 0);
}

function eventDotClass(item) {
  if (isImportantDeadlineItem(item)) return "bg-red-500";
  if (item.source_type === "social_activity") return "bg-blue-500";
  if (item.source_type === "study_session") return "bg-green-500";
  if (isDeadlineItem(item)) return "bg-yellow-400";
  return "bg-muted-foreground";
}

export default function CalendarPage() {
  const location = useLocation();
  const { openCreateAction } = useCreateAction();
  const { user, profile } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const calendarQueryKey = useMemo(() => ["calendar-page", user?.id || "", profile?.university_id || ""], [user?.id, profile?.university_id]);
  const cachedCalendarItems = getCachedQueryData(calendarQueryKey);
  const [items, setItems] = useState(() => cachedCalendarItems || []);
  const [loading, setLoading] = useState(() => cachedCalendarItems === undefined);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("upcoming");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const initialParams = new URLSearchParams(location.search);
  const initialKind = PERSONAL_KINDS.includes(initialParams.get("type")) ? initialParams.get("type") : "other";
  const [showEditor, setShowEditor] = useState(initialParams.get("create") === "1");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(() => makeEmptyForm(initialKind));
  const [calendarView, setCalendarView] = useState("month");
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  const syncCalendarItems = (updater) => {
    setItems((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      setCachedQueryData(calendarQueryKey, next);
      return next;
    });
  };

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
    const cached = getCachedQueryData(calendarQueryKey);
    if (cached) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setLoadError("");
    loadCachedQuery({
      queryKey: calendarQueryKey,
      force: loadKey > 0,
      queryFn: async () => {
        const [rows, events, sessions] = await Promise.all([
          loadBase44Collection(() => base44.entities.CalendarItem.filter({ owner_user_id: user.id }), "Calendar items timed out"),
          profile?.university_id ? loadBase44Collection(() => base44.entities.SocialEvent.filter({ university_id: profile.university_id }), "Calendar social events timed out") : Promise.resolve([]),
          profile?.university_id ? loadBase44Collection(() => base44.entities.StudySession.filter({ university_id: profile.university_id }), "Calendar study sessions timed out") : Promise.resolve([]),
        ]);
        const staleItems = (rows || []).filter((item) => sourceIsCanceled(item, events, sessions));
        await Promise.all(staleItems.map((item) => base44.entities.CalendarItem.delete(item.id).catch(() => null)));
        return (rows || []).filter((item) => !staleItems.some((stale) => stale.id === item.id));
      },
    }).then((rows) => {
      if (active) {
        setItems(rows || []);
      }
    }).catch((error) => {
      if (active) setLoadError(base44ErrorMessage(error));
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.id, profile?.university_id, loadKey, calendarQueryKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), CALENDAR_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleCreated = (event) => {
      const item = event.detail?.calendarItem;
      if (!item) return;
      syncCalendarItems((current) => mergeRecordsById(current, [item]));
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, [calendarQueryKey]);

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

  const visualCalendarItems = useMemo(() => {
    return items
      .filter((item) => item.status !== "canceled")
      .filter((item) => itemStartTime(item) !== null)
      .filter((item) => matchesCategory(item, categoryFilter))
      .sort(compareCalendarItems);
  }, [items, categoryFilter]);

  const calendarItemsByDay = useMemo(() => {
    return visualCalendarItems.reduce((byDay, item) => {
      const key = dateKey(new Date(item.starts_at));
      byDay[key] = byDay[key] || [];
      byDay[key].push(item);
      return byDay;
    }, {});
  }, [visualCalendarItems]);

  const selectedDayItems = selectedCalendarDate ? calendarItemsByDay[dateKey(selectedCalendarDate)] || [] : [];
  const categoryLabel = CATEGORY_FILTERS.find(([key]) => key === categoryFilter)?.[1] || "All events";

  const moveCalendar = (direction) => {
    setVisibleDate((current) => shiftCalendarDate(current, calendarView, direction));
  };

  const openCalendarDay = (date) => {
    const selectedDate = startOfDay(date);
    setVisibleDate(selectedDate);
    setSelectedCalendarDate(selectedDate);
  };

  const openCreate = (kind = "other") => {
    setEditingItem(null);
    setForm(makeEmptyForm(kind));
    setShowEditor(true);
  };

  const emptyContent = (() => {
    if (categoryFilter === "deadlines") {
      return {
        icon: CalendarDays,
        title: "No upcoming deadlines yet.",
        message: "Add homework, exams, or important dates before they sneak up on you.",
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
      ? { icon: Users, tone: "social", buttonLabel: "Create event", action: "social" }
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

  const openEditFromCalendar = (item) => {
    setSelectedCalendarDate(null);
    openEdit(item);
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
        syncCalendarItems((current) => current.map((row) => row.id === editingItem.id ? { ...row, ...payload } : row));
      } else {
        const item = await base44.entities.CalendarItem.create({
          owner_user_id: user.id,
          source_type: "personal",
          ...payload,
          completed: false,
          status: "active",
        });
        syncCalendarItems((current) => mergeRecordsById(current, [item]));
      }
      invalidateAppDataCaches();
      closeEditor();
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (item) => {
    const completed = !item.completed;
    await base44.entities.CalendarItem.update(item.id, { completed, status: completed ? "completed" : "active" });
    syncCalendarItems((current) => current.map((row) => row.id === item.id ? { ...row, completed, status: completed ? "completed" : "active" } : row));
    invalidateAppDataCaches();
  };

  const removeItem = async (item) => {
    await base44.entities.CalendarItem.delete(item.id);
    syncCalendarItems((current) => removeRecordsById(current, [item.id]));
    invalidateAppDataCaches();
  };

  return (
    <PageLayout wide>
      <header data-tour="calendar-overview" className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="flex flex-col gap-5 lg:block">
        <div className="order-2 lg:order-none">
          <CalendarBoard
            view={calendarView}
            visibleDate={visibleDate}
            itemsByDay={calendarItemsByDay}
            categoryLabel={categoryLabel}
            locale={locale}
            onViewChange={setCalendarView}
            onMove={moveCalendar}
            onToday={() => setVisibleDate(new Date())}
            onSelectDay={openCalendarDay}
          />
        </div>

        <div className="order-1 lg:order-none">
      {loadError ? (
        <LoadFailedState message={loadError} onRetry={() => setLoadKey((key) => key + 1)} />
      ) : loading ? (
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
        </div>
      </div>

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

      {selectedCalendarDate && (
        <CalendarDayModal
          date={selectedCalendarDate}
          items={selectedDayItems}
          locale={locale}
          onClose={() => setSelectedCalendarDate(null)}
          onEdit={openEditFromCalendar}
        />
      )}
    </PageLayout>
  );
}

function CalendarBoard({ view, visibleDate, itemsByDay, categoryLabel, locale, onViewChange, onMove, onToday, onSelectDay }) {
  const rangeTitle = calendarRangeTitle(visibleDate, view, locale);

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm" aria-labelledby="calendar-board-title">
      <div className="border-b border-border bg-muted/25 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="calendar-board-title" className="text-xs font-bold uppercase tracking-wide text-primary">Calendar board</h2>
            <p className="mt-1 text-xl font-bold text-foreground">{rangeTitle}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Showing {categoryLabel.toLowerCase()}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex rounded-md bg-background p-1" role="group" aria-label="Calendar view">
              {CALENDAR_VIEWS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onViewChange(mode)}
                  className={cn(
                    "h-9 flex-1 rounded-md px-3 text-xs font-bold capitalize transition-colors sm:flex-none",
                    view === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMove(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Previous ${view}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={onToday}>Today</Button>
              <button
                type="button"
                onClick={() => onMove(1)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Next ${view}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {view === "month" && (
          <MonthCalendarGrid
            visibleDate={visibleDate}
            itemsByDay={itemsByDay}
            locale={locale}
            onSelectDay={onSelectDay}
          />
        )}
        {view === "week" && (
          <WeekCalendarGrid
            visibleDate={visibleDate}
            itemsByDay={itemsByDay}
            locale={locale}
            onSelectDay={onSelectDay}
          />
        )}
        {view === "day" && (
          <DayCalendarPanel
            visibleDate={visibleDate}
            items={itemsByDay[dateKey(visibleDate)] || []}
            locale={locale}
            onSelectDay={onSelectDay}
          />
        )}
      </div>
    </section>
  );
}

function MonthCalendarGrid({ visibleDate, itemsByDay, locale, onSelectDay }) {
  const today = startOfDay(new Date());
  const days = getMonthGridDays(visibleDate);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {WEEKDAY_LABELS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${visibleDate.toLocaleDateString(locale, MONTH_YEAR_FORMAT)} calendar`}>
        {days.map((day) => {
          const dayItems = itemsByDay[dateKey(day)] || [];
          return (
            <CalendarDayButton
              key={dateKey(day)}
              day={day}
              items={dayItems}
              locale={locale}
              muted={!sameCalendarMonth(day, visibleDate)}
              selected={sameCalendarDay(day, today)}
              compact
              onSelectDay={onSelectDay}
            />
          );
        })}
      </div>
    </div>
  );
}

function WeekCalendarGrid({ visibleDate, itemsByDay, locale, onSelectDay }) {
  const today = startOfDay(new Date());
  const days = getWeekDays(visibleDate);

  return (
    <div className="grid gap-2 md:grid-cols-7">
      {days.map((day) => (
        <CalendarDayButton
          key={dateKey(day)}
          day={day}
          items={itemsByDay[dateKey(day)] || []}
          locale={locale}
          selected={sameCalendarDay(day, today)}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
}

function DayCalendarPanel({ visibleDate, items, locale, onSelectDay }) {
  return (
    <button
      type="button"
      onClick={() => onSelectDay(visibleDate)}
      className="w-full rounded-lg border border-border bg-background p-4 text-start transition-colors hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`Open ${formatFullDate(visibleDate, locale)}. ${items.length} scheduled ${items.length === 1 ? "event" : "events"}.`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Day view</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{formatFullDate(visibleDate, locale)}</h3>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{items.length} {items.length === 1 ? "event" : "events"}</span>
      </div>
      <CalendarEventPreviewList items={items} locale={locale} large />
    </button>
  );
}

function CalendarDayButton({ day, items, locale, muted = false, selected = false, compact = false, onSelectDay }) {
  const label = formatFullDate(day, locale);

  return (
    <button
      type="button"
      onClick={() => onSelectDay(day)}
      className={cn(
        "group min-h-[5.75rem] rounded-md border border-border bg-background p-2 text-start transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring",
        "motion-reduce:transform-none",
        compact ? "sm:min-h-[6.75rem]" : "min-h-[8rem]",
        muted && "bg-muted/30 text-muted-foreground",
        selected && "border-primary/60 bg-primary/5 shadow-sm"
      )}
      aria-label={`Open ${label}. ${items.length} scheduled ${items.length === 1 ? "event" : "events"}.`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold", selected ? "bg-primary text-primary-foreground" : "text-foreground")}>
          {day.getDate()}
        </span>
        {items.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {items.length}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1" aria-hidden="true">
            {items.slice(0, 4).map((item) => (
              <span key={item.id} className={cn("h-1.5 w-1.5 rounded-full", eventDotClass(item))} />
            ))}
            {items.length > 4 && <span className="text-[10px] font-bold text-muted-foreground">+{items.length - 4}</span>}
          </div>
          {!compact && (
            <div className="mt-2 space-y-1">
              {items.slice(0, 3).map((item) => (
                <p key={item.id} className="truncate text-[11px] font-semibold text-foreground">
                  {formatItemTime(item, locale)} · {item.title}
                </p>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className={cn("mt-3 text-[11px] font-medium text-muted-foreground", compact && "hidden sm:block")}>No events</p>
      )}
    </button>
  );
}

function CalendarEventPreviewList({ items, locale, large = false }) {
  if (!items.length) {
    return <p className={cn("mt-4 rounded-md border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground", large && "min-h-20")}>No events scheduled for this day.</p>;
  }

  return (
    <div className={cn("mt-4 space-y-2", large && "grid gap-2 space-y-0 sm:grid-cols-2")}>
      {items.map((item) => (
        <article key={item.id} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-start gap-2">
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", eventDotClass(item))} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatItemTime(item, locale)}
              </p>
              {item.notes && <p className="mt-1 truncate text-xs text-muted-foreground">{item.notes}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function CalendarDayModal({ date, items, locale, onClose, onEdit }) {
  return (
    <Modal title={`Events on ${formatFullDate(date, locale)}`} onClose={onClose}>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize", itemTone(item))}>{typeLabel(item)}</span>
                  <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatItemTime(item, locale)}
                  </p>
                  {item.notes && <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>}
                </div>
                {item.source_type === "personal" && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
          No events scheduled for this day.
        </div>
      )}
    </Modal>
  );
}

function CalendarCreatePrompt({ icon: Icon, tone, buttonLabel, onClick, standalone = false }) {
  const toneClass = tone === "study" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  const prompt = calendarCreatePrompts[tone];
  return (
    <article className={cn("flex items-start gap-3 border-dashed border-border bg-muted/20 p-4 sm:p-5", !standalone && "border-t")}>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", toneClass)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{prompt.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{prompt.body}</p>
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
