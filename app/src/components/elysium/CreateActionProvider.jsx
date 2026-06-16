import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import { activeCourseNames, normalizeCourseRecords } from "@/lib/profileCourses";
import { buildCourseOptions, categoryForInterest } from "@/lib/creationOptions";
import { DEFAULT_INTERESTS, localizedOption, mergeInterestOptions, normalizeOptionName } from "@/lib/onboardingOptions";
import { createActionCopy } from "@/lib/createActions";
import SearchableChoice from "@/components/elysium/SearchableChoice";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const CreateActionContext = createContext({ openCreateAction: () => {} });

const PERSONAL_KINDS = ["homework", "exam", "other"];
const PRIORITIES = ["normal", "important", "urgent"];

const emptySocialForm = {
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
};

const emptyStudyForm = {
  title: "",
  course_name: "",
  preferred_language: "",
  session_date: "",
  end_time: "",
  location: "",
  notes: "",
  max_spots: 8,
  is_marathon: false,
};

function makeCalendarForm(kind = "other") {
  return {
    title: "",
    starts_at: "",
    notes: "",
    priority: "normal",
    all_day: false,
    personal_kind: PERSONAL_KINDS.includes(kind) ? kind : "other",
    course_name: "",
  };
}

function safeQuery(promise, fallback = []) {
  return promise.then((rows) => rows || fallback).catch(() => fallback);
}

function asIso(value) {
  return value ? new Date(value).toISOString() : undefined;
}

function calendarStart(event) {
  return new Date(`${event.date}T${event.start_time || "12:00"}:00`).toISOString();
}

function broadcastCreated(detail) {
  window.dispatchEvent(new CustomEvent("elysium:create-action-complete", { detail }));
}

export function CreateActionProvider({ children }) {
  const [action, setAction] = useState(null);
  const openCreateAction = (nextAction) => setAction(nextAction);

  return (
    <CreateActionContext.Provider value={{ openCreateAction }}>
      {children}
      {action && <CreateActionDialog action={action} onClose={() => setAction(null)} />}
    </CreateActionContext.Provider>
  );
}

export function useCreateAction() {
  return useContext(CreateActionContext);
}

function CreateActionDialog({ action, onClose }) {
  const { user, profile } = useProfile();
  const { locale, t } = useLanguage();
  const copy = createActionCopy(locale);
  const actionCopy = copy.actions.find((item) => item.key === action);
  const [saving, setSaving] = useState(false);
  const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ en: "", he: "" });
  const [socialForm, setSocialForm] = useState(emptySocialForm);
  const [studyForm, setStudyForm] = useState(emptyStudyForm);
  const [calendarForm, setCalendarForm] = useState(() => makeCalendarForm(action));

  useEffect(() => {
    setCalendarForm(makeCalendarForm(action));
  }, [action]);

  useEffect(() => {
    if (action !== "social") return;
    safeQuery(base44.entities.Interest.filter({ is_active: true })).then((rows) => {
      setInterestOptions(mergeInterestOptions(rows));
    });
  }, [action]);

  const activeCourses = useMemo(() => activeCourseNames(profile), [profile]);
  const courseOptions = useMemo(() => buildCourseOptions(activeCourses), [activeCourses]);
  const activityChoices = useMemo(() => interestOptions.map((interest) => ({
    value: interest.en,
    label: localizedOption(interest, locale),
    keywords: [interest.en, interest.he, interest.ar],
    sourceId: interest.persisted ? interest.id : "",
  })), [interestOptions, locale]);

  const title = action === "study"
    ? "Create study group"
    : action === "social"
      ? "Create activity"
      : `Add ${actionCopy?.label?.toLowerCase() || "calendar item"}`;

  const addNewActivity = async () => {
    const english = newActivity.en.trim();
    const hebrew = newActivity.he.trim();
    if (!english || !hebrew || !user?.id) return;
    setSaving(true);
    try {
      const existing = interestOptions.find((item) => normalizeOptionName(item.en) === normalizeOptionName(english));
      let option = existing;
      if (!option) {
        const record = await base44.entities.Interest.create({
          name_en: english,
          name_he: hebrew,
          normalized_key: normalizeOptionName(english),
          created_by: user.id,
          is_active: true,
        });
        option = { id: record.id, en: english, he: hebrew, ar: english, persisted: true };
        setInterestOptions((current) => [...current, option]);
      }
      setSocialForm((current) => ({ ...current, activity_id: option.id || "", activity_name: option.en, category: categoryForInterest(option.en) }));
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

  const createSocial = async () => {
    if (!user?.id || !profile?.university_id || !socialForm.title.trim() || !socialForm.date || !socialForm.activity_name || socialForm.max_spots < 2) return;
    setSaving(true);
    try {
      const created = await base44.entities.SocialEvent.create({
        ...socialForm,
        title: socialForm.title.trim(),
        organizer_id: user.id,
        organizer_name: profile.preferred_name || user.full_name || "Student",
        organizer_academic_year: profile.academic_year || "",
        organizer_field_of_study: profile.field_of_study || "",
        university_id: profile.university_id,
        is_open: true,
        status: "open",
      });
      const membership = await base44.entities.SocialEventMember.create({ event_id: created.id, university_id: profile.university_id, user_id: user.id, status: "approved" });
      const calendarItem = await base44.entities.CalendarItem.create({
        owner_user_id: user.id,
        source_type: "social_activity",
        source_id: created.id,
        title: created.title,
        starts_at: calendarStart(created),
        ends_at: created.end_time ? new Date(`${created.date}T${created.end_time}:00`).toISOString() : undefined,
        notes: created.location || "",
        status: "active",
        completed: false,
      });
      broadcastCreated({ type: "social", event: created, membership, calendarItem });
      toast({ title: "Activity created", description: "It is now visible to students at your university." });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Activity was not created" });
    } finally {
      setSaving(false);
    }
  };

  const createStudy = async () => {
    if (!user?.id || !profile?.university_id || !studyForm.title.trim() || !activeCourses.includes(studyForm.course_name) || !studyForm.session_date) return;
    setSaving(true);
    try {
      const session = await base44.entities.StudySession.create({
        ...studyForm,
        title: studyForm.title.trim(),
        university_id: profile.university_id,
        session_date: asIso(studyForm.session_date),
        end_time: asIso(studyForm.end_time),
        host_id: user.id,
        host_name: profile.preferred_name || user.full_name || "Student",
        host_academic_year: profile.academic_year || "",
        host_field_of_study: profile.field_of_study || "",
        status: "open",
      });
      const membership = await base44.entities.StudySessionMember.create({ session_id: session.id, university_id: profile.university_id, user_id: user.id });
      const calendarItem = await base44.entities.CalendarItem.create({
        owner_user_id: user.id,
        source_type: "study_session",
        source_id: session.id,
        course_name: session.course_name,
        title: session.title,
        starts_at: session.session_date,
        ends_at: session.end_time,
        notes: session.location || "",
        status: "active",
        completed: false,
      });
      broadcastCreated({ type: "study", session, membership, calendarItem });
      toast({ title: "Study group created", description: "It is now visible to students in that course." });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Study group was not created" });
    } finally {
      setSaving(false);
    }
  };

  const createCalendarItem = async () => {
    if (!user?.id || !calendarForm.title.trim() || !calendarForm.starts_at) return;
    setSaving(true);
    try {
      const payload = {
        owner_user_id: user.id,
        source_type: "personal",
        personal_kind: calendarForm.personal_kind,
        course_name: calendarForm.personal_kind === "other" ? "" : calendarForm.course_name,
        title: calendarForm.title.trim(),
        starts_at: new Date(calendarForm.starts_at).toISOString(),
        notes: calendarForm.notes,
        priority: calendarForm.priority,
        all_day: calendarForm.all_day,
        completed: false,
        status: "active",
      };
      const calendarItem = await base44.entities.CalendarItem.create(payload);
      broadcastCreated({ type: "calendar", calendarItem });
      toast({ title: "Calendar item added" });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Calendar item was not added" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      {action === "social" && (
        <SocialForm
          form={socialForm}
          setForm={setSocialForm}
          activityChoices={activityChoices}
          showNewActivity={showNewActivity}
          setShowNewActivity={setShowNewActivity}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
          addNewActivity={addNewActivity}
          saving={saving}
          onSubmit={createSocial}
          loadingLabel={t("common_loading")}
        />
      )}
      {action === "study" && (
        <StudyForm
          form={studyForm}
          setForm={setStudyForm}
          courseOptions={courseOptions}
          activeCourses={activeCourses}
          saving={saving}
          onSubmit={createStudy}
          loadingLabel={t("common_loading")}
        />
      )}
      {PERSONAL_KINDS.includes(action) && (
        <CalendarForm
          form={calendarForm}
          setForm={setCalendarForm}
          profile={profile}
          saving={saving}
          submitLabel={t("common_save")}
          onSubmit={createCalendarItem}
        />
      )}
    </Modal>
  );
}

function SocialForm({ form, setForm, activityChoices, showNewActivity, setShowNewActivity, newActivity, setNewActivity, addNewActivity, saving, onSubmit, loadingLabel }) {
  return (
    <div className="space-y-4">
      <Field label="Activity name">
        <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus />
      </Field>
      <Field label="Related hobby or activity">
        <SearchableChoice value={form.activity_name} options={activityChoices} placeholder="Search football, gaming, music..." emptyLabel="No matching hobby found." onChange={(option) => setForm((current) => ({ ...current, activity_id: option?.sourceId || "", activity_name: option?.value || "", category: option ? categoryForInterest(option.value) : "" }))} />
      </Field>
      <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setShowNewActivity((current) => !current)}>
        <Plus className="h-4 w-4" />Add a new activity
      </Button>
      {showNewActivity && (
        <div className="rounded-md border border-border p-3">
          <p className="mb-2 text-xs text-muted-foreground">Add English and Hebrew names so everyone can search for it.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={newActivity.en} onChange={(event) => setNewActivity((current) => ({ ...current, en: event.target.value }))} placeholder="English name" />
            <Input dir="rtl" value={newActivity.he} onChange={(event) => setNewActivity((current) => ({ ...current, he: event.target.value }))} placeholder="Hebrew name" />
          </div>
          <Button className="mt-2" disabled={saving || !newActivity.en.trim() || !newActivity.he.trim()} onClick={addNewActivity}>Add and select</Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></Field>
        <Field label="Capacity"><Input type="number" min="2" max="200" value={form.max_spots} onChange={(event) => setForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts"><Input type="time" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} /></Field>
        <Field label="Ends"><Input type="time" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} /></Field>
      </div>
      <Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field>
      <Field label="Preferred language (optional)">
        <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.preferred_language} onChange={(event) => setForm((current) => ({ ...current, preferred_language: event.target.value }))}>
          <option value="">Any language</option>
          <option value="English">English</option>
          <option value="Hebrew">Hebrew</option>
          <option value="Arabic">Arabic</option>
        </select>
      </Field>
      <Field label="Description"><Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
      <Button className="w-full" disabled={saving || !form.title.trim() || !form.activity_name || !form.date || form.max_spots < 2} onClick={onSubmit}>{saving ? loadingLabel : "Create activity"}</Button>
    </div>
  );
}

function StudyForm({ form, setForm, courseOptions, activeCourses, saving, onSubmit, loadingLabel }) {
  return (
    <div className="space-y-4">
      {!activeCourses.length && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground">Add an active course in Me before creating a study group.</div>}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Format</p>
        <div role="group" aria-label="Study format" className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
          <button type="button" onClick={() => setForm((current) => ({ ...current, is_marathon: false }))} className={cn("min-h-10 rounded-md text-sm font-semibold", !form.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study group</button>
          <button type="button" onClick={() => setForm((current) => ({ ...current, is_marathon: true }))} className={cn("min-h-10 rounded-md text-sm font-semibold", form.is_marathon ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Study marathon</button>
        </div>
      </div>
      <Field label={form.is_marathon ? "Marathon title" : "Group title"}><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field>
      <Field label="Active course"><SearchableChoice value={form.course_name} options={courseOptions} placeholder="Select one of your active courses" emptyLabel="Add an active course in Me first." onChange={(option) => setForm((current) => ({ ...current, course_name: option?.value || "" }))} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Starts"><Input type="datetime-local" value={form.session_date} onChange={(event) => setForm((current) => ({ ...current, session_date: event.target.value }))} /></Field>
        <Field label="Ends"><Input type="datetime-local" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Preferred language (optional)">
          <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.preferred_language} onChange={(event) => setForm((current) => ({ ...current, preferred_language: event.target.value }))}>
            <option value="">Any language</option>
            <option value="English">English</option>
            <option value="Hebrew">Hebrew</option>
            <option value="Arabic">Arabic</option>
          </select>
        </Field>
        <Field label="Capacity"><Input type="number" min="2" max="50" value={form.max_spots} onChange={(event) => setForm((current) => ({ ...current, max_spots: Number(event.target.value) }))} /></Field>
      </div>
      <Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field>
      <Field label="What will you study?"><Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
      <Button className="w-full" disabled={saving || !form.title.trim() || !activeCourses.includes(form.course_name) || !form.session_date} onClick={onSubmit}>{saving ? loadingLabel : form.is_marathon ? "Create marathon" : "Create study group"}</Button>
    </div>
  );
}

function CalendarForm({ form, setForm, profile, saving, submitLabel, onSubmit }) {
  return (
    <div className="space-y-4">
      <Field label="Type">
        <div className="grid grid-cols-3 gap-2">
          {PERSONAL_KINDS.map((kind) => (
            <button key={kind} type="button" onClick={() => setForm((current) => ({ ...current, personal_kind: kind, course_name: kind === "other" ? "" : current.course_name }))} className={cn("h-10 rounded-md border text-xs font-semibold capitalize", form.personal_kind === kind ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{kind}</button>
          ))}
        </div>
      </Field>
      <Field label="Title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} autoFocus /></Field>
      {form.personal_kind !== "other" && (
        <Field label="Course (optional)">
          <select value={form.course_name} onChange={(event) => setForm((current) => ({ ...current, course_name: event.target.value }))} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">No course</option>
            {normalizeCourseRecords(profile).map((course) => <option key={course.name} value={course.name}>{course.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Date and time"><Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} /></Field>
      <Field label="Priority">
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((priority) => (
            <button key={priority} type="button" onClick={() => setForm((current) => ({ ...current, priority }))} className={cn("h-10 rounded-md border text-xs font-semibold capitalize", form.priority === priority ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{priority}</button>
          ))}
        </div>
      </Field>
      <Field label="Notes or location"><Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
      <Button className="w-full" disabled={saving || !form.title.trim() || !form.starts_at} onClick={onSubmit}>{saving ? "Saving..." : submitLabel}</Button>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
