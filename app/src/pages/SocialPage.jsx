import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { Plus, MapPin, Clock, Users } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/layout/PageLayout";
import ElCard from "@/components/ui/ElCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

const CATEGORIES = ["gaming", "sports", "music", "study_marathon", "social", "other"];
const CAT_ICONS = { gaming: "🎮", sports: "⚽", music: "🎵", study_marathon: "🏃", social: "👥", other: "✨" };
const CAT_COLORS = { gaming: "bg-purple-50 text-purple-600", sports: "bg-green-50 text-green-600", music: "bg-pink-50 text-pink-600", study_marathon: "bg-teal/10 text-teal", social: "bg-amber/10 text-amber", other: "bg-gray-50 text-slate" };

export default function SocialPage() {
  const location = useLocation();
  const { user, profile } = useProfile();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(new URLSearchParams(location.search).get("create") === "1");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({ title: "", date: "", start_time: "", end_time: "", location: "", category: "social", max_spots: 10, description: "" });
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    setShowCreate(new URLSearchParams(location.search).get("create") === "1");
  }, [location.search]);

  useEffect(() => {
    if (!profile?.university_id) return;
    Promise.all([
      base44.entities.SocialEvent.filter({ university_id: profile.university_id }),
      user?.id ? base44.entities.SocialEventMember.filter({ user_id: user.id }) : [],
    ]).then(([evts, mems]) => {
      setEvents(evts.sort((a, b) => a.date?.localeCompare(b.date)));
      setMemberships(mems);
      setLoading(false);
    });
  }, [profile?.university_id, user?.id]);

  const filtered = filterOpen ? events.filter(e => e.is_open) : events;
  const memberEventIds = new Set(memberships.map(m => m.event_id));

  const handleCreate = async () => {
    setSaving(true);
    const ev = await base44.entities.SocialEvent.create({ ...form, organizer_id: user.id, university_id: profile.university_id, is_open: true });
    setEvents(prev => [ev, ...prev]);
    setShowCreate(false);
    setForm({ title: "", date: "", start_time: "", end_time: "", location: "", category: "social", max_spots: 10, description: "" });
    setSaving(false);
  };

  const handleJoin = async (event) => {
    if (memberEventIds.has(event.id)) return;
    setJoining(true);
    const m = await base44.entities.SocialEventMember.create({ event_id: event.id, user_id: user.id, status: "pending" });
    setMemberships(prev => [...prev, m]);
    setJoining(false);
    setSelected(null);
  };

  const getMemberCount = (eventId) => memberships.filter(m => m.event_id === eventId).length;

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('social_title')}</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{t('social_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(f => !f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterOpen ? "bg-teal text-white border-teal" : "bg-white text-slate border-gray-200"}`}
          >
            {filterOpen ? "Open only ✓" : "All events"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🎉" title="No events yet" message="Be the first to organize something — game nights, campus runs, anything goes!" />
      ) : (
        <div className="space-y-3">
          {filtered.map(ev => (
            <EventCard key={ev.id} event={ev} memberCount={getMemberCount(ev.id)} isMember={memberEventIds.has(ev.id)} onTap={() => setSelected(ev)} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center shadow-lg hover:bg-teal-dark transition-colors z-40"
        style={{ boxShadow: "0 4px 20px rgba(10,112,117,0.4)" }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Event detail modal */}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${CAT_COLORS[selected.category]}`}>
              <span>{CAT_ICONS[selected.category]}</span> {selected.category}
            </div>
            {selected.description && <p className="text-slate text-sm leading-relaxed">{selected.description}</p>}
            <div className="space-y-2">
              <InfoRow icon={<Clock className="w-4 h-4"/>} text={`${selected.date}${selected.start_time ? ` · ${selected.start_time}${selected.end_time ? ` – ${selected.end_time}` : ""}` : ""}`} />
              {selected.location && <InfoRow icon={<MapPin className="w-4 h-4"/>} text={selected.location} />}
              <InfoRow icon={<Users className="w-4 h-4"/>} text={`${getMemberCount(selected.id)} / ${selected.max_spots} spots`} />
            </div>
            <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${selected.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {selected.is_open ? "Open" : "Closed"}
            </div>
            {!memberEventIds.has(selected.id) && selected.is_open && (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={joining} onClick={() => handleJoin(selected)}>
                {joining ? t('common_loading') : t('social_join')}
              </Button>
            )}
            {memberEventIds.has(selected.id) && (
              <div className="w-full py-2.5 rounded-xl bg-teal/10 text-teal text-center text-sm font-semibold">✓ You've joined</div>
            )}
          </div>
        </Modal>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Create Social Event" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <Field label="Event name *"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Campus Game Night" /></Field>
            <Field label="Date *"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start time"><Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></Field>
              <Field label="End time"><Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} /></Field>
            </div>
            <Field label="Location"><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Library, Room 204…" /></Field>
            <Field label="Category">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.category === cat ? "bg-teal text-white border-teal" : "bg-white text-slate border-gray-200"}`}>
                    {CAT_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Max spots"><Input type="number" value={form.max_spots} min={2} max={200} onChange={e => setForm(f => ({ ...f, max_spots: +e.target.value }))} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="text-sm resize-none" placeholder="What's happening?" /></Field>
            <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={!form.title || !form.date || saving} onClick={handleCreate}>
              {saving ? "Creating…" : "Create Event"}
            </Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function EventCard({ event, memberCount, isMember, onTap }) {
  return (
    <ElCard onClick={onTap} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${CAT_COLORS[event.category]}`}>
            {CAT_ICONS[event.category]}
          </div>
          <div>
            <p className="font-semibold text-[#1C1C2E] text-sm">{event.title}</p>
            <p className="text-xs text-slate mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {event.date}{event.start_time ? ` · ${event.start_time}` : ""}
            </p>
            {event.location && <p className="text-xs text-slate mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${event.is_open ? "bg-green-50 text-green-700" : "bg-gray-100 text-slate"}`}>
            {event.is_open ? "Open" : "Closed"}
          </span>
          <span className="text-xs text-slate flex items-center gap-1"><Users className="w-3 h-3" />{memberCount}/{event.max_spots}</span>
          {isMember && <span className="text-[10px] text-teal font-semibold">✓ Joined</span>}
        </div>
      </div>
    </ElCard>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-slate text-sm">
      <span className="text-slate/60">{icon}</span> {text}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}
