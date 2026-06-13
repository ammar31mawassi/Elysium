import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function StudyGroupCard({ group, universities, faculties, isMember, onJoin, onLeave, userId }) {
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ location: "", session_date: "", notes: "", max_spots: 10 });
  const [savingSession, setSavingSession] = useState(false);

  const uni = universities.find(u => u.id === group.university_id);
  const fac = faculties.find(f => f.id === group.faculty_id);

  useEffect(() => {
    if (expanded) {
      base44.entities.StudySession.filter({ group_id: group.id }).then(setSessions);
    }
  }, [expanded, group.id]);

  const addSession = async () => {
    setSavingSession(true);
    const s = await base44.entities.StudySession.create({ ...sessionForm, group_id: group.id });
    setSessions(prev => [...prev, s]);
    setShowSessionForm(false);
    setSavingSession(false);
    setSessionForm({ location: "", session_date: "", notes: "", max_spots: 10 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-charcoal">{group.name}</p>
              {group.is_general_skills && (
                <span className="px-2 py-0.5 bg-amber-muted text-amber text-xs rounded-full border border-amber/30">General Skills</span>
              )}
            </div>
            {group.course_name && <p className="text-xs text-slate mt-0.5">{group.course_name}</p>}
            <p className="text-xs text-slate mt-0.5">
              {[uni?.name, fac?.name, group.preferred_language].filter(Boolean).join(" · ")}
            </p>
            {group.description && <p className="text-sm text-slate mt-2 line-clamp-2">{group.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate hover:text-teal flex items-center gap-1">
            <Users className="w-3 h-3" /> {isMember ? "View sessions" : "See more"}
          </button>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-slate">Max {group.max_members} members</span>
          <div className="ml-auto">
            {isMember ? (
              <button onClick={() => onLeave(group.id)} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all">
                Leave
              </button>
            ) : (
              <button onClick={() => onJoin(group.id)} className="text-xs text-teal border border-teal/30 bg-teal-muted px-3 py-1.5 rounded-xl hover:bg-teal hover:text-white transition-all font-medium">
                + Join
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide">Study Sessions</p>
            {isMember && (
              <button onClick={() => setShowSessionForm(!showSessionForm)} className="flex items-center gap-1 text-xs text-teal font-medium">
                <Plus className="w-3 h-3" /> Add session
              </button>
            )}
          </div>

          {showSessionForm && (
            <div className="bg-ivory rounded-xl p-3 mb-3 space-y-2">
              <Input type="datetime-local" value={sessionForm.session_date} onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))} className="text-xs" />
              <Input value={sessionForm.location} onChange={e => setSessionForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="text-xs" />
              <Textarea value={sessionForm.notes} onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="text-xs resize-none" />
              <div className="flex gap-2">
                <Button size="sm" className="bg-teal text-white text-xs flex-1" disabled={!sessionForm.session_date || savingSession} onClick={addSession}>
                  {savingSession ? "Adding..." : "Add"}
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowSessionForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {sessions.length === 0 ? (
            <p className="text-xs text-slate text-center py-2">No sessions scheduled yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="flex items-start gap-2 bg-ivory rounded-xl p-3">
                  <Calendar className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-charcoal">{s.session_date ? format(new Date(s.session_date), "EEE, MMM d · HH:mm") : "TBD"}</p>
                    {s.location && <p className="text-xs text-slate flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.location}</p>}
                    {s.notes && <p className="text-xs text-slate mt-0.5">{s.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
