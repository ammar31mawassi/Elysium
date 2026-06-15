export function normalizeCourseName(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

export function courseCatalogKey(value = "") {
  return normalizeCourseName(value).toLocaleLowerCase("en");
}

export function mergeCourseSuggestions(...sources) {
  const courses = new Map();
  sources.flat().forEach((item) => {
    const name = normalizeCourseName(typeof item === "string" ? item : item?.name || item?.course_name);
    if (name) courses.set(courseCatalogKey(name), name);
  });
  return [...courses.values()].sort((a, b) => a.localeCompare(b));
}

export async function registerCourses(base44, { universityId, userId, courses }) {
  if (!universityId || !userId) return [];
  const names = mergeCourseSuggestions(courses);
  if (!names.length) return [];
  const existing = await base44.entities.CourseCatalog.filter({ university_id: universityId });
  const existingKeys = new Set((existing || []).map((course) => course.normalized_key || courseCatalogKey(course.name)));
  const missing = names.filter((name) => !existingKeys.has(courseCatalogKey(name)));
  return Promise.all(missing.map((name) => base44.entities.CourseCatalog.create({
    university_id: universityId,
    name,
    normalized_key: courseCatalogKey(name),
    created_by: userId,
  })));
}
