import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { BookOpenCheck, CalendarDays, Flag, MapPin, Plus, Trash2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { productText } from "@/lib/productCopy";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["Exam", "Scholarship", "Admin", "Personal"];
const meta = {
  deadline: { icon: Flag, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  social: { icon: Users, tone: "bg-amber-500/12 text-amber-700 dark:text-amber-400" },
  session: { icon: BookOpenCheck, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
};

function parseDate(value) {
  const date = parseISO(value || "");
  return isValid(date) ? date : null;
}

function safeQuery(promise, timeout = 7000) {
  return Promise.race([promise.catch(() => []), new Promise((resolve) => setTimeout(() => resolve([]), timeout))]);
}

export default function CalendarPage() {
  const { user, profile } = useProfile();
  const { locale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [showAdd, setShowAdd] = useState(new URLSearchParams(location.search).get("create") === "1");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", due_date: "", category: "Personal", source: "" });
  const [data, setData] = useState({ deadlines: [], events: [], eventMemberships: [], groupMemberships: [], sessions: [] });

  useEffect(() => {
    setShowAdd(new URLSearchParams(location.search).get("create") === "1");
  }, [location.search]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.Deadline.filter({ user_id: user.id })),
      profile?.university_id ? safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })) : Promise.resolve([]),
      safeQuery(base44.entities.SocialEventMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudyGroupMember.filter({ user_id: user.id })),
      safeQuery(base44.entities.StudySession.list("session_date", 200)),
    ]).then(([deadlines, events, eventMemberships, groupMemberships, sessions]) => {
      if (active) setData({ deadlines: deadlines || [], events: events || [], eventMemberships: eventMemberships || [], groupMemberships: groupMemberships || [], sessions: sessions || [] });
    }).catch(console.error).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.id, profile?.university_id]);

  const items = useMemo(() => {
    const joinedEventIds = new Set(data.eventMemberships.map((item) => item.event_id));
    const joinedGroupIds = new Set(data.groupMemberships.map((item) => item.group_id));
    return [
      ...data.deadlines.map((item) => ({ id: item.id, type: "deadline", title: item.title, date: item.due_date, detail: item.source || item.category, deletable: true })),
      ...data.events.filter((item) => joinedEventIds.has(item.id)).map((item) => ({ id: item.id, type: "social", title: item.title, date: item.date, detail: item.location })),
      ...data.sessions.filter((item) => joinedGroupIds.has(item.group_id)).map((item) => ({ id: item.id, type: "session", title: item.title || p("home_session"), date: item.session_date, detail: item.location })),
    ].map((item) => ({ ...item, parsedDate: parseDate(item.date) })).filter((item) => item.parsedDate).sort((a, b) => a.parsedDate - b.parsedDate);
  }, [data, locale]);

  const today = startOfDay(new Date());
  const displayed = items.filter((item) => tab === "upcoming" ? startOfDay(item.parsedDate) >= today : startOfDay(item.parsedDate) < today);

  const addDeadline = async () => {
    if (!form.title || !form.due_date || !user?.id) return;
    setSaving(true);
    const deadline = await base44.entities.Deadline.create({ ...form, user_id: user.id, university_id: profile?.university_id || "" });
    setData((current) => ({ ...current, deadlines: [...current.deadlines, deadline] }));
    setForm({ title: "", due_date: "", category: "Personal", source: "" });
    setSaving(false);
    setShowAdd(false);
  };
  const deleteDeadline = async (id) => {
    await base44.entities.Deadline.delete(id);
    setData((current) => ({ ...current, deadlines: current.deadlines.filter((item) => item.id !== id) }));
  };

  return (
    <PageLayout wide>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground sm:text-3xl">{p("calendar_title")}</h1><p className="mt-2 text-sm text-muted-foreground">{p("calendar_body")}</p></div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 self-start sm:self-auto"><Plus className="h-4 w-4" />{p("add_deadline")}</Button>
      </div>

      <div className="mb-5 flex w-full max-w-sm rounded-md bg-muted p-1">
        {[["upcoming", p("calendar_upcoming")], ["past", p("calendar_past")]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cn("h-9 flex-1 rounded-md text-sm font-semibold", tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>{label}</button>)}
      </div>

      {loading ? <div className="grid gap-3 md:grid-cols-2">{[1,2,3,4].map((item) => <SkeletonCard key={item} lines={2} />)}</div> : displayed.length === 0 ? <EmptyState icon={CalendarDays} title={p("calendar_empty")} message={p("home_clear_body")} action={<Button size="sm" onClick={() => setShowAdd(true)}>{p("add_deadline")}</Button>} /> : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {displayed.map((item, index) => <TimelineItem key={`${item.type}-${item.id}`} item={item} p={p} last={index === displayed.length - 1} onDelete={() => deleteDeadline(item.id)} />)}
        </div>
      )}

      {showAdd && <Modal title={p("add_deadline")} onClose={() => setShowAdd(false)}><div className="space-y-4">
        <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</label><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date</label><Input type="date" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} /></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</label><div className="grid grid-cols-2 gap-2">{categories.map((category) => <button key={category} onClick={() => setForm((current) => ({ ...current, category }))} className={cn("h-9 rounded-md border text-xs font-semibold", form.category === category ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{category}</button>)}</div></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Source or course</label><Input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} /></div>
        <Button className="w-full" onClick={addDeadline} disabled={!form.title || !form.due_date || saving}>{saving ? t("common_loading") : t("common_save")}</Button>
      </div></Modal>}
    </PageLayout>
  );
}

function TimelineItem({ item, p, last, onDelete }) {
  const itemMeta = meta[item.type];
  const Icon = itemMeta.icon;
  const diff = Math.round((startOfDay(item.parsedDate) - startOfDay(new Date())) / 86400000);
  const relative = diff === 0 ? p("due_today") : diff === 1 ? p("tomorrow") : diff > 1 ? `${diff} ${p("days")}` : format(item.parsedDate, "MMM d");
  return <article className={cn("flex items-start gap-3 px-4 py-4 sm:px-5", !last && "border-b border-border")}><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", itemMeta.tone)}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1"><div><p className="text-sm font-bold text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{format(item.parsedDate, "EEEE, MMMM d")}</p></div><span className="text-xs font-semibold text-primary">{relative}</span></div>{item.detail && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{item.detail}</p>}</div>{item.deletable && <button onClick={onDelete} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete deadline"><Trash2 className="h-4 w-4" /></button>}</article>;
}
