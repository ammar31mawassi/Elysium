import { normalizeOptionName } from "@/lib/onboardingOptions";

const sports = new Set(["football", "basketball", "running", "gym", "hiking"]);
const games = new Set(["board games", "gaming", "chess"]);

export function categoryForInterest(name = "") {
  const normalized = normalizeOptionName(name);
  if (sports.has(normalized)) return "sports";
  if (games.has(normalized)) return "gaming";
  if (normalized === "music") return "music";
  if (normalized === "volunteering") return "volunteering";
  return "social";
}

export function buildCourseOptions(...collections) {
  const courses = new Map();
  collections.flat(Infinity).filter(Boolean).forEach((item) => {
    const name = typeof item === "string" ? item : item.course_name;
    const trimmed = name?.trim();
    if (trimmed) courses.set(normalizeOptionName(trimmed), trimmed);
  });
  return [...courses.values()].sort((a, b) => a.localeCompare(b)).map((course) => ({
    value: course,
    label: course,
  }));
}
