import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MyCommunitiesPage from "@/pages/MyCommunitiesPage";
import { base44 } from "@/api/base44Client";

const openCreateAction = vi.fn();

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      SocialEvent: {
        filter: vi.fn(),
        update: vi.fn(),
      },
      SocialEventMember: { filter: vi.fn() },
      StudySession: {
        filter: vi.fn(),
        update: vi.fn(),
      },
      StudySessionMember: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1", full_name: "Ammar Student" },
    profile: {
      university_id: "bgu",
      preferred_name: "Ammar",
      academic_year: "2",
      field_of_study: "Computer Science",
    },
  }),
}));

vi.mock("@/components/elysium/CreateActionProvider", () => ({
  useCreateAction: () => ({ openCreateAction }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

describe("MyCommunitiesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.SocialEvent.filter.mockResolvedValue([
      {
        id: "event-1",
        organizer_id: "user-1",
        university_id: "bgu",
        title: "Campus football",
        activity_name: "Football",
        date: "2099-07-01",
        start_time: "18:00",
        location: "Sports field",
        preferred_language: "English",
        max_spots: 8,
        status: "active",
        is_open: true,
      },
    ]);
    base44.entities.SocialEventMember.filter.mockResolvedValue([
      {
        id: "event-member-1",
        event_id: "event-1",
        user_id: "user-1",
        university_id: "bgu",
        status: "joined",
      },
    ]);
    base44.entities.StudySession.filter.mockResolvedValue([
      {
        id: "session-1",
        host_id: "user-1",
        university_id: "bgu",
        title: "Algorithms sprint",
        course_name: "Algorithms",
        session_date: "2099-07-02T15:00:00.000Z",
        location: "Library",
        preferred_language: "English",
        max_spots: 6,
        status: "active",
        is_marathon: false,
      },
    ]);
    base44.entities.StudySessionMember.filter.mockResolvedValue([
      {
        id: "session-member-1",
        session_id: "session-1",
        user_id: "user-1",
        university_id: "bgu",
        status: "joined",
      },
    ]);
  });

  it("opens the social view when Me links to social events", async () => {
    render(
      <MemoryRouter initialEntries={["/me/communities?type=social"]}>
        <MyCommunitiesPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "My social events" })).toBeInTheDocument();
    expect(screen.getByText("Campus football")).toBeInTheDocument();
    expect(screen.queryByText("Algorithms sprint")).not.toBeInTheDocument();
    expect(screen.queryByText("Study groups I created")).not.toBeInTheDocument();
  });

  it("switches to created study groups from the page filter", async () => {
    render(
      <MemoryRouter initialEntries={["/me/communities?type=social"]}>
        <MyCommunitiesPage />
      </MemoryRouter>
    );

    await screen.findByText("Campus football");
    fireEvent.click(screen.getByRole("button", { name: "Study groups" }));

    expect(await screen.findByRole("heading", { name: "My study groups" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Algorithms sprint")).toBeInTheDocument());
    expect(screen.queryByText("Campus football")).not.toBeInTheDocument();
  });
});
