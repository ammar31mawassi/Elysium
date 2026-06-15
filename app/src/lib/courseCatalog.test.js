import { describe, expect, it } from "vitest";
import { courseCatalogKey, mergeCourseSuggestions, normalizeCourseName } from "./courseCatalog";

describe("course catalog helpers", () => {
  it("normalizes spacing and case for matching", () => {
    expect(normalizeCourseName("  Data   Structures ")).toBe("Data Structures");
    expect(courseCatalogKey("Data Structures")).toBe("data structures");
  });

  it("merges catalog, profile, and study-session course names", () => {
    expect(mergeCourseSuggestions(
      [{ name: "Calculus 1" }],
      [{ course_name: "Data Structures" }],
      ["calculus 1", "Linear Algebra"],
    )).toEqual(["calculus 1", "Data Structures", "Linear Algebra"]);
  });
});
