import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, Check, Circle, MapPin, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeCourseRecords } from "@/lib/profileCourses";

function safeQuery(promise) {
  return promise.catch(() => []);
}

export default function CalendarPage() {
  const location = useLocation();
  const { user, profile } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("upcoming");
  const initialParams = new URLSearchParams(location.search);
  const initialKind = ["homework", "exam", "other"].includes(initialParams.get("type")) ? initialParams.get("type") : "other";
  const [showAdd, setShowAdd] = useState(initialParams.get("create") === "1");
  const [form, setForm] = useState({ title: "", starts_at: "", notes: "", priority: "normal", all_day: false, personal_kind: initialKind, course_name: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kind = ["homework", "exam", "other"].includes(params.get("type")) ? params.get("type") : "other";
    setShowAdd(params.get("create") === "1");
    setForm((current) => ({ ...current, personal_kind: kind }));
  }, [location.search]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    setLoading(true);
    safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id })).then((rows) => {
      if (active) { setItems(rows || []); setLoading(false); }
    });
    return () => { active = false; };
  }, [user?.id]);

  const displayed = useMemo(() => {
    const now = new Date();
    return items
      .filter((item) => item.status !== "canceled")
      .filter((item) => tab === "upcoming" ? new Date(item.starts_at) >= now || !item.completed : new Date(item.starts_at) < now && item.completed)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  }, [items, tab]);

  const addItem = async () => {
    if (!user?.id || !form.title || !form.starts_at) return;
    setSaving(true);
    try {
      const item = await base44.entities.CalendarItem.create({
        owner_user_id: user.id,
        source_type: "personal",
        personal_kind: form.personal_kind,
        course_name: form.personal_kind === "other" ? "" : form.course_name,
        title: form.title,
        starts_at: new Date(form.starts_at).toISOString(),
        notes: form.notes,
        priority: form.priority,
        all_day: form.all_day,
        completed: false,
        status: "active",
      });
      setItems((current) => [...current, item]);
      setForm({ title: "", starts_at: "", notes: "", priority: "normal", all_day: false, personal_kind: "other", course_name: "" });
      setShowAdd(false);
    } finally { setSaving(false); }
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
        <div><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("calendar_title")}</h1><p className="mt-2 text-sm text-muted-foreground">{p("calendar_body")}</p></div>
        <Button className="min-h-11 gap-2 self-start" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Add calendar item</Button>
      </header>

      <div className="mb-5 flex max-w-sm rounded-md bg-muted p-1">
        {[['upcoming', p('calendar_upcoming')], ['past', p('calendar_past')]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cn("h-10 flex-1 rounded-md text-sm font-semibold", tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>{label}</button>)}
      </div>

      {loading ? <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={2} />)}</div> : displayed.length === 0 ? <EmptyState icon={CalendarDays} title={p("calendar_empty")} message="Your personal deadlines and joined sessions will appear here." action={<Button size="sm" onClick={() => setShowAdd(true)}>{p("add_deadline")}</Button>} /> : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {displayed.map((item, index) => <article key={item.id} className={cn("flex items-start gap-3 p-4 sm:p-5", index !== displayed.length - 1 && "border-b border-border")}>
            <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary hover:bg-primary/10" onClick={() => toggleComplete(item)} aria-label={item.completed ? "Mark incomplete" : "Mark complete"}>{item.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</button>
            <div className="min-w-0 flex-1" dir="auto"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className={cn("text-sm font-semibold text-foreground", item.completed && "line-through text-muted-foreground")}>{item.title}</h2><span className={cn("rounded px-2 py-0.5 text-xs font-semibold", item.priority === "urgent" ? "bg-destructive/10 text-destructive" : item.priority === "important" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground")}>{item.source_type === "personal" ? item.personal_kind || "other" : item.source_type.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-muted-foreground">{new Date(item.starts_at).toLocaleString(locale)}{item.course_name ? ` · ${item.course_name}` : ""}</p>{item.notes && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{item.notes}</p>}</div>
            <button onClick={() => removeItem(item)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete calendar item"><Trash2 className="h-4 w-4" /></button>
          </article>)}
        </div>
      )}

      {showAdd && <Modal title={`Add ${form.personal_kind === "other" ? "calendar item" : form.personal_kind}`} onClose={() => setShowAdd(false)}><div className="space-y-4"><Field label="Type"><div className="grid grid-cols-3 gap-2">{["homework", "exam", "other"].map((kind) => <button key={kind} onClick={() => setForm((current) => ({ ...current, personal_kind: kind, course_name: kind === "other" ? "" : current.course_name }))} className={cn("h-10 rounded-md border text-xs font-semibold capitalize", form.personal_kind === kind ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{kind}</button>)}</div></Field><Field label="Title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field>{form.personal_kind !== "other" && <Field label="Course (optional)"><select value={form.course_name} onChange={(event) => setForm((current) => ({ ...current, course_name: event.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No course</option>{normalizeCourseRecords(profile).map((course) => <option key={course.name} value={course.name}>{course.name}</option>)}</select></Field>}<Field label="Date and time"><Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} /></Field><Field label="Priority"><div className="grid grid-cols-3 gap-2">{["normal", "important", "urgent"].map((priority) => <button key={priority} onClick={() => setForm((current) => ({ ...current, priority }))} className={cn("h-10 rounded-md border text-xs font-semibold", form.priority === priority ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{priority}</button>)}</div></Field><Field label="Notes or location"><Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field><Button className="w-full" disabled={saving || !form.title || !form.starts_at} onClick={addItem}>{saving ? t("common_loading") : t("common_save")}</Button></div></Modal>}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
