function cleanName(value = "") {
  return value.trim().replace(/\s+/g, " ");
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
      grade: course?.grade ?? "",
      credits: course?.credits ?? "",
    });
  });
  return [...courses.values()];
}

export function activeCourseNames(profile) {
  return normalizeCourseRecords(profile)
    .filter((course) => course.status === "active")
    .map((course) => course.name);
}

export function courseProfileUpdate(courseRecords) {
  const normalized = normalizeCourseRecords({ course_records: courseRecords });
  const persisted = normalized.map((course) => {
    const next = { name: course.name, status: course.status };
    if (course.grade !== "" && Number.isFinite(Number(course.grade))) next.grade = Number(course.grade);
    if (course.credits !== "" && Number.isFinite(Number(course.credits))) next.credits = Number(course.credits);
    return next;
  });
  return {
    course_records: persisted,
    courses: persisted.map((course) => course.name),
  };
}
