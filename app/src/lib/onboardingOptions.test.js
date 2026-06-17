import { describe, expect, it } from "vitest";
import { FIELD_OPTIONS, fieldOptionsWithCustom, filterLocalizedOptions, mergeInterestOptions, normalizeOptionName } from "./onboardingOptions";

describe("onboarding option helpers", () => {
  it("finds related fields from a partial query", () => {
    expect(filterLocalizedOptions(FIELD_OPTIONS, "Compu").map((field) => field.en)).toEqual(expect.arrayContaining(["Computer Science", "Computer Engineering"]));
  });

  it("searches Hebrew option labels", () => {
    expect(filterLocalizedOptions(FIELD_OPTIONS, "מחשב").map((field) => field.en)).toContain("Computer Science");
  });

  it("covers major academic fields students expect", () => {
    const fields = FIELD_OPTIONS.map((field) => field.en);
    expect(fields).toEqual(expect.arrayContaining([
      "Law",
      "Artificial Intelligence",
      "Public Health",
      "International Relations",
      "Finance",
      "Design",
      "Actuarial Science",
    ]));
  });

  it("lets students use a typed field when it is not suggested", () => {
    const options = fieldOptionsWithCustom(FIELD_OPTIONS, "Space Law");
    expect(options[0]).toEqual(expect.objectContaining({ en: "Space Law", custom: true }));
  });

  it("does not duplicate custom fields when the typed field already exists", () => {
    expect(fieldOptionsWithCustom(FIELD_OPTIONS, "Law").filter((field) => field.en === "Law")).toHaveLength(1);
    expect(fieldOptionsWithCustom(FIELD_OPTIONS, "Law").some((field) => field.custom)).toBe(false);
  });

  it("merges user-created interests without duplicating defaults", () => {
    const options = mergeInterestOptions([{ id: "1", name_en: "Football", name_he: "כדורגל", normalized_key: "football", is_active: true }, { id: "2", name_en: "Robotics", name_he: "רובוטיקה", normalized_key: "robotics", is_active: true }]);
    expect(options.filter((option) => normalizeOptionName(option.en) === "football")).toHaveLength(1);
    expect(options.map((option) => option.en)).toContain("Robotics");
  });
});
