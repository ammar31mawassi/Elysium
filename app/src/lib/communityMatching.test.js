import { describe, expect, it } from "vitest";

import {
  PARTICIPATION_FILTERS,
  countParticipants,
  filterMembershipsForUniversity,
  filterByParticipation,
  joinedIdsFromState,
  participantSnapshot,
  sortOptionsBySelectedInterests,
  sortSocialEventsByInterests,
  uniqueParticipants,
} from "./communityMatching";

describe("community matching helpers", () => {
  it("treats calendar records as joined state when membership rows are missing", () => {
    const joinedIds = joinedIdsFromState({
      memberships: [{ event_id: "event-1", user_id: "other-user", status: "approved" }],
      calendarItems: [{ source_type: "social_activity", source_id: "event-2", status: "active" }],
      idField: "event_id",
      userId: "user-1",
      sourceType: "social_activity",
    });

    expect([...joinedIds]).toEqual(["event-2"]);
    expect(countParticipants([], "event_id", "event-2", joinedIds)).toBe(1);
  });

  it("filters joined and not-joined groups without removing all groups by default", () => {
    const items = [{ id: "joined" }, { id: "open" }];
    const joinedIds = new Set(["joined"]);

    expect(filterByParticipation(items, joinedIds).map((item) => item.id)).toEqual(["joined", "open"]);
    expect(filterByParticipation(items, joinedIds, PARTICIPATION_FILTERS.joined).map((item) => item.id)).toEqual(["joined"]);
    expect(filterByParticipation(items, joinedIds, PARTICIPATION_FILTERS.notJoined).map((item) => item.id)).toEqual(["open"]);
  });

  it("counts unique participants for the current university", () => {
    const memberships = [
      { event_id: "event-1", user_id: "user-1", university_id: "uni-1", status: "approved" },
      { event_id: "event-1", user_id: "user-1", university_id: "uni-1", status: "approved" },
      { event_id: "event-1", user_id: "user-2", university_id: "uni-1", status: "approved" },
      { event_id: "event-1", user_id: "user-3", university_id: "uni-2", status: "approved" },
      { event_id: "event-1", user_id: "user-4", university_id: "uni-1", status: "rejected" },
    ];
    const sameUniversity = filterMembershipsForUniversity(memberships, "uni-1");

    expect(countParticipants(sameUniversity, "event_id", "event-1")).toBe(2);
    expect(uniqueParticipants(sameUniversity, "event_id", "event-1").map((item) => item.user_id)).toEqual(["user-1", "user-2"]);
  });

  it("builds participant display fields from the profile without exposing profile records", () => {
    expect(participantSnapshot({
      profile: { preferred_name: "Ammar", academic_year: "3rd Year", field_of_study: "Computer Science" },
      user: { full_name: "Fallback User" },
    })).toEqual({
      participant_name: "Ammar",
      participant_academic_year: "3rd Year",
      participant_field_of_study: "Computer Science",
    });
  });

  it("prioritizes social events that match the user's selected interests", () => {
    const events = [
      { id: "music", title: "Open mic", activity_name: "Music", category: "music", date: "2026-06-21", start_time: "19:00" },
      { id: "football", title: "Football match", activity_name: "Football", category: "sports", date: "2026-06-22", start_time: "18:00" },
      { id: "coffee", title: "Coffee walk", activity_name: "Coffee", category: "social", date: "2026-06-20", start_time: "12:00" },
    ];

    expect(sortSocialEventsByInterests(events, ["Football"]).map((event) => event.id)[0]).toBe("football");
    expect(sortSocialEventsByInterests(events, ["Music"]).map((event) => event.id)[0]).toBe("music");
  });

  it("keeps selected interests first in the picker", () => {
    const options = [
      { id: "football", en: "Football" },
      { id: "music", en: "Music" },
      { id: "coffee", en: "Coffee" },
    ];

    expect(sortOptionsBySelectedInterests(options, ["Music"]).map((option) => option.en)).toEqual(["Music", "Coffee", "Football"]);
  });
});
