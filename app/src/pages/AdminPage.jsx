import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Check, X, Plus, Eye, EyeOff, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user } = useProfile();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState("teachers");
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [reports, setReports] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  // Guard — non-admin redirect
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([
      base44.entities.PrivateTeacher.filter({ is_active: false }),
      base44.entities.Guide.list(),
      base44.entities.Feedback.list(),
      base44.entities.PeerHelper.list(),
      base44.entities.Report.list(),
      base44.entities.University.list(),
    ]).then(([t, g, f, h, r, u]) => {
      setPendingTeachers(t || []);
      setGuides(g || []);
      setFeedbacks(f || []);
      setHelpers(h || []);
      setReports(r || []);
      setUniversities(u || []);
      setLoading(false);
    });
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="w-10 h-10 text-destructive mb-3" />
          <p className="text-sm font-semibold text-foreground">Access denied</p>
          <p className="text-xs text-muted-foreground mt-1">This area is for administrators only.</p>
        </div>
      </PageLayout>
    );
  }

  const approveTeacher = async (id) => {
    await base44.entities.PrivateTeacher.update(id, { is_active: true });
    setPendingTeachers(p => p.filter(t => t.id !== id));
  };
  const rejectTeacher = async (id) => {
    await base44.entities.PrivateTeacher.delete(id);
    setPendingTeachers(p => p.filter(t => t.id !== id));
  };
  const togglePublish = async (guide) => {
    await base44.entities.Guide.update(guide.id, { is_published: !guide.is_published });
    setGuides(p => p.map(g => g.id === guide.id ? { ...g, is_published: !g.is_published } : g));
  };
  const resolveReport = async (id) => {
    await base44.entities.Report.update(id, { status: 'resolved' });
    setReports(p => p.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const TABS = [
    { key: 'teachers', label: `Tutors (${pendingTeachers.length})` },
    { key: 'guides', label: 'Guides' },
    { key: 'reports', label: `Reports (${reports.filter(r => r.status === 'open').length})` },
    { key: 'helpers', label: 'Helpers' },
    { key: 'feedback', label: 'Feedback' },
  ];

  const GUIDE_CATEGORIES = ["First Week", "Course Registration", "Exams & Appeals", "Scholarships", "Student Rights", "Housing", "University Systems", "Email Templates", "Mental Health", "Study Skills"];

  return (
    <PageLayout title="Admin">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-4">
        {TABS.map(tab_ => (
          <button key={tab_.key} onClick={() => setTab(tab_.key)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              tab === tab_.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
            {tab_.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center py-10 text-sm text-muted-foreground">{t('common_loading')}</p> : (
        <>
          {tab === 'teachers' && (
            <div className="space-y-3">
              {pendingTeachers.length === 0 ? <EmptyAdmin emoji="✅" msg="No pending tutors." /> : pendingTeachers.map(tutor => (
                <div key={tutor.id} className="bg-card border border-border rounded-lg p-3">
                  <p className="font-semibold text-sm text-foreground">{tutor.display_name}</p>
                  <div className="flex flex-wrap gap-1 my-1">{(tutor.subjects || []).map(s => <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>)}</div>
                  {tutor.bio && <p className="text-xs text-muted-foreground line-clamp-2">{tutor.bio}</p>}
                  {tutor.phone_number && <p className="text-xs text-muted-foreground">📱 {tutor.phone_number}</p>}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => approveTeacher(tutor.id)}><Check className="w-3 h-3" />Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive border-destructive/30" onClick={() => rejectTeacher(tutor.id)}><X className="w-3 h-3" />Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'guides' && (
            <div>
              <Button size="sm" className="mb-3 gap-1.5 w-full" onClick={() => { setEditingGuide(null); setShowGuideForm(true); }}>
                <Plus className="w-3.5 h-3.5" /> Create Guide
              </Button>
              {showGuideForm && (
                <GuideFormModal guide={editingGuide} universities={universities} categories={GUIDE_CATEGORIES} onClose={() => setShowGuideForm(false)}
                  onSaved={(g) => { setGuides(p => editingGuide ? p.map(x => x.id === g.id ? g : x) : [...p, g]); setShowGuideForm(false); }} />
              )}
              <div className="space-y-2">
                {guides.map(g => (
                  <div key={g.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{g.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs font-semibold", g.is_published ? "text-success" : "text-muted-foreground")}>{g.is_published ? 'Live' : 'Draft'}</span>
                      <button onClick={() => togglePublish(g)} className="text-muted-foreground hover:text-foreground">
                        {g.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditingGuide(g); setShowGuideForm(true); }} className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-2">
              {reports.filter(r => r.status === 'open').length === 0 ? <EmptyAdmin emoji="📭" msg="No open reports." /> : reports.filter(r => r.status === 'open').map(r => (
                <div key={r.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded">{r.target_type}</span>
                    <span className="text-xs text-muted-foreground">{r.reason}</span>
                  </div>
                  {r.details && <p className="text-sm text-foreground">{r.details}</p>}
                  <Button size="sm" className="mt-2 gap-1" onClick={() => resolveReport(r.id)}><Check className="w-3 h-3" />Resolve</Button>
                </div>
              ))}
            </div>
          )}

          {tab === 'helpers' && (
            <div className="space-y-2">
              {helpers.length === 0 ? <EmptyAdmin emoji="🤝" msg="No peer helpers yet." /> : helpers.map(h => (
                <div key={h.id} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-sm font-semibold">{h.display_name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">{(h.help_topics || []).map(t => <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded">{t}</span>)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs font-semibold", h.is_visible ? "text-success" : "text-muted-foreground")}>{h.is_visible ? 'Visible' : 'Hidden'}</span>
                    <span className={cn("text-xs font-semibold", h.moderation_status === 'ok' ? "text-success" : "text-warning")}>{h.moderation_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'feedback' && (
            <div className="space-y-2">
              {feedbacks.length === 0 ? <EmptyAdmin emoji="📊" msg="No feedback yet." /> : feedbacks.map(f => (
                <div key={f.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{f.feedback_type}</span>
                    {f.rating && <span className="text-xs text-muted-foreground">{'⭐'.repeat(f.rating)}</span>}
                  </div>
                  <p className="text-sm text-foreground">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

function EmptyAdmin({ emoji, msg }) {
  return <div className="text-center py-10"><p className="text-2xl mb-2">{emoji}</p><p className="text-sm text-muted-foreground">{msg}</p></div>;
}

function GuideFormModal({ guide, universities, categories, onClose, onSaved }) {
  const [form, setForm] = useState(guide || { title: '', category: 'First Week', situation: '', content: '', what_to_do: '', who_to_contact: '', university_id: '', source_url: '', is_published: true });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const saved = guide ? await base44.entities.Guide.update(guide.id, form) : await base44.entities.Guide.create(form);
    onSaved(saved);
  };

  return (
    <div className="mb-4 p-4 rounded-lg border border-border bg-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{guide ? 'Edit Guide' : 'Create Guide'}</h3>
        <button onClick={onClose} className="text-muted-foreground">✕</button>
      </div>
      <div className="space-y-2">
        <Input className="text-sm" placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <Textarea className="text-sm resize-none" rows={2} placeholder="Situation" value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))} />
        <Textarea className="text-sm resize-none" rows={4} placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        <Textarea className="text-sm resize-none" rows={3} placeholder="What to do" value={form.what_to_do} onChange={e => setForm(f => ({ ...f, what_to_do: e.target.value }))} />
        <Input className="text-sm" placeholder="Who to contact" value={form.who_to_contact} onChange={e => setForm(f => ({ ...f, who_to_contact: e.target.value }))} />
        <Input className="text-sm" placeholder="Official source URL" value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} />
        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground" value={form.university_id} onChange={e => setForm(f => ({ ...f, university_id: e.target.value }))}>
          <option value="">Universal</option>
          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4" /><span className="text-sm">Published</span></label>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" disabled={!form.title || saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save'}</Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}