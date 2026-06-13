import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TopHeader from "@/components/elysium/TopHeader";
import BottomNav from "@/components/elysium/BottomNav";
import EmptyState from "@/components/elysium/EmptyState";
import MentorCard from "@/components/elysium/MentorCard";
import StudyGroupCard from "@/components/elysium/StudyGroupCard";
import { cn } from "@/lib/utils";

export default function PeoplePage() {
  const [tab, setTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showMentorForm, setShowMentorForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [m, g, unis, facs, profiles, mems] = await Promise.all([
        base44.entities.Mentor.filter({ is_approved: true, is_active: true }),
        base44.entities.StudyGroup.filter({ is_active: true }),
        base44.entities.University.list(),
        base44.entities.Faculty.list(),
        base44.entities.StudentProfile.filter({ user_id: u.id }),
        base44.entities.StudyGroupMember.filter({ user_id: u.id }),
      ]);
      setMentors(m);
      setGroups(g);
      setUniversities(unis);
      setFaculties(facs);
      setMemberships(mems);
      if (profiles.length) setProfile(profiles[0]);
      setLoading(false);
    };
    load();
  }, []);

  const handleJoinGroup = async (groupId) => {
    const m = await base44.entities.StudyGroupMember.create({ group_id: groupId, user_id: user.id, role: "Member" });
    setMemberships(prev => [...prev, m]);
  };

  const handleLeaveGroup = async (groupId) => {
    const mem = memberships.find(m => m.group_id === groupId);
    if (mem) {
      await base44.entities.StudyGroupMember.delete(mem.id);
      setMemberships(prev => prev.filter(m => m.group_id !== groupId));
    }
  };

  const memberGroupIds = new Set(memberships.map(m => m.group_id));

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <TopHeader subtitle="Mentors & Study Groups" />

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 mb-5">
          {["mentors", "groups"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                tab === t ? "bg-teal text-white shadow-sm" : "text-slate hover:text-charcoal"
              )}
            >
              {t === "mentors" ? "👥 Mentors" : "📖 Study Groups"}
            </button>
          ))}
        </div>

        {tab === "mentors" && (
          <>
            <Button
              className="w-full mb-4 bg-teal hover:bg-teal-dark text-white gap-2"
              onClick={() => setShowMentorForm(true)}
            >
              <Plus className="w-4 h-4" /> Become a Mentor
            </Button>

            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />)}</div>
            ) : mentors.length === 0 ? (
              <EmptyState emoji="🤝" title="No mentors yet" message="Be the first to offer guidance — become a mentor and help fellow students navigate university life." />
            ) : (
              <div className="space-y-3">
                {mentors.map(m => <MentorCard key={m.id} mentor={m} universities={universities} faculties={faculties} />)}
              </div>
            )}
          </>
        )}

        {tab === "groups" && (
          <>
            <Button
              className="w-full mb-4 bg-teal hover:bg-teal-dark text-white gap-2"
              onClick={() => setShowGroupForm(true)}
            >
              <Plus className="w-4 h-4" /> Create a Study Group
            </Button>

            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}</div>
            ) : groups.length === 0 ? (
              <EmptyState emoji="📚" title="No study groups yet" message="Create the first one for your course — other students are probably looking too." />
            ) : (
              <div className="space-y-3">
                {groups.map(g => (
                  <StudyGroupCard
                    key={g.id}
                    group={g}
                    universities={universities}
                    faculties={faculties}
                    isMember={memberGroupIds.has(g.id)}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    userId={user?.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showMentorForm && (
        <MentorForm
          user={user}
          universities={universities}
          faculties={faculties}
          onClose={() => setShowMentorForm(false)}
        />
      )}

      {showGroupForm && (
        <GroupForm
          user={user}
          universities={universities}
          faculties={faculties}
          profile={profile}
          onClose={() => setShowGroupForm(false)}
          onCreated={(g) => { setGroups(prev => [...prev, g]); setShowGroupForm(false); }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function MentorForm({ user, universities, faculties, onClose }) {
  const [form, setForm] = useState({ display_name: "", university_id: "", faculty_id: "", academic_year: "", languages: [], topics: [], bio: "", contact_method: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggleArr = (field, val) => setForm(f => ({
    ...f,
    [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val]
  }));

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.Mentor.create({ ...form, user_id: user.id, is_approved: false, is_active: true });
    setSaving(false);
    setDone(true);
  };

  return (
    <Modal title="Become a Mentor" onClose={onClose}>
      {done ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-3">🎉</p>
          <p className="font-bold text-charcoal">Application submitted!</p>
          <p className="text-slate text-sm mt-1">We'll review and approve you shortly.</p>
          <Button className="mt-4 bg-teal hover:bg-teal-dark text-white" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Full name">
            <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Your name" />
          </Field>
          <Field label="University">
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.university_id} onChange={e => setForm(f => ({ ...f, university_id: e.target.value }))}>
              <option value="">Select university</option>
              {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Year of study">
            <Input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="e.g. 3rd Year" />
          </Field>
          <Field label="Languages you can help in">
            <div className="flex gap-2 flex-wrap">
              {["Hebrew", "Arabic", "English"].map(l => (
                <Chip key={l} selected={form.languages.includes(l)} onClick={() => toggleArr("languages", l)}>{l}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Topics you can help with">
            <div className="flex gap-2 flex-wrap">
              {["Scholarships", "Exams", "Study Skills", "Housing", "Rights", "Career", "Social"].map(t => (
                <Chip key={t} selected={form.topics.includes(t)} onClick={() => toggleArr("topics", t)}>{t}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Short bio">
            <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell students a little about yourself and your experience..." rows={3} className="text-sm resize-none" />
          </Field>
          <Field label="Contact method">
            <Input value={form.contact_method} onChange={e => setForm(f => ({ ...f, contact_method: e.target.value }))} placeholder="e.g. WhatsApp +972..." />
          </Field>
          <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={saving || !form.display_name} onClick={handleSubmit}>
            {saving ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function GroupForm({ user, universities, faculties, profile, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "", university_id: profile?.university_id || "", faculty_id: profile?.faculty_id || "",
    course_name: "", description: "", max_members: 10, preferred_language: "English", is_general_skills: false
  });
  const [saving, setSaving] = useState(false);

  const filteredFaculties = faculties.filter(f => f.university_id === form.university_id);

  const handleSubmit = async () => {
    setSaving(true);
    const g = await base44.entities.StudyGroup.create({ ...form, is_active: true, created_by: user.id });
    await base44.entities.StudyGroupMember.create({ group_id: g.id, user_id: user.id, role: "Leader" });
    onCreated(g);
  };

  return (
    <Modal title="Create a Study Group" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Group name *">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Calculus 2 study group" />
        </Field>
        <Field label="University *">
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.university_id} onChange={e => setForm(f => ({ ...f, university_id: e.target.value }))}>
            <option value="">Select university</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="Faculty (optional)">
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.faculty_id} onChange={e => setForm(f => ({ ...f, faculty_id: e.target.value }))}>
            <option value="">Any faculty</option>
            {filteredFaculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Course name">
          <Input value={form.course_name} onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))} placeholder="e.g. Introduction to Statistics" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="text-sm resize-none" placeholder="What is this group for?" />
        </Field>
        <Field label="Preferred language">
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
            <option>English</option><option>Hebrew</option><option>Arabic</option>
          </select>
        </Field>
        <Field label="Max members">
          <Input type="number" value={form.max_members} onChange={e => setForm(f => ({ ...f, max_members: +e.target.value }))} min={2} max={50} />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_general_skills} onChange={e => setForm(f => ({ ...f, is_general_skills: e.target.checked }))} className="w-4 h-4 rounded accent-teal" />
          <span className="text-sm text-charcoal">Open to all students (General Skills group)</span>
        </label>
        <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={saving || !form.name || !form.university_id} onClick={handleSubmit}>
          {saving ? "Creating..." : "Create group"}
        </Button>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="font-bold text-charcoal">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate" /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate mb-1.5 uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", selected ? "bg-teal text-white border-teal" : "bg-white text-slate border-gray-200 hover:border-teal/40")}>
      {children}
    </button>
  );
}
