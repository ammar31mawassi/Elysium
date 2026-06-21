import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Maximize2, RefreshCw, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import { cn } from "@/lib/utils";
import { extractInternalPaths } from "@/lib/productUtils";
import { normalizeCourseRecords } from "@/lib/profileCourses";
import { registerCourses } from "@/lib/courseCatalog";
import { invalidateAppDataCaches, mergeRecordsById, patchCreatedActionCaches } from "@/lib/base44Cache";

const labels = {
  en: { title: "Ely", subtitle: "Your campus next-step assistant", placeholder: "What do you need help with?", empty: "Ask about your next deadline, a course, campus help, or where to find the right person.", open: "Open Ely", close: "Close Ely", full: "Open full chat", error: "Ely could not respond. Try again.", suggestions: ["What should I focus on next?", "Find a Calculus study group", "Where can I get official academic help?"] },
  he: { title: "Ely", subtitle: "העוזר שלך לצעד הבא בקמפוס", placeholder: "במה אפשר לעזור?", empty: "אפשר לשאול על המועד הבא, קורס, עזרה בקמפוס או האדם המתאים.", open: "פתיחת Ely", close: "סגירת Ely", full: "פתיחת הצ'אט המלא", error: "Ely לא הצליחה לענות. נסו שוב.", suggestions: ["במה כדאי להתמקד עכשיו?", "מצא מפגש לימוד בחדו״א", "איפה מקבלים עזרה אקדמית רשמית?"] },
  ar: { title: "Ely", subtitle: "مساعدك للخطوة التالية في الحرم", placeholder: "بماذا تحتاج مساعدة؟", empty: "اسأل عن الموعد القادم أو مساق أو دعم جامعي أو الشخص المناسب.", open: "فتح Ely", close: "إغلاق Ely", full: "فتح المحادثة الكاملة", error: "تعذر على Ely الرد. حاول مرة أخرى.", suggestions: ["على ماذا أركز الآن؟", "ابحث عن جلسة تفاضل وتكامل", "أين أحصل على دعم أكاديمي رسمي؟"] },
};

const FLOATING_MESSAGE = "Hi there, I am Ely. Ask me anything. Need help?";
const RECENT_ACTION_WINDOW_MS = 5000;
const UPCOMING_CALENDAR_LIMIT = 12;

function actionLabel(path, locale) {
  const key = path.split("?")[0];
  const names = {
    en: { "/calendar": "Open calendar", "/discover": "Open discover", "/tools": "Open tools", "/social": "Open activities", "/groups": "Open study", "/profile": "Open profile" },
    he: { "/calendar": "פתיחת היומן", "/discover": "פתיחת הגילוי", "/tools": "פתיחת כלים", "/social": "פתיחת פעילויות", "/groups": "פתיחת לימודים", "/profile": "פתיחת הפרופיל" },
    ar: { "/calendar": "فتح التقويم", "/discover": "فتح الاستكشاف", "/tools": "فتح الأدوات", "/social": "فتح الأنشطة", "/groups": "فتح الدراسة", "/profile": "فتح الملف" },
  };
  if (key === "/me") return "Open Me";
  return names[locale]?.[key] || names.en[key] || "Open";
}

function ElyRobotAvatar({ size = 46, className = "" }) {
  const faceGradientId = React.useId();
  const shellGradientId = React.useId();

  return (
    <svg
      className={cn("ely-robot-avatar", className)}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Ely AI assistant"
    >
      <defs>
        <linearGradient id={faceGradientId} x1="12" y1="11" x2="53" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFEFF" />
          <stop offset="1" stopColor="#DFF7F5" />
        </linearGradient>
        <linearGradient id={shellGradientId} x1="10" y1="9" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#26D3C2" />
          <stop offset="1" stopColor="#0D6B63" />
        </linearGradient>
      </defs>
      <g className="ely-robot-body">
        <path className="ely-robot-antenna" d="M32 13V7" />
        <circle className="ely-robot-antenna-dot" cx="32" cy="6" r="3" />
        <path className="ely-robot-hair" d="M17 24c3.8-9.2 13.6-13.1 23.1-9.9 5.5 1.9 9.2 6.1 10.8 10.9-9-4.4-19.8-3.6-29.3 2.8-1.9 1.3-5.4-1.5-4.6-3.8Z" />
        <rect className="ely-robot-shell" x="9" y="18" width="46" height="37" rx="16" fill={`url(#${shellGradientId})`} />
        <rect className="ely-robot-face" x="13" y="21" width="38" height="31" rx="13" fill={`url(#${faceGradientId})`} />
        <path className="ely-robot-ear-left" d="M9 34H5" />
        <path className="ely-robot-ear-right" d="M59 34h-4" />
        <circle className="ely-robot-blush" cx="21" cy="41" r="2.3" />
        <circle className="ely-robot-blush" cx="43" cy="41" r="2.3" />
        <circle className="ely-robot-eye ely-robot-eye-left" cx="25" cy="34" r="3.1" />
        <circle className="ely-robot-eye ely-robot-eye-right-open" cx="40" cy="34" r="3.1" />
        <path className="ely-robot-wink" d="M37 34.5c2.3 1.9 4.7 1.9 7 0" />
        <path className="ely-robot-lash" d="M21.5 29.5 19.8 27" />
        <path className="ely-robot-lash" d="M27.9 29.2 29.7 26.9" />
        <path className="ely-robot-lash" d="m43.8 31.2 2.4-1.6" />
        <path className="ely-robot-mouth" d="M27 43.2c2.9 3 7.6 3 10.5 0" />
      </g>
    </svg>
  );
}

function courseSignature(profile) {
  return normalizeCourseRecords(profile)
    .map((course) => [course.name.toLocaleLowerCase("en"), course.status, course.semester, course.grade || "", course.credits || ""].join("|"))
    .join(";;");
}

function createdAfter(item, sentAtMs) {
  const createdAt = new Date(item?.created_date || item?.updated_date || "").getTime();
  return Number.isFinite(createdAt) && createdAt >= sentAtMs - RECENT_ACTION_WINDOW_MS;
}

function dateMs(value) {
  const time = value instanceof Date ? value.getTime() : new Date(value || "").getTime();
  return Number.isFinite(time) ? time : null;
}

export function getRelevantUpcomingCalendarItems(items = [], now = new Date(), limit = UPCOMING_CALENDAR_LIMIT) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const startOfToday = new Date(nowDate);
  startOfToday.setHours(0, 0, 0, 0);
  const earliestMs = dateMs(startOfToday) || 0;

  return (items || [])
    .filter((item) => {
      const startsAtMs = dateMs(item?.starts_at);
      return (
        item?.id
        && startsAtMs !== null
        && startsAtMs >= earliestMs
        && item.status !== "canceled"
        && !item.completed
      );
    })
    .sort((a, b) => (dateMs(a.starts_at) || 0) - (dateMs(b.starts_at) || 0))
    .slice(0, limit);
}

function compactObject(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

export function calendarItemToElyContext(item) {
  if (!item) return null;
  return compactObject({
    id: item.id,
    title: item.title,
    course_name: item.course_name,
    starts_at: item.starts_at,
    ends_at: item.ends_at,
    all_day: item.all_day || undefined,
    priority: item.priority || "normal",
    kind: item.personal_kind || item.source_type,
  });
}

export function formatCalendarItemsForStudentContext(items = []) {
  return (items || [])
    .map((item) => {
      const bits = [
        item.title,
        item.course_name ? `course: ${item.course_name}` : "",
        item.starts_at ? `starts: ${item.starts_at}` : "",
        item.ends_at ? `ends: ${item.ends_at}` : "",
        item.priority ? `priority: ${item.priority}` : "",
        item.personal_kind || item.source_type ? `kind: ${item.personal_kind || item.source_type}` : "",
      ].filter(Boolean);
      return bits.length ? `- ${bits.join(" | ")}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export function buildElyActionContext({ user, profile, university, locale, upcomingCalendarItems = [] }) {
  return {
    now_iso: new Date().toISOString(),
    locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "local",
    user_id: user?.id || null,
    profile_id: profile?.id || null,
    university_id: profile?.university_id || university?.id || null,
    university_name: university?.name || null,
    upcoming_calendar: getRelevantUpcomingCalendarItems(upcomingCalendarItems).map(calendarItemToElyContext).filter(Boolean),
    calendar_planning: {
      mode: "text_first_calendar_planner",
      create_only_when_user_clearly_asks_to_save: true,
      can_create_multiple_items_from_one_message: true,
      partial_save_rule: "Save only calendar items with clear title and date/time; ask a concise follow-up for unclear items.",
      after_save_response: ["say exactly what was saved", "suggest a priority order", "split work into realistic time blocks", "include breaks and a first next step"],
      planning_without_save: "When the student only asks for advice, use the visible calendar context to suggest what to do first without creating records.",
      overload_rule: "If the upcoming calendar looks crowded, mention the conflict or overload and suggest a smaller next block.",
    },
    writable_actions: [
      {
        action: "create_calendar_item",
        entity: "CalendarItem",
        required_fields: ["owner_user_id", "source_type", "title", "starts_at"],
        fixed_fields: { owner_user_id: user?.id || null, source_type: "personal", status: "active", completed: false },
        allowed_personal_kind: ["homework", "exam", "other"],
        allowed_priority: ["normal", "important", "urgent"],
        can_create_multiple_from_one_message: true,
      },
      {
        action: "update_profile_courses",
        entity: "StudentProfile",
        profile_id: profile?.id || null,
        writable_fields_only: ["courses", "course_records"],
        default_course_record: { status: "active", semester: "unassigned" },
      },
    ],
  };
}

export async function syncElyActionSideEffects({ api = base44, user, profile, setProfile, sentAt, syncedCalendarItemIds }) {
  if (!user?.id) return;
  const sentAtMs = new Date(sentAt).getTime();
  const [profiles, recentCalendarItems] = await Promise.all([
    api.entities.StudentProfile.filter({ user_id: user.id }).catch(() => []),
    api.entities.CalendarItem.filter({ owner_user_id: user.id }, "-created_date", 8).catch(() => []),
  ]);

  const latestProfile = profiles?.[0];
  if (latestProfile?.id) {
    const previousCourseSignature = courseSignature(profile);
    const nextCourseSignature = courseSignature(latestProfile);
    setProfile?.((current) => current ? { ...current, ...latestProfile } : latestProfile);
    if (nextCourseSignature && nextCourseSignature !== previousCourseSignature) {
      await registerCourses(api, {
        universityId: latestProfile.university_id,
        userId: user.id,
        courses: normalizeCourseRecords(latestProfile),
      }).catch(() => []);
    }
  }

  const nextItems = (recentCalendarItems || []).filter((item) => (
    item?.id
    && item.source_type === "personal"
    && createdAfter(item, sentAtMs)
    && !syncedCalendarItemIds?.has(item.id)
  ));

  nextItems.forEach((calendarItem) => {
    syncedCalendarItemIds?.add(calendarItem.id);
    patchCreatedActionCaches({ type: "calendar", calendarItem });
    window.dispatchEvent(new CustomEvent("elysium:create-action-complete", { detail: { type: "calendar", calendarItem } }));
  });

  if (latestProfile?.id || nextItems.length) invalidateAppDataCaches();
}

export default function ElyAssistant({ embedded = false, defaultOpen = false }) {
  const { locale, isRTL } = useLanguage();
  const { user, profile, university, setProfile } = useProfile();
  const copy = labels[locale] || labels.en;
  const [open, setOpen] = useState(defaultOpen || embedded);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarItems, setCalendarItems] = useState([]);
  const bottomRef = useRef(null);
  const messagesRef = useRef([]);
  const syncedCalendarItemIdsRef = useRef(new Set());

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (!open || conversation || !user?.id) return undefined;
    let active = true;
    let unsubscribe = () => {};

    async function connect() {
      setLoading(true);
      try {
        const existing = await base44.agents.listConversations({ q: { agent_name: "elysium_assistant" }, sort: "-updated_date", limit: 1, skip: 0 });
        const next = existing?.[0]
          ? await base44.agents.getConversation(existing[0].id)
          : await base44.agents.createConversation({ agent_name: "elysium_assistant", metadata: { locale, university_id: profile?.university_id || null } });
        if (!active || !next) return;
        setConversation(next);
        setMessages(next.messages || []);
        unsubscribe = base44.agents.subscribeToConversation(next.id, (updated) => {
          if (active) setMessages(updated?.messages || []);
        });
      } catch (cause) {
        console.error(cause);
        if (active) setError(copy.error);
      } finally {
        if (active) setLoading(false);
      }
    }

    connect();
    return () => { active = false; unsubscribe(); };
  }, [open, conversation, user?.id, profile?.university_id, locale, copy.error]);

  useEffect(() => {
    if (!open || !user?.id) {
      setCalendarItems([]);
      return undefined;
    }

    let active = true;
    const handleCreatedAction = (event) => {
      const calendarItem = event?.detail?.calendarItem;
      if (calendarItem) setCalendarItems((current) => mergeRecordsById(current, [calendarItem]));
    };

    async function loadCalendarContext() {
      try {
        const rows = await base44.entities.CalendarItem.filter({ owner_user_id: user.id });
        if (active) setCalendarItems(getRelevantUpcomingCalendarItems(rows));
      } catch (cause) {
        console.error(cause);
        if (active) setCalendarItems([]);
      }
    }

    window.addEventListener("elysium:create-action-complete", handleCreatedAction);
    loadCalendarContext();
    return () => {
      active = false;
      window.removeEventListener("elysium:create-action-complete", handleCreatedAction);
    };
  }, [open, user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const upcomingCalendarItems = useMemo(() => getRelevantUpcomingCalendarItems(calendarItems), [calendarItems]);
  const upcomingCalendarSummary = useMemo(() => formatCalendarItemsForStudentContext(upcomingCalendarItems), [upcomingCalendarItems]);

  const studentContext = useMemo(() => [
    user?.id ? `User ID: ${user.id}` : "",
    profile?.id ? `Profile ID: ${profile.id}` : "",
    profile?.preferred_name || user?.full_name ? `Student: ${profile?.preferred_name || user?.full_name}` : "",
    university?.name ? `University: ${university.name}` : "",
    profile?.university_id ? `University ID: ${profile.university_id}` : "",
    profile?.academic_year ? `Academic year: ${profile.academic_year}` : "",
    profile?.field_of_study ? `Field: ${profile.field_of_study}` : "",
    normalizeCourseRecords(profile).length
      ? `Courses: ${normalizeCourseRecords(profile).map((course) => `${course.name} (${course.status})`).join(", ")}`
      : "",
    upcomingCalendarSummary ? `Upcoming calendar:\n${upcomingCalendarSummary}` : "Upcoming calendar: no active upcoming items found",
    `Preferred locale: ${locale}`,
  ].filter(Boolean).join("\n"), [profile, user?.id, user?.full_name, university?.id, university?.name, upcomingCalendarSummary, locale]);

  const actionContext = useMemo(() => buildElyActionContext({ user, profile, university, locale, upcomingCalendarItems }), [user, profile, university, locale, upcomingCalendarItems]);

  async function waitForAgentReply(conversationId, previousAssistantCount) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1250));
      const updated = await base44.agents.getConversation(conversationId);
      const nextMessages = updated?.messages || [];
      if (nextMessages.length) setMessages(nextMessages);
      if (nextMessages.filter((message) => message.role === "assistant" && message.content).length > previousAssistantCount) return true;
    }
    return false;
  }

  async function fallbackReply(content) {
    const recent = messagesRef.current.slice(-6).map((message) => `${message.role}: ${typeof message.content === "string" ? message.content : JSON.stringify(message.content)}`).join("\n");
    const prompt = `You are Ely, Elysium's trilingual campus next-step assistant. Reply in ${locale === "he" ? "Hebrew" : locale === "ar" ? "Arabic" : "English"}. Keep the answer short and use these headings: Now, Next, Help. Never invent university rules, deadlines, contacts, or links. You may suggest these verified internal routes: /calendar, /discover?tab=social, /discover?tab=sessions, /discover?tab=tutors, /discover?tab=helpers, /tools, /profile, /me. Do not complete graded assignments. You can give text-first calendar planning advice from the student context: suggest priorities, realistic work blocks, breaks, and the first next step. This fallback channel cannot save calendar items or profile courses, so if the student asked you to add or update something, say you could not confirm the save and ask them to try again or use /calendar or /me.\n\nStudent context:\n${studentContext}\n\nRecent conversation:\n${recent}\n\nStudent question: ${content}`;
    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const assistantMessage = { id: `ely-fallback-${Date.now()}`, role: "assistant", content: typeof response === "string" ? response : JSON.stringify(response), created_date: new Date().toISOString(), fallback: true };
    setMessages((current) => [...current, assistantMessage]);
  }

  async function send(message = input) {
    const content = message.trim();
    if (!content || !conversation || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    try {
      const sentAt = new Date().toISOString();
      const previousAssistantCount = messagesRef.current.filter((item) => item.role === "assistant" && item.content).length;
      const optimistic = { id: `ely-user-${Date.now()}`, role: "user", content, created_date: new Date().toISOString() };
      setMessages((current) => [...current, optimistic]);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content,
        custom_context: [
          { type: "student_context", message: "Use this current student context.", data: { summary: studentContext } },
          { type: "ely_action_context", message: "Use this for text-first calendar planning, calendar item saves, and profile course updates.", data: actionContext },
        ],
      });
      const replied = await waitForAgentReply(conversation.id, previousAssistantCount);
      if (replied) {
        await syncElyActionSideEffects({
          user,
          profile,
          setProfile,
          sentAt,
          syncedCalendarItemIds: syncedCalendarItemIdsRef.current,
        });
      } else {
        await fallbackReply(content);
      }
    } catch (cause) {
      console.error(cause);
      try {
        await fallbackReply(content);
      } catch (fallbackError) {
        console.error(fallbackError);
        setError(copy.error);
      }
    } finally {
      setLoading(false);
    }
  }

  const panel = (
    <section className={cn(
      "flex min-h-0 flex-col bg-background",
      embedded ? "h-[calc(100vh-9rem)] min-h-[540px] rounded-lg border border-border" : "fixed inset-0 z-[90] sm:inset-y-0 sm:start-auto sm:end-0 sm:w-[430px] sm:border-s sm:border-border"
    )} dir={isRTL ? "rtl" : "ltr"} aria-label={copy.title}>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ElyRobotAvatar size={36} /></span>
        <div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-foreground">{copy.title}</h2><p className="truncate text-xs text-muted-foreground">{copy.subtitle}</p></div>
        {!embedded && <Link to="/ask" className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={copy.full}><Maximize2 className="h-4 w-4" /></Link>}
        {!embedded && <button onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={copy.close}><X className="h-5 w-5" /></button>}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {!messages.length && !loading && (
          <div className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
            <ElyRobotAvatar size={76} className="ely-robot-avatar-large" />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{copy.empty}</p>
            <div className="mt-5 flex w-full flex-col gap-2">{copy.suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} className="min-h-11 rounded-md border border-border px-3 py-2 text-start text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5">{suggestion}</button>)}</div>
          </div>
        )}
        <div className="space-y-4">
          {messages.filter((message) => !message.hidden && message.content).map((message, index) => {
            const assistant = message.role === "assistant";
            const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
            const links = assistant ? extractInternalPaths(content).slice(0, 3) : [];
            return (
              <div key={message.id || `${message.role}-${index}`} className={cn("flex", assistant ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[88%]", assistant ? "text-start" : "text-end")}>
                  <div dir="auto" className={cn("rounded-lg px-3.5 py-3 text-sm leading-relaxed", assistant ? "border border-border bg-card text-foreground" : "bg-primary text-primary-foreground")}>
                    {assistant ? <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{content}</ReactMarkdown> : content}
                  </div>
                  {links.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{links.map((path) => <Link key={path} to={path} onClick={() => !embedded && setOpen(false)} className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary">{actionLabel(path, locale)}<ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" /></Link>)}</div>}
                </div>
              </div>
            );
          })}
        </div>
        {loading && <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ElyRobotAvatar size={28} /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></div>}
        {error && <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><RefreshCw className="h-4 w-4" />{error}</div>}
        <div ref={bottomRef} />
      </div>

      <footer className="shrink-0 border-t border-border bg-background p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 rounded-lg border border-input bg-card p-2 focus-within:border-primary">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={copy.placeholder} rows={1} dir="auto" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <button onClick={() => send()} disabled={!input.trim() || !conversation || loading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40" aria-label={copy.open}><Send className="h-4 w-4 rtl:-scale-x-100" /></button>
        </div>
      </footer>
    </section>
  );

  if (embedded) return panel;
  return (
    <>
      {open && <><button className="fixed inset-0 z-[80] bg-black/55 sm:block" onClick={() => setOpen(false)} aria-label={copy.close} />{panel}</>}
      {!open && (
        <div className="ely-float-shell fixed bottom-[calc(112px+env(safe-area-inset-bottom))] end-4 z-[60] md:bottom-[5.5rem] md:end-6" dir={isRTL ? "rtl" : "ltr"}>
          <div className="ely-chat-callout" aria-hidden="true">
            <span className="ely-chat-callout-text">{FLOATING_MESSAGE}</span>
          </div>
          <button data-tour="ely-assistant" onClick={() => setOpen(true)} className="ely-float-button" aria-label={copy.open} title={copy.open}>
            <ElyRobotAvatar size={52} />
          </button>
        </div>
      )}
    </>
  );
}
