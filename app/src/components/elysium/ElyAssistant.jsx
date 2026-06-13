import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Maximize2, RefreshCw, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import ElysiumMark from "@/components/elysium/ElysiumMark";
import { cn } from "@/lib/utils";
import { extractInternalPaths } from "@/lib/productUtils";

const labels = {
  en: { title: "Ely", subtitle: "Your campus next-step assistant", placeholder: "What do you need help with?", empty: "Ask about your next deadline, a course, campus help, or where to find the right person.", open: "Open Ely", close: "Close Ely", full: "Open full chat", error: "Ely could not respond. Try again.", suggestions: ["What should I focus on next?", "Find a Calculus study session", "Where can I get official academic help?"] },
  he: { title: "Ely", subtitle: "העוזר שלך לצעד הבא בקמפוס", placeholder: "במה אפשר לעזור?", empty: "אפשר לשאול על המועד הבא, קורס, עזרה בקמפוס או האדם המתאים.", open: "פתיחת Ely", close: "סגירת Ely", full: "פתיחת הצ'אט המלא", error: "Ely לא הצליחה לענות. נסו שוב.", suggestions: ["במה כדאי להתמקד עכשיו?", "מצא מפגש לימוד בחדו״א", "איפה מקבלים עזרה אקדמית רשמית?"] },
  ar: { title: "Ely", subtitle: "مساعدك للخطوة التالية في الحرم", placeholder: "بماذا تحتاج مساعدة؟", empty: "اسأل عن الموعد القادم أو مساق أو دعم جامعي أو الشخص المناسب.", open: "فتح Ely", close: "إغلاق Ely", full: "فتح المحادثة الكاملة", error: "تعذر على Ely الرد. حاول مرة أخرى.", suggestions: ["على ماذا أركز الآن؟", "ابحث عن جلسة تفاضل وتكامل", "أين أحصل على دعم أكاديمي رسمي؟"] },
};

function actionLabel(path, locale) {
  const key = path.split("?")[0];
  const names = {
    en: { "/calendar": "Open calendar", "/discover": "Open discover", "/tools": "Open tools", "/social": "Open activities", "/groups": "Open study", "/profile": "Open profile" },
    he: { "/calendar": "פתיחת היומן", "/discover": "פתיחת הגילוי", "/tools": "פתיחת כלים", "/social": "פתיחת פעילויות", "/groups": "פתיחת לימודים", "/profile": "פתיחת הפרופיל" },
    ar: { "/calendar": "فتح التقويم", "/discover": "فتح الاستكشاف", "/tools": "فتح الأدوات", "/social": "فتح الأنشطة", "/groups": "فتح الدراسة", "/profile": "فتح الملف" },
  };
  return names[locale]?.[key] || names.en[key] || "Open";
}

export default function ElyAssistant({ embedded = false, defaultOpen = false }) {
  const { locale, isRTL } = useLanguage();
  const { user, profile, university } = useProfile();
  const copy = labels[locale] || labels.en;
  const [open, setOpen] = useState(defaultOpen || embedded);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const studentContext = useMemo(() => [
    profile?.preferred_name || user?.full_name ? `Student: ${profile?.preferred_name || user?.full_name}` : "",
    university?.name ? `University: ${university.name}` : "",
    profile?.academic_year ? `Academic year: ${profile.academic_year}` : "",
    profile?.field_of_study ? `Field: ${profile.field_of_study}` : "",
    profile?.courses?.length ? `Courses: ${profile.courses.join(", ")}` : "",
    `Preferred locale: ${locale}`,
  ].filter(Boolean).join("\n"), [profile, user?.full_name, university?.name, locale]);

  async function send(message = input) {
    const content = message.trim();
    if (!content || !conversation || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content,
        custom_context: [{ type: "student_context", message: "Use this current student context.", data: { summary: studentContext } }],
      });
    } catch (cause) {
      console.error(cause);
      setError(copy.error);
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
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ElysiumMark size={34} /></span>
        <div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-foreground">{copy.title}</h2><p className="truncate text-xs text-muted-foreground">{copy.subtitle}</p></div>
        {!embedded && <Link to="/ask" className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={copy.full}><Maximize2 className="h-4 w-4" /></Link>}
        {!embedded && <button onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={copy.close}><X className="h-5 w-5" /></button>}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {!messages.length && !loading && (
          <div className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
            <ElysiumMark size={72} />
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
        {loading && <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ElysiumMark size={26} /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></div>}
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
      {!open && <button onClick={() => setOpen(true)} className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] end-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-card shadow-lg transition-transform hover:scale-105 md:bottom-6 md:end-6" aria-label={copy.open} title={copy.open}><ElysiumMark size={46} /></button>}
    </>
  );
}
