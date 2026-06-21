function cleanName(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

export const COURSE_SEMESTERS = [
  { value: "semester_a", label: "Semester A", shortLabel: "A" },
  { value: "semester_b", label: "Semester B", shortLabel: "B" },
  { value: "summer", label: "Summer", shortLabel: "Summer" },
  { value: "annual", label: "Annual", shortLabel: "Year" },
  { value: "unassigned", label: "Unassigned", shortLabel: "Other" },
];

const COURSE_SEMESTER_VALUES = new Set(COURSE_SEMESTERS.map((semester) => semester.value));
const COURSE_LIST_SEPARATOR_PATTERN = /[,;\n\u060C]+/;

export function normalizeCourseSemester(value) {
  return COURSE_SEMESTER_VALUES.has(value) ? value : "unassigned";
}

export function normalizeCourseRecords(profile) {
  const records = Array.isArray(profile?.course_records) ? profile.course_records : [];
  const source = records.length
    ? records
    : (profile?.courses || []).map((name) => ({ name, status: "active" }));

  const courses = new Map();
  source.forEach((course) => {
    const name = cleanName(typeof course === "string" ? course : course?.name);
    if (!name) return;
    const key = name.toLocaleLowerCase("en");
    courses.set(key, {
      name,
      status: course?.status === "finished" ? "finished" : "active",
      semester: normalizeCourseSemester(course?.semester),
      grade: course?.grade ?? "",
      credits: course?.credits ?? "",
    });
  });
  return [...courses.values()];
}

export function parseCourseListInput(value = "") {
  return String(value)
    .split(COURSE_LIST_SEPARATOR_PATTERN)
    .map(cleanName)
    .filter(Boolean)
    .map((name) => ({ name, status: "active" }));
}

export function activeCourseNames(profile) {
  return normalizeCourseRecords(profile)
    .filter((course) => course.status === "active")
    .map((course) => course.name);
}

export function courseProfileUpdate(courseRecords) {
  const normalized = normalizeCourseRecords({ course_records: courseRecords });
  const persisted = normalized.map((course) => {
    const next = { name: course.name, status: course.status, semester: normalizeCourseSemester(course.semester) };
    if (course.grade !== "" && Number.isFinite(Number(course.grade))) next.grade = Number(course.grade);
    if (course.credits !== "" && Number.isFinite(Number(course.credits))) next.credits = Number(course.credits);
    return next;
  });
  return {
    course_records: persisted,
    courses: persisted.map((course) => course.name),
  };
}
