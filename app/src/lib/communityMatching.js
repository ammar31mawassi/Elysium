import { categoryForInterest } from "@/lib/creationOptions";
import { localizedOption, normalizeOptionName } from "@/lib/onboardingOptions";

export const PARTICIPATION_FILTERS = {
  all: "all",
  joined: "joined",
  notJoined: "not_joined",
};

export function mergeRecordsById(...collections) {
  const records = new Map();
  collections.flat().filter(Boolean).forEach((record) => {
    const key = record.id || [
      record.event_id,
      record.session_id,
      record.source_id,
      record.user_id,
      record.status,
    ].filter(Boolean).join(":");
    if (key && !records.has(key)) records.set(key, record);
  });
  return [...records.values()];
}

export function joinedIdsFromState({ memberships = [], calendarItems = [], idField, userId, sourceType }) {
  const ids = new Set();
  memberships
    .filter((item) => item.user_id === userId && item.status !== "rejected")
    .forEach((item) => {
      if (item[idField]) ids.add(item[idField]);
    });
  calendarItems
    .filter((item) => (!sourceType || item.source_type === sourceType) && item.status !== "canceled")
    .forEach((item) => {
      if (item.source_id) ids.add(item.source_id);
    });
  return ids;
}

export function countParticipants(memberships = [], idField, itemId, joinedIds = new Set()) {
  const participantKeys = new Set();
  memberships
    .filter((item) => item[idField] === itemId && item.status !== "rejected")
    .forEach((item) => {
      participantKeys.add(item.user_id || item.id || `${item[idField]}:${participantKeys.size}`);
    });
  return joinedIds.has(itemId) ? Math.max(1, participantKeys.size) : participantKeys.size;
}

export function filterMembershipsForUniversity(memberships = [], universityId) {
  return (memberships || []).filter((item) => !item.university_id || item.university_id === universityId);
}

export function participantSnapshot({ profile, user } = {}) {
  return {
    participant_name: profile?.preferred_name || user?.full_name || "Student",
    participant_academic_year: profile?.academic_year || "",
    participant_field_of_study: profile?.field_of_study || "",
  };
}

export function uniqueParticipants(memberships = [], idField, itemId) {
  const participants = new Map();
  (memberships || [])
    .filter((item) => item[idField] === itemId && item.status !== "rejected")
    .forEach((item) => {
      const key = item.user_id || item.id || `${item[idField]}:${participants.size}`;
      if (!participants.has(key)) participants.set(key, item);
    });
  return [...participants.values()];
}

export function filterByParticipation(items = [], joinedIds = new Set(), filter = PARTICIPATION_FILTERS.all) {
  if (filter === PARTICIPATION_FILTERS.joined) return items.filter((item) => joinedIds.has(item.id));
  if (filter === PARTICIPATION_FILTERS.notJoined) return items.filter((item) => !joinedIds.has(item.id));
  return items;
}

export function socialInterestScore(event = {}, interests = []) {
  const selected = interests.map((interest) => normalizeOptionName(typeof interest === "string" ? interest : interest?.en)).filter(Boolean);
  if (!selected.length) return 0;

  const activity = normalizeOptionName(event.activity_name);
  const category = normalizeOptionName(event.category);
  const text = [event.title, event.description, event.activity_name, event.category].filter(Boolean).join(" ").toLocaleLowerCase("en");

  return selected.reduce((best, interest, index) => {
    const categoryMatch = normalizeOptionName(categoryForInterest(interest));
    const orderBonus = Math.max(0, 50 - index);
    if (activity === interest) return Math.max(best, 300 + orderBonus);
    if (category && category === categoryMatch) return Math.max(best, 180 + orderBonus);
    if (text.includes(interest)) return Math.max(best, 90 + orderBonus);
    return best;
  }, 0);
}

export function sortSocialEventsByInterests(events = [], interests = []) {
  return [...events].sort((a, b) => {
    const scoreDiff = socialInterestScore(b, interests) - socialInterestScore(a, interests);
    if (scoreDiff) return scoreDiff;
    return `${a.date || ""}${a.start_time || ""}`.localeCompare(`${b.date || ""}${b.start_time || ""}`);
  });
}

export function sortOptionsBySelectedInterests(options = [], selectedInterests = [], locale = "en") {
  const selectedOrder = new Map(selectedInterests.map((interest, index) => [normalizeOptionName(interest), index]));
  return [...options].sort((a, b) => {
    const aOrder = selectedOrder.get(normalizeOptionName(a.en));
    const bOrder = selectedOrder.get(normalizeOptionName(b.en));
    const aSelected = aOrder !== undefined;
    const bSelected = bOrder !== undefined;
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    if (aSelected && bSelected) return aOrder - bOrder;
    return localizedOption(a, locale).localeCompare(localizedOption(b, locale));
  });
}
