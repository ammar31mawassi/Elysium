import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit2, Eye, EyeOff, Plus, ShieldAlert, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const guideCategories = ["First Week", "Course Registration", "Exams & Appeals", "Scholarships", "Student Rights", "Housing", "University Systems", "Email Templates", "Mental Health", "Study Skills"];

function safeQuery(promise) {
  return promise.catch(() => []);
}

export default function AdminPage() {
  const { user } = useProfile();
  const navigate = useNavigate();
  const [tab, setTab] = useState("tutors");
  const [data, setData] = useState({ tutors: [], helpers: [], events: [], sessions: [], guides: [], reports: [], universities: [] });
  const [loading, setLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState(null);
  const [showGuideForm, setShowGuideForm] = useState(false);

  useEffect(() => { if (user && user.role !== "admin") navigate("/"); }, [user, navigate]);
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    Promise.all([
      safeQuery(base44.entities.PrivateTeacher.list()),
      safeQuery(base44.entities.PeerHelper.list()),
      safeQuery(base44.entities.SocialEvent.list()),
      safeQuery(base44.entities.StudySession.list()),
      safeQuery(base44.entities.Guide.list()),
      safeQuery(base44.entities.Report.list()),
      safeQuery(base44.entities.University.list()),
    ]).then(([tutors, helpers, events, sessions, guides, reports, universities]) => {
      setData({ tutors, helpers, events, sessions, guides, reports, universities });
      setLoading(false);
    });
  }, [user]);

  if (!user || user.role !== "admin") return <PageLayout><div className="flex flex-col items-center justify-center py-20 text-center"><ShieldAlert className="mb-3 h-10 w-10 text-destructive" /><p className="font-semibold text-foreground">Access denied</p><p className="mt-1 text-sm text-muted-foreground">This area is restricted to administrators.</p></div></PageLayout>;

  const updateTutor = async (tutor, approved) => {
    const changes = approved ? { is_approved: true, is_active: true, moderation_status: "approved" } : { is_approved: false, is_active: false, moderation_status: "suspended" };
    await base44.entities.PrivateTeacher.update(tutor.id, changes);
    setData((current) => ({ ...current, tutors: current.tutors.map((item) => item.id === tutor.id ? { ...item, ...changes } : item) }));
  };
  const updateHelper = async (helper, allowed) => {
    const changes = allowed ? { moderation_status: "ok", is_visible: true } : { moderation_status: "suspended", is_visible: false };
    await base44.entities.PeerHelper.update(helper.id, changes);
    setData((current) => ({ ...current, helpers: current.helpers.map((item) => item.id === helper.id ? { ...item, ...changes } : item) }));
  };
  const cancelActivity = async (type, item) => {
    const entity = type === "event" ? base44.entities.SocialEvent : base44.entities.StudySession;
    const changes = type === "event" ? { status: "canceled", is_open: false } : { status: "canceled" };
    await entity.update(item.id, changes);
    setData((current) => ({ ...current, [type === "event" ? "events" : "sessions"]: current[type === "event" ? "events" : "sessions"].map((row) => row.id === item.id ? { ...row, ...changes } : row) }));
  };
  const toggleGuide = async (guide) => {
    await base44.entities.Guide.update(guide.id, { is_published: !guide.is_published });
    setData((current) => ({ ...current, guides: current.guides.map((item) => item.id === guide.id ? { ...item, is_published: !item.is_published } : item) }));
  };
  const resolveReport = async (report) => {
    await base44.entities.Report.update(report.id, { status: "resolved" });
    setData((current) => ({ ...current, reports: current.reports.map((item) => item.id === report.id ? { ...item, status: "resolved" } : item) }));
  };

  const pendingTutors = data.tutors.filter((item) => item.moderation_status === "pending" || !item.is_approved);
  const openReports = data.reports.filter((item) => item.status === "open");
  const tabs = [["tutors", `Tutors (${pendingTutors.length})`], ["helpers", "Peer helpers"], ["activity", "Activities"], ["guides", "Guides"], ["reports", `Reports (${openReports.length})`]];

  return <PageLayout wide>
    <header className="mb-5"><h1 className="text-2xl font-bold text-foreground">Admin</h1><p className="mt-1 text-sm text-muted-foreground">Moderation, approvals and source-backed campus content.</p></header>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cn("min-h-10 shrink-0 rounded-md border px-3 text-xs font-semibold", tab === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>{label}</button>)}</div>
    {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p> : <>
      {tab === "tutors" && <AdminList empty="No pending tutor applications.">{pendingTutors.map((tutor) => <AdminCard key={tutor.id} title={tutor.display_name} subtitle={(tutor.subjects || []).join(", ")} body={`${tutor.teaching_mode || "both"} · ${(tutor.languages || []).join(", ")}`}><Button size="sm" onClick={() => updateTutor(tutor, true)}><Check className="me-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => updateTutor(tutor, false)}><X className="me-1 h-4 w-4" />Reject</Button></AdminCard>)}</AdminList>}
      {tab === "helpers" && <AdminList empty="No peer helpers.">{data.helpers.map((helper) => <AdminCard key={helper.id} title={helper.display_name} subtitle={(helper.help_topics || []).join(", ")} body={`${helper.moderation_status} · ${helper.is_visible ? "visible" : "hidden"}`}><Button size="sm" onClick={() => updateHelper(helper, true)}>Allow</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => updateHelper(helper, false)}>Suspend</Button></AdminCard>)}</AdminList>}
      {tab === "activity" && <div className="space-y-5"><div><h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Social activities</h2><AdminList empty="No activities.">{data.events.map((event) => <AdminCard key={event.id} title={event.title} subtitle={`${event.date} · ${event.location || "No location"}`} body={event.status}><Button size="sm" variant="outline" disabled={event.status === "canceled"} onClick={() => cancelActivity("event", event)}>Cancel</Button></AdminCard>)}</AdminList></div><div><h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Study groups</h2><AdminList empty="No study groups.">{data.sessions.map((session) => <AdminCard key={session.id} title={session.title} subtitle={new Date(session.session_date).toLocaleString()} body={session.status}><Button size="sm" variant="outline" disabled={session.status === "canceled"} onClick={() => cancelActivity("session", session)}>Cancel</Button></AdminCard>)}</AdminList></div></div>}
      {tab === "guides" && <div><Button className="mb-3 w-full gap-2 sm:w-auto" onClick={() => { setEditingGuide(null); setShowGuideForm(true); }}><Plus className="h-4 w-4" />Create guide</Button>{showGuideForm && <GuideForm guide={editingGuide} universities={data.universities} onClose={() => setShowGuideForm(false)} onSaved={(guide) => { setData((current) => ({ ...current, guides: editingGuide ? current.guides.map((item) => item.id === guide.id ? guide : item) : [guide, ...current.guides] })); setShowGuideForm(false); }} />}<AdminList empty="No guides.">{data.guides.map((guide) => <AdminCard key={guide.id} title={guide.title} subtitle={`${guide.category} · reviewed ${guide.last_reviewed_date || "not set"}`} body={guide.is_published ? "Published" : "Draft"}><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => toggleGuide(guide)} aria-label={guide.is_published ? "Unpublish" : "Publish"}>{guide.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => { setEditingGuide(guide); setShowGuideForm(true); }} aria-label="Edit guide"><Edit2 className="h-4 w-4" /></button></AdminCard>)}</AdminList></div>}
      {tab === "reports" && <AdminList empty="No open reports.">{openReports.map((report) => <AdminCard key={report.id} title={`${report.target_type}: ${report.reason}`} subtitle={report.details} body="Open"><Button size="sm" onClick={() => resolveReport(report)}><Check className="me-1 h-4 w-4" />Resolve</Button></AdminCard>)}</AdminList>}
    </>}
  </PageLayout>;
}

function AdminList({ empty, children }) {
  return React.Children.count(children) ? <div className="space-y-2">{children}</div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{empty}</div>;
}

function AdminCard({ title, subtitle, body, children }) {
  return <article className="rounded-lg border border-border bg-card p-4" dir="auto"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}{body && <p className="mt-1 text-xs font-medium text-primary">{body}</p>}</div><div className="flex gap-2">{children}</div></div></article>;
}

function GuideForm({ guide, universities, onClose, onSaved }) {
  const [form, setForm] = useState(guide || { title: "", title_he: "", title_ar: "", category: "First Week", situation: "", situation_he: "", situation_ar: "", content: "", content_he: "", content_ar: "", what_to_do: "", what_to_do_he: "", what_to_do_ar: "", who_to_contact: "", university_id: "", source_url: "", source_label: "", last_reviewed_date: new Date().toISOString().slice(0, 10), is_published: true });
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); const saved = guide ? await base44.entities.Guide.update(guide.id, form) : await base44.entities.Guide.create(form); onSaved(saved); };
  return <section className="mb-4 rounded-lg border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{guide ? "Edit guide" : "Create guide"}</h2><button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button></div><div className="grid gap-3 md:grid-cols-3"><Input placeholder="English title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /><Input dir="rtl" placeholder="Hebrew title" value={form.title_he} onChange={(event) => setForm((current) => ({ ...current, title_he: event.target.value }))} /><Input dir="rtl" placeholder="Arabic title" value={form.title_ar} onChange={(event) => setForm((current) => ({ ...current, title_ar: event.target.value }))} /></div><div className="mt-3 grid gap-3 md:grid-cols-3"><Textarea rows={3} placeholder="English explanation" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} /><Textarea dir="rtl" rows={3} placeholder="Hebrew explanation" value={form.content_he} onChange={(event) => setForm((current) => ({ ...current, content_he: event.target.value }))} /><Textarea dir="rtl" rows={3} placeholder="Arabic explanation" value={form.content_ar} onChange={(event) => setForm((current) => ({ ...current, content_ar: event.target.value }))} /></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{guideCategories.map((category) => <option key={category}>{category}</option>)}</select><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.university_id} onChange={(event) => setForm((current) => ({ ...current, university_id: event.target.value }))}><option value="">All universities</option>{universities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</select><Input type="date" value={form.last_reviewed_date} onChange={(event) => setForm((current) => ({ ...current, last_reviewed_date: event.target.value }))} /><Input placeholder="Official source URL" value={form.source_url} onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))} /></div><div className="mt-3 flex gap-2"><Button disabled={saving || !form.title} onClick={save}>{saving ? "Saving..." : "Save guide"}</Button><Button variant="outline" onClick={onClose}>Cancel</Button></div></section>;
}
