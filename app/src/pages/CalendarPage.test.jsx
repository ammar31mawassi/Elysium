import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CalendarPage from "@/pages/CalendarPage";
import { base44 } from "@/api/base44Client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      CalendarItem: {
        filter: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      SocialEvent: { filter: vi.fn() },
      StudySession: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1" },
    profile: { university_id: "bgu", course_records: [{ name: "Algorithms", status: "active" }] },
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({
    locale: "en",
    t: (key) => ({ common_loading: "Loading...", common_save: "Save" })[key] || key,
  }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

describe("CalendarPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.SocialEvent.filter.mockResolvedValue([]);
    base44.entities.StudySession.filter.mockResolvedValue([]);
  });

  it("opens an existing personal deadline for editing and saves changes", async () => {
    const originalItem = {
      id: "deadline-1",
      owner_user_id: "user-1",
      source_type: "personal",
      personal_kind: "homework",
      course_name: "Algorithms",
      title: "Read chapter 1",
      starts_at: new Date("2099-07-01T09:00:00").toISOString(),
      notes: "Pages 1-20",
      priority: "normal",
      all_day: false,
      completed: false,
      status: "active",
    };
    base44.entities.CalendarItem.filter.mockResolvedValue([originalItem]);
    base44.entities.CalendarItem.update.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    await screen.findByText("Read chapter 1");
    fireEvent.click(screen.getByRole("button", { name: "Edit calendar item" }));

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Submit worksheet" } });
    fireEvent.change(screen.getByLabelText("Date and time"), { target: { value: "2099-07-02T12:30" } });
    fireEvent.click(screen.getByRole("button", { name: "important" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(base44.entities.CalendarItem.update).toHaveBeenCalledWith("deadline-1", expect.objectContaining({
        title: "Submit worksheet",
        starts_at: new Date("2099-07-02T12:30").toISOString(),
        priority: "important",
        personal_kind: "homework",
      }));
    });
    expect(await screen.findByText("Submit worksheet")).toBeInTheDocument();
  });

  it("removes a joined social activity from the calendar when the source activity was canceled", async () => {
    const joinedActivity = {
      id: "calendar-activity-1",
      owner_user_id: "user-1",
      source_type: "social_activity",
      source_id: "event-1",
      title: "Campus football",
      starts_at: new Date("2099-07-01T09:00:00").toISOString(),
      notes: "Sports field",
      completed: false,
      status: "active",
    };
    base44.entities.CalendarItem.filter.mockResolvedValue([joinedActivity]);
    base44.entities.SocialEvent.filter.mockResolvedValue([{ id: "event-1", status: "canceled" }]);
    base44.entities.CalendarItem.delete.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(base44.entities.CalendarItem.delete).toHaveBeenCalledWith("calendar-activity-1");
    });
    expect(screen.queryByText("Campus football")).not.toBeInTheDocument();
  });

  it("shows the deadline empty copy after selecting the deadlines filter", async () => {
    base44.entities.CalendarItem.filter.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("No upcoming events yet.")).toBeInTheDocument();
    expect(screen.queryByText("no upcoming deadlines, want to add a new one")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deadlines" }));

    expect(await screen.findByText("no upcoming deadlines, want to add a new one")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add deadline" }));

    expect(screen.getByText("Add homework")).toBeInTheDocument();
  });

  it("shows event markers in the visual calendar and opens the selected day popup", async () => {
    const scheduledAt = new Date();
    scheduledAt.setHours(15, 30, 0, 0);
    if (scheduledAt.getTime() < Date.now()) {
      scheduledAt.setDate(scheduledAt.getDate() + 1);
    }
    const dayLabel = scheduledAt.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    base44.entities.CalendarItem.filter.mockResolvedValue([
      {
        id: "calendar-visual-1",
        owner_user_id: "user-1",
        source_type: "personal",
        personal_kind: "exam",
        title: "Algorithms quiz",
        starts_at: scheduledAt.toISOString(),
        notes: "Room 204",
        priority: "urgent",
        completed: false,
        status: "active",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Algorithms quiz")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendar board" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(nextMonth.toLocaleDateString("en", { month: "long", year: "numeric" }))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));

    const dayButton = screen.getByRole("button", { name: `Open ${dayLabel}. 1 scheduled event.` });
    fireEvent.click(dayButton);

    expect(screen.getByRole("heading", { name: `Events on ${dayLabel}` })).toBeInTheDocument();
    expect(screen.getAllByText("Algorithms quiz").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Room 204").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: `Open ${dayLabel}. 1 scheduled event.` })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByText("Day view")).toBeInTheDocument();
  });

  it("puts important homework and exams first in the visual day popup", async () => {
    const day = new Date();
    day.setHours(9, 0, 0, 0);
    if (day.getTime() < Date.now()) {
      day.setDate(day.getDate() + 1);
    }
    const dayLabel = day.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const atTime = (hour) => {
      const date = new Date(day);
      date.setHours(hour, 0, 0, 0);
      return date.toISOString();
    };

    base44.entities.CalendarItem.filter.mockResolvedValue([
      {
        id: "social-blue",
        owner_user_id: "user-1",
        source_type: "social_activity",
        title: "Morning meetup",
        starts_at: atTime(8),
        completed: false,
        status: "active",
      },
      {
        id: "deadline-yellow",
        owner_user_id: "user-1",
        source_type: "personal",
        personal_kind: "homework",
        title: "Regular homework",
        starts_at: atTime(9),
        priority: "normal",
        completed: false,
        status: "active",
      },
      {
        id: "study-green",
        owner_user_id: "user-1",
        source_type: "study_session",
        title: "Study group",
        starts_at: atTime(10),
        completed: false,
        status: "active",
      },
      {
        id: "deadline-red",
        owner_user_id: "user-1",
        source_type: "personal",
        personal_kind: "exam",
        title: "Important exam",
        starts_at: atTime(12),
        priority: "important",
        completed: false,
        status: "active",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Important exam")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `Open ${dayLabel}. 4 scheduled events.` }));

    const dialog = screen.getByRole("dialog");
    const importantExam = within(dialog).getByText("Important exam");
    const morningMeetup = within(dialog).getByText("Morning meetup");
    const regularHomework = within(dialog).getByText("Regular homework");
    const studyGroup = within(dialog).getByText("Study group");

    expect(importantExam.compareDocumentPosition(morningMeetup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(importantExam.compareDocumentPosition(regularHomework) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(importantExam.compareDocumentPosition(studyGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not show the deadline empty copy while social or study calendar items are listed", async () => {
    base44.entities.CalendarItem.filter.mockResolvedValue([
      {
        id: "social-calendar-1",
        owner_user_id: "user-1",
        source_type: "social_activity",
        source_id: "event-1",
        title: "Campus football",
        starts_at: new Date("2099-07-01T09:00:00").toISOString(),
        notes: "Sports field",
        completed: false,
        status: "active",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Campus football")).toBeInTheDocument();
    expect(screen.queryByText("no upcoming deadlines, want to add a new one")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deadlines" }));

    expect(await screen.findByText("no upcoming deadlines, want to add a new one")).toBeInTheDocument();
  });

  it("shows only the activity create prompt when social or study filters are empty", async () => {
    base44.entities.CalendarItem.filter.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    await screen.findByText("No upcoming events yet.");
    fireEvent.click(screen.getByRole("button", { name: "Social events" }));

    expect(screen.getByText("Didn't find what you are looking for? Why not make one yourself!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create social group" })).toBeInTheDocument();
    expect(screen.queryByText("No social groups yet.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Study groups" }));

    expect(screen.getByText("Didn't find what you are looking for? Why not make one yourself!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start a study group" })).toBeInTheDocument();
    expect(screen.queryByText("No study groups yet.")).not.toBeInTheDocument();
  });

  it("moves social and study events to past when their start time has passed", async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    base44.entities.CalendarItem.filter.mockResolvedValue([
      {
        id: "past-social",
        owner_user_id: "user-1",
        source_type: "social_activity",
        source_id: "event-past",
        title: "Past football",
        starts_at: past,
        notes: "Sports field",
        completed: false,
        status: "active",
      },
      {
        id: "past-study",
        owner_user_id: "user-1",
        source_type: "study_session",
        source_id: "session-past",
        title: "Past algorithms",
        starts_at: past,
        notes: "Library",
        completed: false,
        status: "active",
      },
      {
        id: "future-social",
        owner_user_id: "user-1",
        source_type: "social_activity",
        source_id: "event-future",
        title: "Future football",
        starts_at: future,
        notes: "Sports field",
        completed: false,
        status: "active",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Future football")).toBeInTheDocument();
    expect(screen.queryByText("Past football")).not.toBeInTheDocument();
    expect(screen.queryByText("Past algorithms")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Past" }));

    expect(await screen.findByText("Past football")).toBeInTheDocument();
    expect(screen.getByText("Past algorithms")).toBeInTheDocument();
    expect(screen.queryByText("Future football")).not.toBeInTheDocument();
  });
});
