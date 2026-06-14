import { describe, expect, it } from "vitest";
import { FIELD_OPTIONS, filterLocalizedOptions, mergeInterestOptions, normalizeOptionName } from "./onboardingOptions";

describe("onboarding option helpers", () => {
  it("finds related fields from a partial query", () => {
    expect(filterLocalizedOptions(FIELD_OPTIONS, "Compu").map((field) => field.en)).toEqual(expect.arrayContaining(["Computer Science", "Computer Engineering"]));
  });

  it("searches Hebrew option labels", () => {
    expect(filterLocalizedOptions(FIELD_OPTIONS, "מחשב").map((field) => field.en)).toContain("Computer Science");
  });

  it("merges user-created interests without duplicating defaults", () => {
    const options = mergeInterestOptions([{ id: "1", name_en: "Football", name_he: "כדורגל", normalized_key: "football", is_active: true }, { id: "2", name_en: "Robotics", name_he: "רובוטיקה", normalized_key: "robotics", is_active: true }]);
    expect(options.filter((option) => normalizeOptionName(option.en) === "football")).toHaveLength(1);
    expect(options.map((option) => option.en)).toContain("Robotics");
  });
});
