import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Languages, MapPin, Plus, Users, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useCreateAction } from "@/components/elysium/CreateActionProvider";
import {
  filterMembershipsForUniversity,
  mergeRecordsById,
  uniqueParticipants,
} from "@/lib/communityMatching";
import PageLayout from "@/components/layout/PageLayout";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import LoadFailedState from "@/components/ui/LoadFailedState";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { domainTones } from "@/lib/domainTones";
import { base44ErrorMessage, loadBase44Collection } from "@/lib/base44LoadState";

const COMMUNITY_FILTERS = [
  ["all", "All"],
  ["social", "Social events"],
  ["study", "Study groups"],
];

const PAGE_COPY = {
  all: {
    title: "My communities",
    description: "Manage activities and study groups you created, cancel plans, and see who joined.",
  },
  social: {
    title: "My social events",
    description: "See the social events you created, who joined them, and whether they are still open.",
  },
  study: {
    title: "My study groups",
    description: "See the study groups you created, who joined them, and whether they are still open.",
  },
};

function communityFilterFromParams(params) {
  const type = params.get("type");
  return type === "social" || type === "study" ? type : "all";
}

function socialDate(event) {
  return `${event.date || "Date TBD"}${event.start_time ? `, ${event.start_time}` : ""}`;
}

function studyDate(session) {
  if (!session.session_date) return "Date TBD";
  return new Date(session.session_date).toLocaleString();
}

function participantName(member, user, profile) {
  if (member.participant_name) return member.participant_name;
  if (member.user_id === user?.id) return profile?.preferred_name || user?.full_name || "You";
  return "Campus student";
}

function participantMeta(member) {
  return [member.participant_academic_year, member.participant_field_of_study].filter(Boolean).join(" - ");
}

export default function MyCommunitiesPage() {
  const [params, setParams] = useSearchParams();
  const { user, profile } = useProfile();
  const { openCreateAction } = useCreateAction();
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [eventMembers, setEventMembers] = useState([]);
  const [sessionMembers, setSessionMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [savingId, setSavingId] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCanceled, setShowCanceled] = useState(false);
  const activeFilter = communityFilterFromParams(params);
  const showSocial = activeFilter !== "study";
  const showStudy = activeFilter !== "social";
  const copy = PAGE_COPY[activeFilter];

  const setCommunityFilter = (nextFilter) => {
    const nextParams = new URLSearchParams(params);
    if (nextFilter === "all") nextParams.delete("type");
    else nextParams.set("type", nextFilter);
    setParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!user?.id || !profile?.university_id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setLoadError("");
    Promise.all([
      loadBase44Collection(() => base44.entities.SocialEvent.filter({ university_id: profile.university_id }), "My social events timed out"),
      loadBase44Collection(() => base44.entities.SocialEventMember.filter({ university_id: profile.university_id }), "My social memberships timed out"),
      loadBase44Collection(() => base44.entities.SocialEventMember.filter({ user_id: user.id }), "Your social memberships timed out"),
      loadBase44Collection(() => base44.entities.StudySession.filter({ university_id: profile.university_id }), "My study groups timed out"),
      loadBase44Collection(() => base44.entities.StudySessionMember.filter({ university_id: profile.university_id }), "My study memberships timed out"),
      loadBase44Collection(() => base44.entities.StudySessionMember.filter({ user_id: user.id }), "Your study memberships timed out"),
    ]).then(([eventRows, memberRows, ownMemberRows, sessionRows, sessionMemberRows, ownSessionMemberRows]) => {
      if (!active) return;
      setEvents((eventRows || []).filter((event) => event.organizer_id === user.id));
      setSessions((sessionRows || []).filter((session) => session.host_id === user.id));
      setEventMembers(filterMembershipsForUniversity(mergeRecordsById(memberRows, ownMemberRows), profile.university_id));
      setSessionMembers(filterMembershipsForUniversity(mergeRecordsById(sessionMemberRows, ownSessionMemberRows), profile.university_id));
    }).catch((error) => {
      if (active) setLoadError(base44ErrorMessage(error));
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile?.university_id, user?.id, loadKey]);

  useEffect(() => {
    const handleCreated = (event) => {
      const detail = event.detail;
      if (detail?.type === "social") {
        setEvents((current) => [detail.event, ...current.filter((item) => item.id !== detail.event.id)]);
        if (detail.membership) setEventMembers((current) => mergeRecordsById(current, [detail.membership]));
      }
      if (detail?.type === "study") {
        setSessions((current) => [detail.session, ...current.filter((item) => item.id !== detail.session.id)]);
        if (detail.membership) setSessionMembers((current) => mergeRecordsById(current, [detail.membership]));
      }
    };
    window.addEventListener("elysium:create-action-complete", handleCreated);
    return () => window.removeEventListener("elysium:create-action-complete", handleCreated);
  }, []);

  const openEvents = useMemo(() => events.filter((event) => event.status !== "canceled" && event.is_open !== false), [events]);
  const openSessions = useMemo(() => sessions.filter((session) => session.status !== "canceled"), [sessions]);
  const visibleEvents = showCanceled ? events : openEvents;
  const visibleSessions = showCanceled ? sessions : openSessions;
  const hiddenCanceledCount = (events.length - openEvents.length) + (sessions.length - openSessions.length);
  const sortedEvents = useMemo(() => [...visibleEvents].sort((a, b) => `${b.date || ""}${b.start_time || ""}`.localeCompare(`${a.date || ""}${a.start_time || ""}`)), [visibleEvents]);
  const sortedSessions = useMemo(() => [...visibleSessions].sort((a, b) => (b.session_date || "").localeCompare(a.session_date || "")), [visibleSessions]);

  const participantsFor = (type, id) => uniqueParticipants(type === "social" ? eventMembers : sessionMembers, type === "social" ? "event_id" : "session_id", id);
  const socialEmptyCopy = events.length && !showCanceled
    ? {
      title: "No open activities right now",
      message: "You have created activities, but none are open. Turn on Show canceled to review closed or canceled activities.",
    }
    : {
      title: "No activities created yet",
      message: "Create one when you are ready to bring students together.",
    };
  const studyEmptyCopy = sessions.length && !showCanceled
    ? {
      title: "No open study groups right now",
      message: "You have created study groups, but none are open. Turn on Show canceled to review canceled groups.",
    }
    : {
      title: "No study groups created yet",
      message: "Create one when you are ready to bring students together.",
    };

  const cancelEvent = async (event) => {
    if (event.organizer_id !== user?.id || event.status === "canceled") return;
    setSavingId(event.id);
    try {
      await base44.entities.SocialEvent.update(event.id, { status: "canceled", is_open: false });
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: "canceled", is_open: false } : item));
      setSelected(null);
    } finally {
      setSavingId("");
    }
  };

  const cancelSession = async (session) => {
    if (session.host_id !== user?.id || session.status === "canceled") return;
    setSavingId(session.id);
    try {
      await base44.entities.StudySession.update(session.id, { status: "canceled" });
      setSessions((current) => current.map((item) => item.id === session.id ? { ...item, status: "canceled" } : item));
      setSelected(null);
    } finally {
      setSavingId("");
    }
  };

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">My Elysium</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={showCanceled ? "default" : "outline"} className="gap-2" onClick={() => setShowCanceled((current) => !current)}>
            {showCanceled ? "Only open" : "Show canceled"}
            {!showCanceled && hiddenCanceledCount > 0 ? ` (${hiddenCanceledCount})` : ""}
          </Button>
          {showStudy && <Button variant="outline" className="gap-2" onClick={() => openCreateAction("study")}><Plus className="h-4 w-4" />Study group</Button>}
          {showSocial && <Button className="gap-2" onClick={() => openCreateAction("social")}><Plus className="h-4 w-4" />Activity</Button>}
        </div>
      </header>

      <div role="group" aria-label="Community filter" className="mb-5 grid max-w-md grid-cols-3 gap-1 rounded-md bg-muted p-1">
        {COMMUNITY_FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={activeFilter === key}
            onClick={() => setCommunityFilter(key)}
            className={cn("min-h-10 rounded-md px-2 text-sm font-semibold transition-colors", activeFilter === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      {loadError ? (
        <LoadFailedState message={loadError} onRetry={() => setLoadKey((key) => key + 1)} />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} lines={3} />)}</div>
      ) : (
        <div className={cn("grid gap-5", showSocial && showStudy ? "lg:grid-cols-2" : "max-w-3xl")}>
          {showSocial && <CommunitySection
            title="Activities I created"
            emptyTitle={socialEmptyCopy.title}
            emptyMessage={socialEmptyCopy.message}
            emptyAction={<Button size="sm" onClick={() => openCreateAction("social")}>Create activity</Button>}
            icon={Users}
            tone="social"
            items={sortedEvents}
            members={eventMembers}
            memberIdField="event_id"
            renderItem={(event) => (
              <CommunityCard
                key={event.id}
                type="social"
                title={event.title}
                label={event.activity_name || event.category || "Activity"}
                status={event.status === "canceled" ? "Canceled" : event.is_open === false ? "Closed" : "Open"}
                canceled={event.status === "canceled"}
                date={socialDate(event)}
                location={event.location}
                language={event.preferred_language}
                participants={participantsFor("social", event.id).length}
                capacity={event.max_spots}
                onOpen={() => setSelected({ type: "social", item: event })}
              />
            )}
          />}

          {showStudy && <CommunitySection
            title="Study groups I created"
            emptyTitle={studyEmptyCopy.title}
            emptyMessage={studyEmptyCopy.message}
            emptyAction={<Button size="sm" onClick={() => openCreateAction("study")}>Create study group</Button>}
            icon={BookOpenCheck}
            tone="study"
            items={sortedSessions}
            members={sessionMembers}
            memberIdField="session_id"
            renderItem={(session) => (
              <CommunityCard
                key={session.id}
                type="study"
                title={session.title}
                label={`${session.is_marathon ? "Study marathon" : "Study group"} - ${session.course_name}`}
                status={session.status === "canceled" ? "Canceled" : "Open"}
                canceled={session.status === "canceled"}
                date={studyDate(session)}
                location={session.location}
                language={session.preferred_language}
                participants={participantsFor("study", session.id).length}
                capacity={session.max_spots}
                onOpen={() => setSelected({ type: "study", item: session })}
              />
            )}
          />}
        </div>
      )}

      {selected && (
        <OwnerModal
          selected={selected}
          user={user}
          profile={profile}
          saving={savingId === selected.item.id}
          participants={participantsFor(selected.type, selected.item.id)}
          onCancel={() => selected.type === "social" ? cancelEvent(selected.item) : cancelSession(selected.item)}
          onClose={() => setSelected(null)}
        />
      )}
    </PageLayout>
  );
}

function CommunitySection({ title, emptyTitle, emptyMessage, emptyAction, icon: Icon, tone, items, renderItem }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", domainTones[tone].icon)}><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">Only you can see the joined-student list for items you created.</p>
        </div>
      </div>
      {items.length ? <div className="space-y-3">{items.map(renderItem)}</div> : <EmptyState icon={Icon} title={emptyTitle} message={emptyMessage} action={emptyAction} />}
    </section>
  );
}

function CommunityCard({ title, label, status, canceled, date, location, language, participants, capacity, onOpen }) {
  return (
    <button onClick={onOpen} className="w-full rounded-lg border border-border bg-background p-4 text-start transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">{label}</p>
          <h3 className="mt-1 truncate font-semibold text-foreground">{title || "Untitled"}</h3>
        </div>
        <span className={cn("shrink-0 rounded px-2 py-0.5 text-xs font-semibold", canceled ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>{status}</span>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{date}</p>
        {location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{location}</p>}
        {language && <p className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" />{language}</p>}
        <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{participants} / {capacity || "-"} joined</p>
      </div>
    </button>
  );
}

function OwnerModal({ selected, user, profile, saving, participants, onCancel, onClose }) {
  const { type, item } = selected;
  const isSocial = type === "social";
  const canceled = item.status === "canceled";
  const title = isSocial ? item.title : item.title || item.course_name;
  const label = isSocial ? item.activity_name || item.category : `${item.is_marathon ? "Study marathon" : "Study group"} - ${item.course_name}`;

  return (
    <Modal title={title || "Community"} onClose={onClose}>
      <div className="space-y-4" dir="auto">
        <p className={cn("text-xs font-semibold", isSocial ? domainTones.social.text : domainTones.study.text)}>{label}{item.preferred_language ? ` - ${item.preferred_language}` : ""}</p>
        {(item.description || item.notes) && <p className="text-sm leading-relaxed text-muted-foreground">{item.description || item.notes}</p>}
        <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
          <p>{isSocial ? socialDate(item) : studyDate(item)}</p>
          {item.location && <p className="mt-1 text-muted-foreground">{item.location}</p>}
          <p className="mt-1 text-muted-foreground">{participants.length} of {item.max_spots || "-"} spots</p>
        </div>
        <section className="rounded-md border border-border p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined students</h3>
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
            <p className="mt-2 text-sm text-muted-foreground">No one has joined yet.</p>
          )}
        </section>
        <Button variant="destructive" className="w-full" disabled={saving || canceled} onClick={onCancel}>
          <X className="me-2 h-4 w-4" />{canceled ? "Already canceled" : isSocial ? "Cancel activity" : "Cancel study group"}
        </Button>
      </div>
    </Modal>
  );
}
