import { describe, expect, it } from "vitest";
import {
  calculateGpa,
  calculateRequiredGrade,
  directionForLocale,
  extractInternalPaths,
  isOnboardingStepValid,
  sortByUrgency,
} from "./productUtils";

describe("student planning utilities", () => {
  it("calculates a credit-weighted GPA", () => {
    expect(calculateGpa([{ grade: 80, credits: 2 }, { grade: 90, credits: 3 }])).toEqual({ average: 86, credits: 5 });
  });

  it("calculates the grade needed on remaining coursework", () => {
    expect(calculateRequiredGrade(70, 60, 80)).toBeCloseTo(95);
  });

  it("orders urgent future items before normal items", () => {
    const now = new Date("2026-06-13T00:00:00Z");
    const sorted = sortByUrgency([
      { id: "normal", starts_at: "2026-06-14T09:00:00Z", priority: "normal" },
      { id: "urgent", starts_at: "2026-06-15T09:00:00Z", priority: "urgent" },
    ], now);
    expect(sorted.map((item) => item.id)).toEqual(["urgent", "normal"]);
  });

  it("maps Hebrew and Arabic to RTL", () => {
    expect(directionForLocale("he")).toBe("rtl");
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
  });

  it("extracts unique internal Ely actions", () => {
    expect(extractInternalPaths("Open /calendar then /discover?tab=tutors and /calendar.")).toEqual(["/calendar", "/discover?tab=tutors"]);
  });

  it("validates each onboarding stage", () => {
    const form = { preferred_locale: "en", preferred_name: "Ammar", university_id: "bgu", faculty_id: "engineering", academic_year: "1st Year", field_of_study: "CS", courses: ["Calculus"], interests: ["Football"], help_needs: ["Study partners"], living_context: "Commuting" };
    expect([1, 2, 3, 4].every((step) => isOnboardingStepValid(form, step))).toBe(true);
    expect(isOnboardingStepValid({ ...form, help_needs: [] }, 4)).toBe(false);
  });
});
