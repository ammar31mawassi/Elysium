import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CategoryBadge from "./CategoryBadge";

export default function GuideCard({ guide }) {
  return (
    <Link to={`/guides/${guide.id}`} className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-teal/20 transition-all duration-200 group">
      <CategoryBadge category={guide.category} />
      <h3 className="font-semibold text-charcoal mt-2 mb-1 leading-snug group-hover:text-teal transition-colors">
        {guide.title}
      </h3>
      {guide.situation && (
        <p className="text-slate text-sm line-clamp-2 mb-3">{guide.situation}</p>
      )}
      <div className="flex items-center text-teal text-sm font-medium gap-1">
        Read guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}