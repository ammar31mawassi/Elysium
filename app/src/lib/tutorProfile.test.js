import { describe, expect, it } from "vitest";

import { buildTutorProfilePayload, splitCommaList, tutorFormFromProfile, tutorStatus } from "./tutorProfile";

const user = { id: "user-1", full_name: "Ammar Student" };
const profile = { university_id: "uni-1" };
const profileForm = { preferred_name: "Ammar" };

describe("tutor profile helpers", () => {
  it("builds a tutor profile without user-controlled moderation fields", () => {
    const { data, error } = buildTutorProfilePayload({
      user,
      profile,
      profileForm,
      tutorForm: {
        subjects_raw: "Calculus, Data Structures",
        languages_raw: "Arabic, Hebrew",
        phone_number: " 050-123-4567 ",
        bio: " Patient exam prep. ",
        teaching_mode: "both",
        price_min: "70",
        price_max: "",
        availability: " Evenings ",
        contact_consent: true,
      },
    });

    expect(error).toBeUndefined();
    expect(data).toEqual(expect.objectContaining({
      user_id: "user-1",
      university_id: "uni-1",
      display_name: "Ammar",
      subjects: ["Calculus", "Data Structures"],
      languages: ["Arabic", "Hebrew"],
      phone_number: "050-123-4567",
      bio: "Patient exam prep.",
      price_min: 70,
    }));
    expect(data).not.toHaveProperty("is_approved");
    expect(data).not.toHaveProperty("is_active");
    expect(data).not.toHaveProperty("moderation_status");
    expect(data).not.toHaveProperty("price_max");
  });

  it("keeps suspended-profile moderation controlled by admin fields", () => {
    const { data } = buildTutorProfilePayload({
      user,
      profile,
      profileForm,
      tutorForm: {
        subjects_raw: "Algorithms",
        languages_raw: "",
        phone_number: "",
        bio: "",
        teaching_mode: "online",
        price_min: "",
        price_max: "",
        availability: "",
        contact_consent: false,
      },
    });

    expect(data).not.toHaveProperty("is_approved");
    expect(data).not.toHaveProperty("is_active");
    expect(data).not.toHaveProperty("moderation_status");
  });

  it("rejects incomplete or invalid tutor forms before calling Base44", () => {
    expect(buildTutorProfilePayload({ user, profile, profileForm, tutorForm: { subjects_raw: "", price_min: "", price_max: "" } }).error).toContain("Add at least one subject");
    expect(buildTutorProfilePayload({ user, profile, profileForm, tutorForm: { subjects_raw: "Math", price_min: "-1", price_max: "" } }).error).toContain("Minimum price");
    expect(buildTutorProfilePayload({ user, profile, profileForm, tutorForm: { subjects_raw: "Math", price_min: "100", price_max: "80" } }).error).toContain("Maximum price");
  });

  it("maps saved records back into editable dialog state and labels status", () => {
    expect(splitCommaList(" Math, , Physics ")).toEqual(["Math", "Physics"]);
    expect(tutorFormFromProfile({ subjects: ["Math"], price_min: 50, contact_consent: true })).toEqual(expect.objectContaining({
      subjects_raw: "Math",
      price_min: 50,
      contact_consent: true,
    }));
    expect(tutorStatus({ is_active: true, is_approved: true, moderation_status: "approved" }).label).toBe("Visible to students");
    expect(tutorStatus({ moderation_status: "pending" }).label).toBe("Pending review");
  });
});
