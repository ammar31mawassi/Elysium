export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sortByUrgency(items, now = new Date()) {
  return items
    .map((item) => ({ ...item, parsedDate: parseDate(item.date || item.starts_at || item.session_date) }))
    .filter((item) => item.parsedDate && item.parsedDate >= now)
    .sort((a, b) => {
      const priority = { urgent: 0, important: 1, normal: 2 };
      const priorityDelta = (priority[a.priority] ?? 2) - (priority[b.priority] ?? 2);
      return priorityDelta || a.parsedDate - b.parsedDate;
    });
}

export function localizedField(record, field, locale = "en") {
  if (!record) return "";
  if (locale === "he" && record[`${field}_he`]) return record[`${field}_he`];
  if (locale === "ar" && record[`${field}_ar`]) return record[`${field}_ar`];
  return record[field] || "";
}

export function calculateGpa(courses) {
  const valid = courses.filter((course) => Number.isFinite(Number(course.grade)) && Number.isFinite(Number(course.credits)) && Number(course.credits) > 0);
  if (!valid.length) return null;
  const credits = valid.reduce((total, course) => total + Number(course.credits), 0);
  const points = valid.reduce((total, course) => total + Number(course.grade) * Number(course.credits), 0);
  return { average: points / credits, credits };
}

export function calculateRequiredGrade(currentGrade, completedWeight, targetGrade) {
  const current = Number(currentGrade);
  const weight = Number(completedWeight);
  const target = Number(targetGrade);
  if (![current, weight, target].every(Number.isFinite) || weight < 0 || weight >= 100) return null;
  return (target - current * (weight / 100)) / (1 - weight / 100);
}

export function directionForLocale(locale) {
  return locale === "he" || locale === "ar" ? "rtl" : "ltr";
}

export function extractInternalPaths(content = "") {
  const matches = content.match(/\/(?:calendar|discover|tools|social|groups|profile)(?:\?[^\s)\]]+)?/g) || [];
  return [...new Set(matches.map((path) => path.replace(/[.,;:]+$/, "")))];
}

export function isOnboardingStepValid(form, step) {
  if (step === 1) return Boolean(form.preferred_locale && form.preferred_name?.trim());
  if (step === 2) return Boolean(form.university_id && form.faculty_id && form.academic_year && form.field_of_study?.trim());
  if (step === 3) return Boolean(form.courses?.length && form.interests?.length);
  if (step === 4) return Boolean(form.help_needs?.length && form.living_context);
  return false;
}
