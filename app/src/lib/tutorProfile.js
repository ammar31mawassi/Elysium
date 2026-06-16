export const emptyTutorForm = {
  subjects_raw: "",
  languages_raw: "",
  phone_number: "",
  bio: "",
  teaching_mode: "both",
  price_min: "",
  price_max: "",
  availability: "",
  contact_consent: false,
};

const TEACHING_MODES = new Set(["online", "in_person", "both"]);

export function splitCommaList(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function tutorFormFromProfile(record = {}) {
  return {
    subjects_raw: (record.subjects || []).join(", "),
    languages_raw: (record.languages || []).join(", "),
    phone_number: record.phone_number || "",
    bio: record.bio || "",
    teaching_mode: TEACHING_MODES.has(record.teaching_mode) ? record.teaching_mode : "both",
    price_min: record.price_min ?? "",
    price_max: record.price_max ?? "",
    availability: record.availability || "",
    contact_consent: Boolean(record.contact_consent),
  };
}

function optionalPrice(value, label) {
  if (value === "" || value === null || value === undefined) return { value: undefined };
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: `${label} must be 0 or higher.` };
  }
  return { value: parsed };
}

export function buildTutorProfilePayload({ user, profile, profileForm, tutorForm, existingProfile }) {
  if (!user?.id || !profile?.university_id) {
    return { error: "Your profile is still loading. Please try again in a moment." };
  }

  const subjects = splitCommaList(tutorForm.subjects_raw);
  if (!subjects.length) return { error: "Add at least one subject before saving your tutor profile." };

  const min = optionalPrice(tutorForm.price_min, "Minimum price");
  if (min.error) return { error: min.error };
  const max = optionalPrice(tutorForm.price_max, "Maximum price");
  if (max.error) return { error: max.error };
  if (min.value !== undefined && max.value !== undefined && max.value < min.value) {
    return { error: "Maximum price must be greater than or equal to minimum price." };
  }

  const wasSuspended = existingProfile?.moderation_status === "suspended";
  const data = {
    user_id: user.id,
    university_id: profile.university_id,
    display_name: (profileForm.preferred_name || user.full_name || "Student").trim(),
    subjects,
    languages: splitCommaList(tutorForm.languages_raw),
    phone_number: tutorForm.contact_consent ? tutorForm.phone_number.trim() : "",
    bio: tutorForm.bio.trim(),
    teaching_mode: TEACHING_MODES.has(tutorForm.teaching_mode) ? tutorForm.teaching_mode : "both",
    currency: "ILS",
    availability: tutorForm.availability.trim(),
    contact_consent: Boolean(tutorForm.contact_consent),
    is_approved: !wasSuspended,
    is_active: !wasSuspended,
    moderation_status: wasSuspended ? "pending" : "approved",
  };

  if (min.value !== undefined) data.price_min = min.value;
  if (max.value !== undefined) data.price_max = max.value;

  return { data };
}

export function tutorStatus(profile) {
  if (!profile) return { label: "Not set up yet", tone: "text-muted-foreground" };
  if (profile.is_active && profile.is_approved && profile.moderation_status === "approved") {
    return { label: "Visible to students", tone: "text-emerald-600 dark:text-emerald-400" };
  }
  if (profile.moderation_status === "pending") {
    return { label: "Pending review", tone: "text-amber-600 dark:text-amber-400" };
  }
  return { label: "Not visible", tone: "text-muted-foreground" };
}
