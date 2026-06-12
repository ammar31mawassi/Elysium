import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, HeartOff, ThumbsUp, ThumbsDown, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CategoryBadge from "@/components/elysium/CategoryBadge";
import BottomNav from "@/components/elysium/BottomNav";

export default function GuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [helpful, setHelpful] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [guides, saved] = await Promise.all([
        base44.entities.Guide.filter({ id }),
        base44.entities.SavedGuide.filter({ user_id: u.id, guide_id: id }),
      ]);
      if (guides.length) setGuide(guides[0]);
      if (saved.length) { setSaved(true); setSavedId(saved[0].id); }
      setLoading(false);
    };
    load();
  }, [id]);

  const toggleSave = async () => {
    if (saved && savedId) {
      await base44.entities.SavedGuide.delete(savedId);
      setSaved(false); setSavedId(null);
    } else {
      const s = await base44.entities.SavedGuide.create({ user_id: user.id, guide_id: id });
      setSaved(true); setSavedId(s.id);
    }
  };

  const sendFeedback = async (rating) => {
    setHelpful(rating);
    await base44.entities.Feedback.create({
      guide_id: id,
      feedback_type: "Guide",
      rating,
      message: feedbackText || (rating >= 4 ? "This guide was helpful." : "Could be improved."),
    });
    setFeedbackSent(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <p className="text-slate">Guide not found.</p>
    </div>
  );

  const steps = guide.what_to_do ? guide.what_to_do.split("\n").filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link to="/guides" className="flex items-center gap-1 text-slate text-sm hover:text-teal">
            <ChevronLeft className="w-4 h-4" /> Guides
          </Link>
          <button onClick={toggleSave} className="flex items-center gap-1.5 text-sm font-medium">
            {saved ? (
              <><Heart className="w-4 h-4 text-red-500 fill-red-500" /> <span className="text-red-500">Saved</span></>
            ) : (
              <><Heart className="w-4 h-4 text-slate" /> <span className="text-slate">Save</span></>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Title */}
        <div>
          <CategoryBadge category={guide.category} size="md" />
          <h1 className="text-xl font-bold text-charcoal mt-3 leading-snug">{guide.title}</h1>
        </div>

        {/* The Situation */}
        {guide.situation && (
          <Section label="🎯 The Situation" color="bg-amber-muted border-amber/30">
            <p className="text-charcoal text-sm leading-relaxed">{guide.situation}</p>
          </Section>
        )}

        {/* What It Means */}
        {guide.content && (
          <Section label="💡 What It Means">
            <p className="text-charcoal text-sm leading-relaxed whitespace-pre-wrap">{guide.content}</p>
          </Section>
        )}

        {/* What To Do */}
        {steps.length > 0 && (
          <Section label="✅ What To Do">
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-charcoal leading-relaxed">{step.replace(/^\d+\.\s*/, "")}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Who To Contact */}
        {guide.who_to_contact && (
          <Section label="📞 Who To Contact">
            <p className="text-sm text-charcoal leading-relaxed">{guide.who_to_contact}</p>
          </Section>
        )}

        {/* Source */}
        {guide.source_url && (
          <a href={guide.source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-teal text-sm font-medium hover:underline">
            <ExternalLink className="w-4 h-4" /> Official source
          </a>
        )}

        {/* Feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-semibold text-charcoal mb-3">Was this guide helpful?</p>
          {feedbackSent ? (
            <p className="text-teal text-sm font-medium">Thanks for your feedback! 🙏</p>
          ) : (
            <>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => sendFeedback(5)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${helpful === 5 ? "bg-teal text-white border-teal" : "border-gray-200 hover:border-teal/40"}`}
                >
                  <ThumbsUp className="w-4 h-4" /> Yes, helpful
                </button>
                <button
                  onClick={() => setHelpful(0)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${helpful === 0 ? "bg-gray-100 border-gray-300" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <ThumbsDown className="w-4 h-4" /> Not really
                </button>
              </div>
              {helpful === 0 && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="What could be improved? (optional)"
                    className="text-sm resize-none"
                    rows={3}
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                  <Button size="sm" className="bg-teal hover:bg-teal-dark text-white" onClick={() => sendFeedback(2)}>
                    Send feedback
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Section({ label, color = "bg-white border-gray-100", children }) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <p className="font-semibold text-charcoal mb-2">{label}</p>
      {children}
    </div>
  );
}