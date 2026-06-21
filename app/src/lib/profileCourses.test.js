import { describe, expect, it } from "vitest";
import { activeCourseNames, courseProfileUpdate, normalizeCourseRecords, parseCourseListInput } from "./profileCourses";

describe("profile course helpers", () => {
  it("migrates legacy course strings to active records", () => {
    expect(normalizeCourseRecords({ courses: ["Calculus 2"] })).toEqual([
      { name: "Calculus 2", status: "active", semester: "unassigned", grade: "", credits: "" },
    ]);
  });

  it("returns only active courses for study matching", () => {
    const profile = { course_records: [{ name: "Algorithms", status: "active" }, { name: "Calculus 1", status: "finished" }] };
    expect(activeCourseNames(profile)).toEqual(["Algorithms"]);
  });

  it("keeps the legacy course list synchronized", () => {
    expect(courseProfileUpdate([{ name: "Data Structures", status: "finished", semester: "semester_b", grade: 88, credits: 4 }])).toEqual({
      course_records: [{ name: "Data Structures", status: "finished", semester: "semester_b", grade: 88, credits: 4 }],
      courses: ["Data Structures"],
    });
  });

  it("normalizes invalid semester values", () => {
    expect(courseProfileUpdate([{ name: "Physics", status: "active", semester: "fall" }]).course_records[0].semester).toBe("unassigned");
  });

  it("parses course text separated by western, Arabic, semicolon, or newline separators", () => {
    expect(parseCourseListInput(" Calculus 2, Data Structures\u060C Physics; Algorithms\nLinear Algebra ")).toEqual([
      { name: "Calculus 2", status: "active" },
      { name: "Data Structures", status: "active" },
      { name: "Physics", status: "active" },
      { name: "Algorithms", status: "active" },
      { name: "Linear Algebra", status: "active" },
    ]);
  });
});
