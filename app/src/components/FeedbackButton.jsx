import React, { useState } from 'react';
import { MessageSquarePlus, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

export default function FeedbackButton() {
  const { tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await base44.entities.Feedback.create({ feedback_type: 'app', message, rating });
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); setMessage(''); setRating(0); }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 end-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{tr('giveFeedback')}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <p className="text-center text-primary py-4 font-medium">{tr('feedbackThanks')}</p>
            ) : (
              <>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={cn('w-6 h-6 transition-colors', s <= rating ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="resize-none"
                  rows={3}
                />
                <Button onClick={handleSubmit} disabled={loading || !message.trim()} className="w-full">
                  {tr('submit')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
