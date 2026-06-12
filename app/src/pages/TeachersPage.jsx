import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { Search, Star, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/layout/PageLayout";
import ElCard from "@/components/ui/ElCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "T";
}

function StarRating({ value = 0, max = 5, size = "sm", onChange }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${i < Math.round(value) ? "text-amber fill-amber" : "text-gray-200"} ${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}

export default function TeachersPage() {
  const { user, profile } = useProfile();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showRateModal, setShowRateModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.university_id) return;
    Promise.all([
      base44.entities.PrivateTeacher.filter({ university_id: profile.university_id, is_active: true }),
      base44.entities.TeacherRating.list(),
    ]).then(([t, r]) => {
      setTeachers(t.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)));
      setRatings(r);
      setLoading(false);
    });
  }, [profile?.university_id]);

  const filtered = teachers.filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return t.display_name?.toLowerCase().includes(s) || t.subjects?.some(subj => subj.toLowerCase().includes(s));
  });

  const getTeacherRatings = (teacherId) => ratings.filter(r => r.teacher_id === teacherId);
  const hasRated = (teacherId) => ratings.some(r => r.teacher_id === teacherId && r.student_id === user?.id);

  const handleRate = async () => {
    setSaving(true);
    await base44.entities.TeacherRating.create({ teacher_id: showRateModal.id, student_id: user.id, ...ratingForm });
    // Update avg
    const allR = [...ratings, { teacher_id: showRateModal.id, rating: ratingForm.rating }];
    const teacherR = allR.filter(r => r.teacher_id === showRateModal.id);
    const avg = teacherR.reduce((s, r) => s + r.rating, 0) / teacherR.length;
    await base44.entities.PrivateTeacher.update(showRateModal.id, { rating_avg: +avg.toFixed(1), rating_count: teacherR.length });
    setTeachers(prev => prev.map(t => t.id === showRateModal.id ? { ...t, rating_avg: +avg.toFixed(1), rating_count: teacherR.length } : t));
    setRatings(prev => [...prev, { teacher_id: showRateModal.id, student_id: user.id, ...ratingForm }]);
    setShowRateModal(null);
    setRatingForm({ rating: 5, comment: "" });
    setSaving(false);
  };

  return (
    <PageLayout>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">{t('nav_tutors')}</h1>
        <p className="text-muted-foreground text-xs mt-0.5">{t('tools_tutor_short')}</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
        <Input className="pl-9 bg-white border-gray-200 rounded-xl" placeholder="Search by subject or name…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="👨‍🏫" title="No tutors yet" message="No private tutors are registered at your university yet. You can offer your own tutoring from your profile page." />
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TeacherCard key={t.id} teacher={t} ratings={getTeacherRatings(t.id)} hasRated={hasRated(t.id)}
              onDetail={() => setSelected(t === selected ? null : t)}
              isExpanded={selected?.id === t.id}
              onRate={() => { setShowRateModal(t); setSelected(null); }}
            />
          ))}
        </div>
      )}

      {/* Rate modal */}
      {showRateModal && (
        <Modal title={`Rate ${showRateModal.display_name}`} onClose={() => setShowRateModal(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Your rating</p>
              <StarRating value={ratingForm.rating} max={5} size="lg" onChange={r => setRatingForm(f => ({ ...f, rating: r }))} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Comment (optional)</p>
              <Textarea value={ratingForm.comment} onChange={e => setRatingForm(f => ({ ...f, comment: e.target.value }))} rows={3} className="text-sm resize-none" placeholder="How was the tutoring?" />
            </div>
            <Button className="w-full bg-teal hover:bg-teal-dark text-white" disabled={saving} onClick={handleRate}>
              {saving ? "Submitting…" : "Submit Rating"}
            </Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function TeacherCard({ teacher, ratings, hasRated, onDetail, isExpanded, onRate }) {
  return (
    <ElCard className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
            <span className="text-teal font-bold text-base">{getInitials(teacher.display_name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1C1C2E]">{teacher.display_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={teacher.rating_avg || 0} />
              <span className="text-xs text-slate">({teacher.rating_count || 0})</span>
            </div>
            {teacher.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {teacher.subjects.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-teal/10 text-teal text-xs rounded-full border border-teal/20 font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {teacher.phone_number && (
              <a href={`https://wa.me/${teacher.phone_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors">
                <Phone className="w-3.5 h-3.5 text-green-600" />
              </a>
            )}
            <button onClick={onDetail} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${isExpanded ? "bg-teal/10 text-teal" : "bg-gray-50 text-slate hover:bg-gray-100"}`}>
              {isExpanded ? "Less" : "More"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
            {teacher.bio && <p className="text-sm text-slate leading-relaxed">{teacher.bio}</p>}
            {teacher.phone_number && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-slate" />
                <span className="text-sm font-medium text-[#1C1C2E]">{teacher.phone_number}</span>
              </div>
            )}
            {ratings.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Recent reviews</p>
                {ratings.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <StarRating value={r.rating} size="sm" />
                    {r.comment && <p className="text-xs text-slate flex-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
            {!hasRated && (
              <Button size="sm" variant="outline" className="w-full border-teal/30 text-teal" onClick={onRate}>⭐ Rate this tutor</Button>
            )}
          </div>
        )}
      </div>
    </ElCard>
  );
}