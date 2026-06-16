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

export async function fetchCourseCatalogRecords(base44, { universityId, limit = 1000 }) {
  if (!universityId) return [];
  const [filtered, listed] = await Promise.all([
    base44.entities.CourseCatalog.filter({ university_id: universityId }).catch(() => []),
    base44.entities.CourseCatalog.list("-created_date", limit).catch(() => []),
  ]);
  const records = new Map();
  [...(filtered || []), ...(listed || []).filter((item) => item.university_id === universityId)].forEach((item) => {
    const key = item.id || `${item.university_id}:${item.normalized_key || courseCatalogKey(item.name)}`;
    if (key && !records.has(key)) records.set(key, item);
  });
  return [...records.values()];
}

export async function fetchCourseCatalogSuggestions(base44, { universityId, limit = 1000 }) {
  const records = await fetchCourseCatalogRecords(base44, { universityId, limit });
  return mergeCourseSuggestions(records);
}

export async function registerCourses(base44, { universityId, userId, courses }) {
  if (!universityId || !userId) return [];
  const names = mergeCourseSuggestions(courses);
  if (!names.length) return [];
  const existing = await fetchCourseCatalogRecords(base44, { universityId });
  const existingKeys = new Set((existing || []).map((course) => course.normalized_key || courseCatalogKey(course.name)));
  const missing = names.filter((name) => !existingKeys.has(courseCatalogKey(name)));
  return Promise.all(missing.map((name) => base44.entities.CourseCatalog.create({
    university_id: universityId,
    name,
    normalized_key: courseCatalogKey(name),
    created_by: userId,
  })));
}
