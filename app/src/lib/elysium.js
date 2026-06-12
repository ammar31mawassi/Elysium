// ELYSIUM design constants

export const CATEGORY_CONFIG = {
  "First Week": { color: "bg-teal-muted text-teal border-teal/20", emoji: "🏫" },
  "Course Registration": { color: "bg-blue-50 text-blue-600 border-blue-200", emoji: "📋" },
  "Exams & Appeals": { color: "bg-purple-50 text-purple-600 border-purple-200", emoji: "📝" },
  "Scholarships": { color: "bg-amber-muted text-amber border-amber/30", emoji: "💰" },
  "Student Rights": { color: "bg-green-50 text-green-600 border-green-200", emoji: "⚖️" },
  "Housing": { color: "bg-orange-50 text-orange-600 border-orange-200", emoji: "🏠" },
  "University Systems": { color: "bg-blue-50 text-blue-600 border-blue-200", emoji: "💻" },
  "Email Templates": { color: "bg-teal-muted text-teal border-teal/20", emoji: "📧" },
  "Mental Health": { color: "bg-pink-50 text-pink-600 border-pink-200", emoji: "🧠" },
  "Study Skills": { color: "bg-purple-50 text-purple-600 border-purple-200", emoji: "📚" },
};

export const DEADLINE_CONFIG = {
  "Exam": { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "Scholarship": { color: "bg-amber-muted text-amber-700 border-amber/30", dot: "bg-amber" },
  "Admin": { color: "bg-teal-muted text-teal border-teal/20", dot: "bg-teal" },
  "Personal": { color: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

export const HELP_NEEDS_OPTIONS = [
  "Scholarships",
  "Housing",
  "Exams & Appeals",
  "Student Rights",
  "Study Partners",
  "Mentors",
  "University Bureaucracy",
  "Social & Community",
];

export const ACADEMIC_YEARS = ["Preparatory", "1st Year", "2nd Year", "3rd Year", "4th Year+"];
export const LANGUAGES = ["Hebrew", "Arabic", "English"];
export const LIVING_CONTEXTS = ["Dorms", "Commuting", "Near Campus", "Other"];
export const GUIDE_CATEGORIES = [
  "First Week", "Course Registration", "Exams & Appeals", "Scholarships",
  "Student Rights", "Housing", "University Systems", "Email Templates",
  "Mental Health", "Study Skills"
];

export function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "S";
}