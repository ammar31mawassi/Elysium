import { describe, expect, it } from "vitest";
import {
  calculateGpa,
  calculateNeededRequirementAverage,
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

  it("calculates the average needed across unfilled requirements", () => {
    const result = calculateNeededRequirementAverage([
      { name: "Quiz", weight: 10, grade: 50 },
      { name: "Midterm", weight: 50, grade: 100 },
      { name: "Final", weight: 40, grade: "" },
    ], 80);

    expect(result).toEqual(expect.objectContaining({
      completedWeight: 60,
      missingWeight: 40,
      totalWeight: 100,
    }));
    expect(result.neededAverage).toBeCloseTo(62.5);
  });

  it("spreads the needed grade across multiple missing requirements by weighted average", () => {
    const result = calculateNeededRequirementAverage([
      { name: "Homework", weight: 20, grade: 70 },
      { name: "Project", weight: 30, grade: "" },
      { name: "Final", weight: 50, grade: "" },
    ], 85);

    expect(result.missingWeight).toBe(80);
    expect(result.neededAverage).toBeCloseTo(88.75);
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
    const form = { preferred_locale: "en", preferred_name: "Ammar", university_id: "bgu", academic_year: "1st Year", field_of_study: "Computer Science", courses: [], interests: [], help_needs: [] };
    expect([1, 2, 3, 4].every((step) => isOnboardingStepValid(form, step))).toBe(true);
    expect(isOnboardingStepValid({ ...form, field_of_study: "" }, 2)).toBe(false);
  });
});
