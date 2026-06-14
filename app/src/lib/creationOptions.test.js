import { describe, expect, it } from "vitest";
import { buildCourseOptions, categoryForInterest } from "./creationOptions";

describe("creation option helpers", () => {
  it("maps known hobbies to useful event categories", () => {
    expect(categoryForInterest("Football")).toBe("sports");
    expect(categoryForInterest("Chess")).toBe("gaming");
    expect(categoryForInterest("Photography")).toBe("social");
  });

  it("builds a deduplicated course list from profiles and records", () => {
    expect(buildCourseOptions(["Calculus 2"], [{ course_name: "Calculus 2" }, { course_name: "Data Structures" }]).map((option) => option.value)).toEqual(["Calculus 2", "Data Structures"]);
  });
});
