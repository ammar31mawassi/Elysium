import { describe, expect, it } from "vitest";

import { localizedField } from "./productUtils";
import { defaultUniversities, findDefaultUniversity, withDefaultUniversities } from "./universities";

describe("default universities", () => {
  it("includes the requested universities with English and Hebrew names only", () => {
    expect(defaultUniversities).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "tel-aviv-university", name: "Tel Aviv University", name_he: "אוניברסיטת תל אביב" }),
      expect.objectContaining({ id: "technion", name: "Technion - Israel Institute of Technology", name_he: "הטכניון - מכון טכנולוגי לישראל" }),
      expect.objectContaining({ id: "university-of-haifa", name: "University of Haifa", name_he: "אוניברסיטת חיפה" }),
      expect.objectContaining({ id: "bar-ilan-university", name: "Bar-Ilan University", name_he: "אוניברסיטת בר-אילן" }),
      expect.objectContaining({ id: "shamoon-college-of-engineering", name: "Shamoon College of Engineering", name_he: "המכללה האקדמית להנדסה ע״ש סמי שמעון" }),
    ]));

    const added = defaultUniversities.filter((university) => university.id !== "demo-bgu");
    expect(added.every((university) => !university.name_ar)).toBe(true);
  });

  it("falls back to English in Arabic locale when no Arabic name exists", () => {
    const telAviv = findDefaultUniversity("tel-aviv-university");

    expect(localizedField(telAviv, "name", "he")).toBe("אוניברסיטת תל אביב");
    expect(localizedField(telAviv, "name", "ar")).toBe("Tel Aviv University");
  });

  it("merges default universities with Base44 rows", () => {
    const merged = withDefaultUniversities([
      { id: "custom-university", name: "Custom University", is_active: true },
      { id: "inactive-university", name: "Inactive University", is_active: false },
    ]);

    expect(merged.map((university) => university.id)).toContain("technion");
    expect(merged.map((university) => university.id)).toContain("custom-university");
    expect(merged.map((university) => university.id)).not.toContain("inactive-university");
  });
});
