import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarClock,
  Check,
  Gamepad2,
  HandHeart,
  MapPin,
  Music2,
  Plus,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { demoContent, withDemoFallback } from "@/lib/demoData";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const categories = ["social", "sports", "gaming", "music", "career", "volunteering", "other"];
const categoryIcons = {
  social: Users,
  sports: Trophy,
  gaming: Gamepad2,
  music: Music2,
  career: CalendarClock,
  volunteering: HandHeart,
  other: Users,
};

function safeQuery(promise) {
  return promise.catch(() => []);
}

function calendarStart(event) {
  return new Date(`${event.date}T${event.start_time || "12:00"}:00`).toISOString();
}

export default function SocialPage() {
  const location = useLocation();
  const { user, profile } = useProfile();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(new URLSearchParams(location.search).get("create") === "1");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    category: "social",
    max_spots: 10,
    description: "",
  });

  useEffect(() => {
    setShowCreate(new URLSearchParams(location.search).get("create") === "1");
  }, [location.search]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      safeQuery(base44.entities.SocialEvent.filter({ university_id: profile.university_id })),
      safeQuery(base44.entities.SocialEventMember.list()),
      safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_type: "social_activity" })),
    ]).then(([eventRows, memberRows, calendarRows]) => {
      if (!active) return;
      setEvents(withDemoFallback(eventRows, demoContent.events));
      setMemberships(memberRows || []);
      setCalendarItems(calendarRows || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile?.university_id, user?.id]);

  const approvedMemberships = memberships.filter((item) => item.status !== "rejected");
  const myMemberships = approvedMemberships.filter((item) => item.user_id === user?.id);
  const myEventIds = new Set(myMemberships.map((item) => item.event_id));
  const memberCount = (eventId) => approvedMemberships.filter((item) => item.event_id === eventId).length;
  const visibleEvents = useMemo(() => events
    .filter((event) => !openOnly || (event.status !== "canceled" && event.is_open))
    .sort((a, b) => `${a.date}${a.start_time || ""}`.localeCompare(`${b.date}${b.start_time || ""}`)), [events, openOnly]);

  const createEvent = async () => {
    if (!user?.id || !profile?.university_id || !form.title || !form.date) return;
    setSaving(true);
    try {
      const created = await base44.entities.SocialEvent.create({
        ...form,
        organizer_id: user.id,
        university_id: profile.university_id,
        is_open: true,
        status: "open",
      });
      const membership = await base44.entities.SocialEventMember.create({ event_id: created.id, user_id: user.id, status: "approved" });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "social_activity", source_id: created.id, title: created.title, starts_at: calendarStart(created), ends_at: created.end_time ? new Date(`${created.date}T${created.end_time}:00`).toISOString() : undefined, notes: created.location || "", status: "active" });
      setEvents((current) => [created, ...current.filter((item) => !String(item.id).startsWith("demo-") )]);
      setMemberships((current) => [...current, membership]);
      setCalendarItems((current) => [...current, calendarItem]);
      setShowCreate(false);
      setForm({ title: "", date: "", start_time: "", end_time: "", location: "", category: "social", max_spots: 10, description: "" });
    } finally {
      setSaving(false);
    }
  };

  const joinEvent = async (event) => {
    if (!user?.id || myEventIds.has(event.id) || memberCount(event.id) >= event.max_spots || String(event.id).startsWith("demo-")) return;
    setSaving(true);
    try {
      const membership = await base44.entities.SocialEventMember.create({ event_id: event.id, user_id: user.id, status: "approved" });
      const calendarItem = await base44.entities.CalendarItem.create({
        owner_user_id: user.id,
        source_type: "social_activity",
        source_id: event.id,
        title: event.title,
        starts_at: calendarStart(event),
        ends_at: event.end_time ? new Date(`${event.date}T${event.end_time}:00`).toISOString() : undefined,
        notes: event.location || "",
        status: "active",
      });
      setMemberships((current) => [...current, membership]);
      setCalendarItems((current) => [...current, calendarItem]);
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const leaveEvent = async (event) => {
    const membership = myMemberships.find((item) => item.event_id === event.id);
    if (!membership || event.organizer_id === user?.id) return;
    setSaving(true);
    try {
      await base44.entities.SocialEventMember.delete(membership.id);
      const calendarItem = calendarItems.find((item) => item.source_id === event.id);
      if (calendarItem) await base44.entities.CalendarItem.delete(calendarItem.id);
      setMemberships((current) => current.filter((item) => item.id !== membership.id));
      setCalendarItems((current) => current.filter((item) => item.id !== calendarItem?.id));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const cancelEvent = async (event) => {
    if (event.organizer_id !== user?.id) return;
    setSaving(true);
    try {
      await base44.entities.SocialEvent.update(event.id, { status: "canceled", is_open: false });
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: "canceled", is_open: false } : item));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout wide>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("social_title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("social_subtitle")}</p>
        </div>
        <Button variant="outline" className="min-h-11" onClick={() => setOpenOnly((current) => !current)}>
          {openOnly ? <Check className="me-2 h-4 w-4" /> : null}Open only
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={3} />)}</div>
      ) : visibleEvents.length === 0 ? (
        <EmptyState icon={Users} title="No activities yet" message="Create a small campus activity and make it easy for others to join." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleEvents.map((event) => {
            const Icon = categoryIcons[event.category] || Users;
            const count = memberCount(event.id);
            const full = count >= event.max_spots;
            return (
              <button key={event.id} onClick={() => setSelected(event)} className="min-h-36 rounded-lg border border-border bg-card p-4 text-start transition-colors hover:border-primary/40">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1" dir="auto">
                    <div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-foreground">{event.title}</h2><span className={cn("shrink-0 text-xs font-semibold", event.status === "canceled" ? "text-destructive" : full ? "text-amber-600" : "text-emerald-600")}>{event.status === "canceled" ? "Canceled" : full ? "Full" : "Open"}</span></div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" />{event.date}{event.start_time ? `, ${event.start_time}` : ""}</p>
                    {event.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</p>}
                    <p className="mt-3 text-xs font-medium text-muted-foreground">{count} / {event.max_spots} joined{myEventIds.has(event.id) ? " · You joined" : ""}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button onClick={() => setShowCreate(true)} className="fixed bottom-24 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105" aria-label="Create activity"><Plus className="h-6 w-6" /></button>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="space-y-4" dir="auto">
            {selected.description && <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>}
            <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
              <p>{selected.date}{selected.start_time ? `, ${selected.start_time}` : ""}</p>
              {selected.location && <p className="mt-1 text-muted-foreground">{selected.location}</p>}
              <p className="mt-1 text-muted-foreground">{memberCount(selected.id)} of {selected.max_spots} spots</p>
            </div>
            {selected.organizer_id === user?.id ? (
              <Button variant="destructive" className="w-full" disabled={saving || selected.status === "canceled"} onClick={() => cancelEvent(selected)}><X className="me-2 h-4 w-4" />Cancel activity</Button>
            ) : myEventIds.has(selected.id) ? (
              <Button variant="outline" className="w-full" disabled={saving} onClick={() => leaveEvent(selected)}>Leave activity</Button>
            ) : (
              <Button className="w-full" disabled={saving || selected.status === "canceled" || memberCount(selected.id) >= selected.max_spots || String(selected.id).startsWith("demo-")} onClick={() => joinEvent(selected)}>Join activity</Button>
            )}
            {String(selected.id).startsWith("demo-") && <p className="text-center text-xs text-muted-foreground">Demo preview. Seed it to Base44 before the live demo to enable joining.</p>}
          </div>
        </Modal>
      )}

      {showCreate && (
        <Modal title="Create activity" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <Field label="Activity name"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Capacity"><Input type="number" min="2" max="200" value={form.max_spots} onChange={(event) => setForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Starts"><Input type="time" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} /></Field><Field label="Ends"><Input type="time" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} /></Field></div>
            <Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field>
            <Field label="Category"><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
            <Field label="Description"><Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
            <Button className="w-full" disabled={saving || !form.title || !form.date || form.max_spots < 2} onClick={createEvent}>{saving ? t("common_loading") : "Create activity"}</Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
