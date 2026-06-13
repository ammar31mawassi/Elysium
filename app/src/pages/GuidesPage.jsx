import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GUIDE_CATEGORIES } from "@/lib/elysium";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopHeader from "@/components/elysium/TopHeader";
import BottomNav from "@/components/elysium/BottomNav";
import GuideCard from "@/components/elysium/GuideCard";
import EmptyState from "@/components/elysium/EmptyState";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeUni, setActiveUni] = useState("all");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const [g, u, profiles] = await Promise.all([
        base44.entities.Guide.filter({ is_published: true }),
        base44.entities.University.list(),
        base44.entities.StudentProfile.filter({ user_id: user.id }),
      ]);
      setGuides(g);
      setUniversities(u);
      if (profiles.length) {
        setProfile(profiles[0]);
        // Pre-filter to user's university
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("university")) setActiveUni(urlParams.get("university"));
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = guides.filter(g => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchUni = activeUni === "all" || !g.university_id || g.university_id === activeUni;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || (g.situation || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchUni && matchSearch;
  });

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <TopHeader subtitle="Guide Library" />

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
          <Input
            className="pl-9 bg-white border-gray-200 rounded-xl"
            placeholder="Search guides..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {["All", ...GUIDE_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-teal text-white border-teal"
                  : "bg-white text-slate border-gray-200 hover:border-teal/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* University filter */}
        {universities.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setActiveUni("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeUni === "all" ? "bg-charcoal text-white border-charcoal" : "bg-white text-slate border-gray-200 hover:border-gray-400"
              }`}
            >
              All universities
            </button>
            {universities.map(u => (
              <button
                key={u.id}
                onClick={() => setActiveUni(u.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeUni === u.id ? "bg-charcoal text-white border-charcoal" : "bg-white text-slate border-gray-200 hover:border-gray-400"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="No guides found"
            message="Try a different search or category — we're always adding more."
          />
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map(g => <GuideCard key={g.id} guide={g} />)}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}