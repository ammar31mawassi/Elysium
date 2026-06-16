import { describe, expect, it, vi } from "vitest";
import { courseCatalogKey, fetchCourseCatalogSuggestions, mergeCourseSuggestions, normalizeCourseName } from "./courseCatalog";

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

  it("loads student-added catalog courses from filtered and listed records", async () => {
    const base44 = {
      entities: {
        CourseCatalog: {
          filter: vi.fn().mockResolvedValue([{ id: "mine", university_id: "uni-1", name: "Algorithms" }]),
          list: vi.fn().mockResolvedValue([
            { id: "other", university_id: "uni-1", name: "Data Structures" },
            { id: "other-uni", university_id: "uni-2", name: "Chemistry" },
          ]),
        },
      },
    };

    await expect(fetchCourseCatalogSuggestions(base44, { universityId: "uni-1" })).resolves.toEqual(["Algorithms", "Data Structures"]);
    expect(base44.entities.CourseCatalog.filter).toHaveBeenCalledWith({ university_id: "uni-1" });
    expect(base44.entities.CourseCatalog.list).toHaveBeenCalledWith("-created_date", 1000);
  });
});
