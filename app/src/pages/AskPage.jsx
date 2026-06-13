import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { Send, Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function AskPage() {
  const { user, profile, university } = useProfile();
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = async () => {
    if (!user?.id || !profile) return '';
    const [calItems, joined] = await Promise.all([
      base44.entities.CalendarItem.filter({ owner_user_id: user.id }),
      base44.entities.StudyGroupMember.filter({ user_id: user.id }),
    ]);
    const upcoming = (calItems || []).filter(i => !i.completed && i.status === 'active').slice(0, 5);
    return [
      `Student: ${user.full_name}`,
      `University: ${university?.name || 'Unknown'}`,
      profile.academic_year ? `Year: ${profile.academic_year}` : '',
      profile.courses?.length ? `Courses: ${profile.courses.join(', ')}` : '',
      profile.interests?.length ? `Interests: ${profile.interests.join(', ')}` : '',
      upcoming.length ? `Upcoming calendar items: ${upcoming.map(i => `${i.title} (${i.starts_at || 'TBD'})`).join('; ')}` : '',
      `Preferred language: ${locale}`,
    ].filter(Boolean).join('\n');
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    const ctx = await buildContext();
    const prompt = `You are Elysium Assistant, a helpful student companion AI for Israeli universities. You have access to the following student context:\n\n${ctx}\n\nThe student asks (in ${locale}):\n${input}\n\nRespond in ${locale} language. Keep responses short and actionable. Cite sources when referencing university policies. Do not invent deadlines, phone numbers, or official URLs. For urgent health/safety concerns, direct to official support.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const aiMsg = { role: 'assistant', content: response, id: Date.now() };
    setMessages(p => [...p, aiMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const submitFeedback = async (msgId, helpful) => {
    setFeedback(f => ({ ...f, [msgId]: helpful }));
    await base44.entities.Feedback.create({ feedback_type: 'App', message: `AI feedback: ${helpful ? 'helpful' : 'not helpful'}`, rating: helpful ? 5 : 2 });
  };

  return (
    <PageLayout title={t('ai_title')}>
      {/* Disclaimer */}
      <div className="mb-4 p-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
        {t('ai_disclaimer')}
      </div>

      {/* Messages */}
      <div className="space-y-4 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t('ai_title')}</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">{t('ai_placeholder')}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['What should I focus on next?', 'Is anyone studying today?', 'Find me a Calculus tutor'].map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-xs border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={cn("max-w-[85%]", msg.role === 'user' && "flex flex-col items-end")}>
              <div className={cn("rounded-xl px-4 py-2.5 text-sm", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground")}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'assistant' && msg.id && (
                <div className="flex items-center gap-2 mt-1.5 ms-1">
                  <span className="text-xs text-muted-foreground">{t('ai_useful')}</span>
                  <button onClick={() => submitFeedback(msg.id, true)} className={cn("p-1 rounded hover:bg-muted transition-colors", feedback[msg.id] === true && "text-primary")}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => submitFeedback(msg.id, false)} className={cn("p-1 rounded hover:bg-muted transition-colors", feedback[msg.id] === false && "text-destructive")}>
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {t('ai_error')}
            <button onClick={() => setError(null)} className="ms-auto flex items-center gap-1 text-xs font-medium hover:underline">
              <RefreshCw className="w-3 h-3" />{t('ai_retry')}
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <Input
          className="flex-1"
          placeholder={t('ai_placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <Button size="icon" disabled={!input.trim() || loading} onClick={send}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </PageLayout>
  );
}