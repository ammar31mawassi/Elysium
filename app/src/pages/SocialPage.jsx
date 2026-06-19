import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarClock,
  Check,
  Gamepad2,
  HandHeart,
  Music2,
  Plus,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import PageLayout from "@/components/layout/PageLayout";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadFailedState from "@/components/ui/LoadFailedState";
import Modal from "@/components/ui/Modal";
import CommunitySummaryCard from "@/components/elysium/CommunitySummaryCard";
import SearchableChoice from "@/components/elysium/SearchableChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DEFAULT_INTERESTS, localizedOption, mergeInterestOptions, normalizeOptionName } from "@/lib/onboardingOptions";
import { categoryForInterest } from "@/lib/creationOptions";
import {
  PARTICIPATION_FILTERS,
  countParticipants,
  filterMembershipsForUniversity,
  filterByParticipation,
  joinedIdsFromState,
  mergeRecordsById,
  participantSnapshot,
  sortSocialEventsByInterests,
  uniqueParticipants,
} from "@/lib/communityMatching";
import { domainTones } from "@/lib/domainTones";
import { toast } from "@/components/ui/use-toast";
import { base44ErrorMessage, loadBase44Collection } from "@/lib/base44LoadState";

const categoryIcons = {
  social: Users,
  sports: Trophy,
  gaming: Gamepad2,
  music: Music2,
  career: CalendarClock,
  volunteering: HandHeart,
  other: Users,
};
const FIND_PROMPT = "Didn't find what you are looking for? Why not make one yourself!";

function safeQuery(promise) {
  return promise.catch(() => []);
}

function calendarStart(event) {
  return new Date(`${event.date}T${event.start_time || "12:00"}:00`).toISOString();
}

export default function SocialPage() {
  const location = useLocation();
  const { user, profile } = useProfile();
  const { t, locale } = useLanguage();
  const [events, setEvents] = useState([]);
  const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
  const [memberships, setMemberships] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [participationFilter, setParticipationFilter] = useState(PARTICIPATION_FILTERS.all);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(new URLSearchParams(location.search).get("create") === "1");
  const [saving, setSaving] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ en: "", he: "" });
  const [form, setForm] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    activity_id: "",
    activity_name: "",
    category: "",
    max_spots: 10,
    description: "",
    preferred_language: "",
  });

  useEffect(() => {
    setShowCreate(new URLSearchParams(location.search).get("create") === "1");
  }, [location.search]);

  useEffect(() => {
    if (!profile?.university_id || !user?.id) return;
    let active = true;
    setLoading(true);
    setLoadError("");
    Promise.all([
      loadBase44Collection(() => base44.entities.SocialEvent.filter({ university_id: profile.university_id }), "Social events timed out"),
      loadBase44Collection(() => base44.entities.SocialEventMember.filter({ university_id: profile.university_id }), "Social memberships timed out"),
      loadBase44Collection(() => base44.entities.SocialEventMember.filter({ user_id: user.id }), "Your social memberships timed out"),
      loadBase44Collection(() => base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_type: "social_activity" }), "Social calendar items timed out"),
      loadBase44Collection(() => base44.entities.Interest.filter({ is_active: true }), "Interests timed out"),
    ]).then(([eventRows, memberRows, ownMemberRows, calendarRows, interestRows]) => {
      if (!active) return;
      setEvents(eventRows || []);
      setMemberships(filterMembershipsForUniversity(mergeRecordsById(memberRows, ownMemberRows), profile.university_id));
      setCalendarItems(calendarRows || []);
      setInterestOptions(mergeInterestOptions(interestRows));
    }).catch((error) => {
      if (active) setLoadError(base44ErrorMessage(error));
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, loadKey]);

  useEffect(() => {
    const handleCreated = (event) => {
      const detail = event.detail;
      if (detail?.type !== "social") return;
      setEvents((current) => [detail.event, ...current.filter((item) => item.id !== detail.event.id && !String(item.id).startsWith("demo-"))]);
      if (detail.membership) setMemberships((current) => mergeRecordsById(current, [detail.membership]));
      if (detail.calendarItem) setCalendarItems((current) => mergeRecordsById(current, [detail.calendarItem]));
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, []);

  const approvedMemberships = useMemo(() => memberships.filter((item) => item.status !== "rejected"), [memberships]);
  const myMemberships = useMemo(() => approvedMemberships.filter((item) => item.user_id === user?.id), [approvedMemberships, user?.id]);
  const myEventIds = useMemo(() => joinedIdsFromState({
    memberships: approvedMemberships,
    calendarItems,
    idField: "event_id",
    userId: user?.id,
    sourceType: "social_activity",
  }), [approvedMemberships, calendarItems, user?.id]);
  const selectedInterests = useMemo(() => profile?.interests || [], [profile?.interests]);
  const memberCount = (eventId) => countParticipants(approvedMemberships, "event_id", eventId, myEventIds);
  const participantsFor = (eventId) => uniqueParticipants(approvedMemberships, "event_id", eventId);
  const visibleEvents = useMemo(() => {
    const filtered = events
      .filter((event) => !openOnly || (event.status !== "canceled" && event.is_open));
    return sortSocialEventsByInterests(filterByParticipation(filtered, myEventIds, participationFilter), selectedInterests);
  }, [events, openOnly, myEventIds, participationFilter, selectedInterests]);
  const socialEmptyState = useMemo(() => {
    if (!events.length) {
      return {
        title: "No social activities yet",
        message: "Create the first campus activity so students with similar interests can join.",
      };
    }
    if (participationFilter === PARTICIPATION_FILTERS.joined) {
      return {
        title: "No joined activities yet",
        message: "Switch to All or Not joined to find something open, or create your own activity.",
      };
    }
    if (participationFilter === PARTICIPATION_FILTERS.notJoined) {
      return {
        title: "No new activities to join",
        message: "You have already joined the available matches, or the remaining activities are hidden by the current filters.",
      };
    }
    if (openOnly) {
      return {
        title: "No open activities right now",
        message: "Closed and canceled activities are hidden while Open only is on.",
      };
    }
    return {
      title: "No activities match these filters",
      message: "Adjust the filters above or create an activity for the campus community.",
    };
  }, [events.length, openOnly, participationFilter]);
  const activityChoices = useMemo(() => interestOptions.map((interest) => ({
    value: interest.en,
    label: localizedOption(interest, locale),
    keywords: [interest.en, interest.he, interest.ar],
    sourceId: interest.persisted ? interest.id : "",
  })), [interestOptions, locale]);

  const createEvent = async () => {
    if (!user?.id || !profile?.university_id || !form.title || !form.date || !form.activity_name) return;
    setSaving(true);
    try {
      const created = await base44.entities.SocialEvent.create({
        ...form,
        organizer_id: user.id,
        organizer_name: profile.preferred_name || user.full_name || "Student",
        organizer_academic_year: profile.academic_year || "",
        organizer_field_of_study: profile.field_of_study || "",
        university_id: profile.university_id,
        is_open: true,
        status: "open",
      });
      const membership = await base44.entities.SocialEventMember.create({ event_id: created.id, university_id: profile.university_id, owner_user_id: user.id, user_id: user.id, status: "approved", ...participantSnapshot({ profile, user }) });
      const calendarItem = await base44.entities.CalendarItem.create({ owner_user_id: user.id, source_type: "social_activity", source_id: created.id, title: created.title, starts_at: calendarStart(created), ends_at: created.end_time ? new Date(`${created.date}T${created.end_time}:00`).toISOString() : undefined, notes: created.location || "", status: "active" });
      setEvents((current) => [created, ...current.filter((item) => !String(item.id).startsWith("demo-") )]);
      setMemberships((current) => mergeRecordsById(current, [membership]));
      setCalendarItems((current) => mergeRecordsById(current, [calendarItem]));
      setShowCreate(false);
      setForm({ title: "", date: "", start_time: "", end_time: "", location: "", activity_id: "", activity_name: "", category: "", max_spots: 10, description: "", preferred_language: "" });
    } finally {
      setSaving(false);
    }
  };

  const addNewActivity = async () => {
    const english = newActivity.en.trim();
    const hebrew = newActivity.he.trim();
    if (!english || !hebrew || !user?.id) return;
    setSaving(true);
    try {
      const existing = interestOptions.find((item) => normalizeOptionName(item.en) === normalizeOptionName(english));
      let option = existing;
      if (!option) {
        const record = await base44.entities.Interest.create({ name_en: english, name_he: hebrew, normalized_key: normalizeOptionName(english), created_by: user.id, is_active: true });
        option = { id: record.id, en: english, he: hebrew, ar: english, persisted: true };
        setInterestOptions((current) => [...current, option]);
      }
      setForm((current) => ({ ...current, activity_id: option.id || "", activity_name: option.en, category: categoryForInterest(option.en) }));
      setNewActivity({ en: "", he: "" });
      setShowNewActivity(false);
      toast({ title: "New activity type added" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Activity type was not added" });
    } finally {
      setSaving(false);
    }
  };

  const joinEvent = async (event) => {
    if (!user?.id || myEventIds.has(event.id) || memberCount(event.id) >= event.max_spots || String(event.id).startsWith("demo-")) return;
    setSaving(true);
    try {
      const membership = await base44.entities.SocialEventMember.create({ event_id: event.id, university_id: profile.university_id, owner_user_id: event.organizer_id, user_id: user.id, status: "approved", ...participantSnapshot({ profile, user }) });
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
      setMemberships((current) => mergeRecordsById(current, [membership]));
      setCalendarItems((current) => mergeRecordsById(current, [calendarItem]));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const leaveEvent = async (event) => {
    const membership = myMemberships.find((item) => item.event_id === event.id);
    const calendarItem = calendarItems.find((item) => item.source_id === event.id);
    if (event.organizer_id === user?.id || (!membership && !calendarItem)) return;
    setSaving(true);
    try {
      if (membership) await base44.entities.SocialEventMember.delete(membership.id);
      if (calendarItem) await base44.entities.CalendarItem.delete(calendarItem.id);
      setMemberships((current) => current.filter((item) => item.id !== membership?.id && !(item.event_id === event.id && item.user_id === user?.id)));
      setCalendarItems((current) => current.filter((item) => item.source_id !== event.id));
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
      const ownCalendarItems = await safeQuery(base44.entities.CalendarItem.filter({ owner_user_id: user.id, source_type: "social_activity", source_id: event.id }));
      await Promise.all(ownCalendarItems.map((item) => base44.entities.CalendarItem.delete(item.id).catch(() => null)));
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: "canceled", is_open: false } : item));
      setCalendarItems((current) => current.filter((item) => item.source_id !== event.id));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("social_title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("social_subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ParticipationFilter value={participationFilter} onChange={setParticipationFilter} />
          <Button variant="outline" className="min-h-11" onClick={() => setOpenOnly((current) => !current)}>
            {openOnly ? <Check className="me-2 h-4 w-4" /> : null}Open only
          </Button>
          <Button className="min-h-11 gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />Create activity
          </Button>
        </div>
      </header>

      {loadError ? (
        <LoadFailedState message={loadError} onRetry={() => setLoadKey((key) => key + 1)} />
      ) : loading ? (
        <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={3} />)}</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleEvents.length ? (
            <>
              {visibleEvents.map((event) => {
            const Icon = categoryIcons[event.category] || Users;
            const count = memberCount(event.id);
            const full = count >= event.max_spots;
            const joined = myEventIds.has(event.id);
            const status = event.status === "canceled" ? "Canceled" : full ? "Full" : "Open";
            return (
              <CommunitySummaryCard
                key={event.id}
                type="social"
                icon={Icon}
                label={event.activity_name || event.category || "Social activity"}
                title={event.title}
                description={event.description}
                date={`${event.date}${event.start_time ? `, ${event.start_time}` : ""}`}
                location={event.location}
                language={event.preferred_language ? `Preferred language: ${event.preferred_language}` : ""}
                participants={count}
                capacity={event.max_spots}
                status={status}
                joined={joined}
                onOpen={() => setSelected(event)}
                footerLabel={joined ? "You joined" : "View details"}
              />
            );
          })}
              <CreateSocialPrompt onClick={() => setShowCreate(true)} />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card md:col-span-2">
              <EmptyState
                icon={Users}
                title={socialEmptyState.title}
                message={socialEmptyState.message}
                action={<Button size="sm" onClick={() => setShowCreate(true)}>Create activity</Button>}
              />
            </div>
          )}
        </div>
      )}

      <button onClick={() => setShowCreate(true)} className="fixed bottom-[calc(156px+env(safe-area-inset-bottom))] end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 md:bottom-24" aria-label="Create activity"><Plus className="h-6 w-6" /></button>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="space-y-4" dir="auto">
            {selected.description && <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>}
            <p className={cn("text-xs font-semibold", domainTones.social.text)}>{selected.activity_name || selected.category}{selected.preferred_language ? ` · ${selected.preferred_language}` : ""}</p>
            <div className="rounded-md border border-border p-3"><p className="text-xs font-semibold text-muted-foreground">Created by</p><p className="mt-1 text-sm font-semibold text-foreground">{selected.organizer_name || (selected.organizer_id === user?.id ? profile?.preferred_name || user?.full_name : "Campus student")}</p>{(selected.organizer_academic_year || selected.organizer_field_of_study) && <p className="mt-1 text-xs text-muted-foreground">{[selected.organizer_academic_year, selected.organizer_field_of_study].filter(Boolean).join(" · ")}</p>}</div>
            <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
              <p>{selected.date}{selected.start_time ? `, ${selected.start_time}` : ""}</p>
              {selected.location && <p className="mt-1 text-muted-foreground">{selected.location}</p>}
              <p className="mt-1 text-muted-foreground">{memberCount(selected.id)} of {selected.max_spots} spots</p>
            </div>
            <ParticipantList participants={participantsFor(selected.id)} user={user} profile={profile} />
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
            <Field label="Related hobby or activity"><SearchableChoice value={form.activity_name} options={activityChoices} placeholder="Search football, gaming, music..." emptyLabel="No matching hobby found." onChange={(option) => setForm((current) => ({ ...current, activity_id: option?.sourceId || "", activity_name: option?.value || "", category: option ? categoryForInterest(option.value) : "" }))} /></Field>
            <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setShowNewActivity((current) => !current)}><Plus className="h-4 w-4" />+ Add a new activity</Button>
            {showNewActivity && <div className="rounded-md border border-border p-3"><p className="mb-2 text-xs text-muted-foreground">Add English and Hebrew names so everyone can search for it.</p><div className="grid gap-2 sm:grid-cols-2"><Input value={newActivity.en} onChange={(event) => setNewActivity((current) => ({ ...current, en: event.target.value }))} placeholder="English name" /><Input dir="rtl" value={newActivity.he} onChange={(event) => setNewActivity((current) => ({ ...current, he: event.target.value }))} placeholder="Hebrew name" /></div><Button className="mt-2" disabled={saving || !newActivity.en.trim() || !newActivity.he.trim()} onClick={addNewActivity}>Add and select</Button></div>}
            <div className="grid grid-cols-2 gap-3"><Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></Field><Field label="Capacity"><Input type="number" min="2" max="200" value={form.max_spots} onChange={(event) => setForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Starts"><Input type="time" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} /></Field><Field label="Ends"><Input type="time" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} /></Field></div>
            <Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field>
            <Field label="Preferred language (optional)"><select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.preferred_language} onChange={(event) => setForm((current) => ({ ...current, preferred_language: event.target.value }))}><option value="">Any language</option><option value="English">English</option><option value="Hebrew">Hebrew</option><option value="Arabic">Arabic</option></select></Field>
            <Field label="Description"><Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
            <Button className="w-full" disabled={saving || !form.title || !form.activity_name || !form.date || form.max_spots < 2} onClick={createEvent}>{saving ? t("common_loading") : "Create activity"}</Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function CreateSocialPrompt({ onClick }) {
  return (
    <article className={cn("min-h-36 rounded-lg border border-dashed bg-card p-4 text-start", domainTones.social.border)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", domainTones.social.icon)}>
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">{FIND_PROMPT}</h2>
          <Button size="sm" className="mt-4" onClick={onClick}>Create social group</Button>
        </div>
      </div>
    </article>
  );
}

function ParticipantList({ participants = [], user, profile }) {
  return (
    <section className="rounded-md border border-border p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signed-up students</h3>
      {participants.length ? (
        <div className="mt-3 space-y-2">
          {participants.map((member) => (
            <div key={member.user_id || member.id} className="rounded-md bg-muted/40 p-3">
              <p className="text-sm font-semibold text-foreground">{participantName(member, user, profile)}</p>
              {participantMeta(member) && <p className="mt-1 text-xs text-muted-foreground">{participantMeta(member)}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No one has signed up yet.</p>
      )}
    </section>
  );
}

function participantName(member, user, profile) {
  if (member.participant_name) return member.participant_name;
  if (member.user_id === user?.id) return profile?.preferred_name || user?.full_name || "You";
  return "Campus student";
}

function participantMeta(member) {
  return [member.participant_academic_year, member.participant_field_of_study].filter(Boolean).join(" - ");
}

function ParticipationFilter({ value, onChange }) {
  const options = [
    [PARTICIPATION_FILTERS.all, "All", Users],
    [PARTICIPATION_FILTERS.joined, "Joined", Check],
    [PARTICIPATION_FILTERS.notJoined, "Not joined", Plus],
  ];
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1" role="group" aria-label="Social participation filter">
      {options.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn("flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold", value === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
