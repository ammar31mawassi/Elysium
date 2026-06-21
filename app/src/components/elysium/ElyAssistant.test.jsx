import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildElyActionContext,
  calendarItemToElyContext,
  formatCalendarItemsForStudentContext,
  getRelevantUpcomingCalendarItems,
  syncElyActionSideEffects,
} from "@/components/elysium/ElyAssistant";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      StudentProfile: { filter: vi.fn() },
      CalendarItem: { filter: vi.fn() },
      CourseCatalog: { filter: vi.fn(), list: vi.fn(), create: vi.fn() },
    },
  },
}));

describe("ElyAssistant action helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds explicit write context for calendar and course actions", () => {
    const context = buildElyActionContext({
      user: { id: "user-1" },
      profile: { id: "profile-1", university_id: "bgu" },
      university: { name: "Test University" },
      locale: "en",
      upcomingCalendarItems: [{
        id: "calendar-1",
        title: "Algorithms exam",
        course_name: "Algorithms",
        starts_at: "2099-07-01T09:00:00.000Z",
        personal_kind: "exam",
        priority: "urgent",
      }],
    });

    expect(context).toEqual(expect.objectContaining({
      locale: "en",
      user_id: "user-1",
      profile_id: "profile-1",
      university_id: "bgu",
      university_name: "Test University",
    }));
    expect(context.calendar_planning).toEqual(expect.objectContaining({
      mode: "text_first_calendar_planner",
      create_only_when_user_clearly_asks_to_save: true,
      can_create_multiple_items_from_one_message: true,
    }));
    expect(context.upcoming_calendar).toEqual([
      expect.objectContaining({
        title: "Algorithms exam",
        course_name: "Algorithms",
        starts_at: "2099-07-01T09:00:00.000Z",
        kind: "exam",
        priority: "urgent",
      }),
    ]);
    expect(context.writable_actions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        action: "create_calendar_item",
        entity: "CalendarItem",
        fixed_fields: expect.objectContaining({ owner_user_id: "user-1", source_type: "personal" }),
        can_create_multiple_from_one_message: true,
      }),
      expect.objectContaining({
        action: "update_profile_courses",
        entity: "StudentProfile",
        profile_id: "profile-1",
      }),
    ]));
  });

  it("filters, sorts, and formats active upcoming calendar context", () => {
    const rows = [
      { id: "old", title: "Yesterday", starts_at: "2026-06-20T09:00:00.000Z", status: "active" },
      { id: "done", title: "Done", starts_at: "2026-06-22T09:00:00.000Z", status: "active", completed: true },
      { id: "later", title: "Project draft", starts_at: "2026-06-23T12:00:00.000Z", status: "active", priority: "important" },
      { id: "first", title: "Exam review", course_name: "Algorithms", starts_at: "2026-06-21T15:00:00.000Z", status: "active", personal_kind: "homework" },
      { id: "canceled", title: "Canceled", starts_at: "2026-06-21T18:00:00.000Z", status: "canceled" },
    ];

    const upcoming = getRelevantUpcomingCalendarItems(rows, new Date("2026-06-21T10:00:00.000Z"));

    expect(upcoming.map((item) => item.id)).toEqual(["first", "later"]);
    expect(calendarItemToElyContext(upcoming[0])).toEqual(expect.objectContaining({
      title: "Exam review",
      course_name: "Algorithms",
      kind: "homework",
    }));
    expect(formatCalendarItemsForStudentContext(upcoming)).toContain("Exam review | course: Algorithms | starts: 2026-06-21T15:00:00.000Z");
  });

  it("refreshes profile courses and broadcasts recently created calendar items", async () => {
    const sentAt = new Date().toISOString();
    const calendarItem = {
      id: "calendar-1",
      owner_user_id: "user-1",
      source_type: "personal",
      title: "Algorithms exam",
      starts_at: new Date("2099-07-01T09:00:00Z").toISOString(),
      created_date: sentAt,
    };
    const latestProfile = {
      id: "profile-1",
      user_id: "user-1",
      university_id: "bgu",
      course_records: [{ name: "Algorithms", status: "active", semester: "unassigned" }],
      courses: ["Algorithms"],
    };
    const api = {
      entities: {
        StudentProfile: { filter: vi.fn().mockResolvedValue([latestProfile]) },
        CalendarItem: { filter: vi.fn().mockResolvedValue([calendarItem]) },
        CourseCatalog: {
          filter: vi.fn().mockResolvedValue([]),
          list: vi.fn().mockResolvedValue([]),
          create: vi.fn().mockResolvedValue({}),
        },
      },
    };
    const setProfile = vi.fn();
    const eventListener = vi.fn();
    window.addEventListener("elysium:create-action-complete", eventListener);

    await syncElyActionSideEffects({
      api,
      user: { id: "user-1" },
      profile: { id: "profile-1", course_records: [] },
      setProfile,
      sentAt,
      syncedCalendarItemIds: new Set(),
    });

    expect(api.entities.StudentProfile.filter).toHaveBeenCalledWith({ user_id: "user-1" });
    expect(api.entities.CalendarItem.filter).toHaveBeenCalledWith({ owner_user_id: "user-1" }, "-created_date", 8);
    expect(setProfile).toHaveBeenCalled();
    expect(api.entities.CourseCatalog.create).toHaveBeenCalledWith(expect.objectContaining({
      university_id: "bgu",
      name: "Algorithms",
      normalized_key: "algorithms",
      created_by: "user-1",
    }));
    expect(eventListener).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({ type: "calendar", calendarItem }),
    }));

    window.removeEventListener("elysium:create-action-complete", eventListener);
  });
});
