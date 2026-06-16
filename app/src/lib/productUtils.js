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

export function calculateNeededRequirementAverage(requirements, targetGrade) {
  if (targetGrade === "" || targetGrade === null || targetGrade === undefined) return null;
  const target = Number(targetGrade);
  if (!Number.isFinite(target)) return null;

  const validRequirements = requirements
    .map((requirement) => {
      const weight = Number(requirement.weight);
      const hasGrade = requirement.grade !== "" && requirement.grade !== null && requirement.grade !== undefined;
      const grade = hasGrade ? Number(requirement.grade) : null;
      return {
        ...requirement,
        weight,
        grade,
        hasGrade,
        validWeight: Number.isFinite(weight) && weight > 0,
        validGrade: !hasGrade || (Number.isFinite(grade) && grade >= 0),
      };
    })
    .filter((requirement) => requirement.validWeight && requirement.validGrade);

  if (!validRequirements.length) return null;

  const totalWeight = validRequirements.reduce((total, requirement) => total + requirement.weight, 0);
  const completedWeight = validRequirements.reduce((total, requirement) => total + (requirement.hasGrade ? requirement.weight : 0), 0);
  const missingWeight = validRequirements.reduce((total, requirement) => total + (!requirement.hasGrade ? requirement.weight : 0), 0);
  const earnedPoints = validRequirements.reduce((total, requirement) => total + (requirement.hasGrade ? requirement.grade * requirement.weight : 0), 0);
  const targetPoints = target * 100;
  const neededAverage = missingWeight > 0 ? (targetPoints - earnedPoints) / missingWeight : null;
  const finalGrade = missingWeight === 0 ? earnedPoints / 100 : null;

  return {
    completedWeight,
    finalGrade,
    missingWeight,
    neededAverage,
    totalWeight,
  };
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
  if (step === 2) return Boolean(form.university_id && form.academic_year && form.field_of_study?.trim());
  if (step === 3 || step === 4) return true;
  return false;
}
