import React, { useState } from "react";
import { getInitials } from "@/lib/elysium";

export default function MentorCard({ mentor, universities, faculties }) {
  const [expanded, setExpanded] = useState(false);
  const uni = universities.find(u => u.id === mentor.university_id);
  const fac = faculties.find(f => f.id === mentor.faculty_id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-teal-muted flex items-center justify-center shrink-0">
          <span className="text-teal font-bold text-sm">{getInitials(mentor.display_name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal">{mentor.display_name}</p>
          <p className="text-xs text-slate mt-0.5">
            {[uni?.name, fac?.name, mentor.academic_year].filter(Boolean).join(" · ")}
          </p>
          {mentor.languages?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {mentor.languages.map(l => (
                <span key={l} className="px-2 py-0.5 bg-teal-muted text-teal text-xs rounded-full border border-teal/20">{l}</span>
              ))}
            </div>
          )}
          {mentor.topics?.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {mentor.topics.map(t => (
                <span key={t} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {mentor.bio && (
        <div className="mt-3 border-t border-gray-50 pt-3">
          <p className={`text-sm text-slate leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>{mentor.bio}</p>
          {mentor.bio.length > 100 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-teal mt-1 font-medium">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {mentor.contact_method && (
        <div className="mt-3">
          <button
            className="w-full py-2 rounded-xl bg-teal-muted border border-teal/20 text-teal text-sm font-medium hover:bg-teal hover:text-white transition-all"
            onClick={() => alert(`Connect with ${mentor.display_name}:\n${mentor.contact_method}`)}
          >
            Connect →
          </button>
        </div>
      )}
    </div>
  );
}