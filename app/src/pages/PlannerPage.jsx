import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, isAfter } from "date-fns";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopHeader from "@/components/elysium/TopHeader";
import BottomNav from "@/components/elysium/BottomNav";
import EmptyState from "@/components/elysium/EmptyState";
import { DEADLINE_CONFIG } from "@/lib/elysium";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", due_date: "", category: "Exam", source: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const dl = await base44.entities.Deadline.filter({ user_id: u.id });
      const sorted = [...dl].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
      setDeadlines(sorted);
      setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
    setSaving(true);
    const d = await base44.entities.Deadline.create({ ...form, user_id: user.id });
    setDeadlines(prev => [...prev, d].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")));
    setForm({ title: "", due_date: "", category: "Exam", source: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Deadline.delete(id);
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  const filtered = filter === "All" ? deadlines : deadlines.filter(d => d.category === filter);

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <TopHeader subtitle="Planner" />

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl text-charcoal">Your Deadlines</h1>
          <Button
            size="sm"
            className="bg-teal hover:bg-teal-dark text-white gap-1.5"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {["All", "Exam", "Scholarship", "Admin", "Personal"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                filter === cat ? "bg-teal text-white border-teal" : "bg-white text-slate border-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Deadlines */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="No deadlines yet"
            message="Add your exam dates, scholarship deadlines, and admin tasks so nothing slips through the cracks."
            action={<Button size="sm" className="bg-teal text-white" onClick={() => setShowForm(true)}>Add your first deadline</Button>}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(d => {
              const conf = DEADLINE_CONFIG[d.category] || DEADLINE_CONFIG["Personal"];
              const isPast = d.due_date ? !isAfter(parseISO(d.due_date), new Date()) : false;
              return (
                <div key={d.id} className={cn("bg-white rounded-xl border p-4 flex items-center gap-4 transition-all", conf.color, isPast && "opacity-60")}>
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", conf.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold text-sm", isPast ? "line-through text-slate" : "text-charcoal")}>{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs opacity-70">{d.category}</span>
                      {d.source && <><span className="text-xs opacity-40">·</span><span className="text-xs opacity-70">{d.source}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold">
                      {d.due_date ? format(parseISO(d.due_date), "MMM d") : "—"}
                    </span>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Deadline Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-charcoal">Add Deadline</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate uppercase tracking-wide block mb-1.5">Title</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Calculus final exam" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate uppercase tracking-wide block mb-1.5">Due Date</label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate uppercase tracking-wide block mb-1.5">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Exam", "Scholarship", "Admin", "Personal"].map(cat => {
                    const conf = DEADLINE_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                        className={cn(
                          "py-2 rounded-xl border text-xs font-medium transition-all",
                          form.category === cat ? "ring-2 ring-teal " + conf.color : conf.color
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate uppercase tracking-wide block mb-1.5">Source (optional)</label>
                <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Course syllabus" />
              </div>
            </div>
            <Button
              className="w-full bg-teal hover:bg-teal-dark text-white"
              disabled={!form.title || !form.due_date || saving}
              onClick={handleAdd}
            >
              {saving ? "Adding..." : "Add Deadline"}
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
