import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DiscoverPage from "@/pages/DiscoverPage";
import { base44 } from "@/api/base44Client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      SocialEvent: { filter: vi.fn() },
      SocialEventMember: { filter: vi.fn(), create: vi.fn(), delete: vi.fn() },
      StudySession: { filter: vi.fn() },
      StudySessionMember: { filter: vi.fn(), create: vi.fn(), delete: vi.fn() },
      CalendarItem: { filter: vi.fn(), create: vi.fn(), delete: vi.fn() },
      PrivateTeacher: { filter: vi.fn() },
      PeerHelper: { filter: vi.fn() },
      Guide: { filter: vi.fn() },
      HelpfulLink: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1", full_name: "Ammar Student" },
    profile: { id: "profile-1", university_id: "uni-1", interests: ["Football"], course_records: [{ name: "Algorithms", status: "active" }] },
    university: { id: "uni-1", name: "Demo University" },
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ locale: "en" }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

vi.mock("@/components/elysium/CreateActionProvider", () => ({
  useCreateAction: () => ({ openCreateAction: vi.fn() }),
}));

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.SocialEvent.filter.mockResolvedValue([]);
    base44.entities.SocialEventMember.filter.mockResolvedValue([]);
    base44.entities.StudySession.filter.mockResolvedValue([]);
    base44.entities.StudySessionMember.filter.mockResolvedValue([]);
    base44.entities.CalendarItem.filter.mockResolvedValue([]);
    base44.entities.PrivateTeacher.filter.mockResolvedValue([
      { id: "tutor-1", display_name: "Lina Tutor", subjects: ["Algorithms"], languages: ["English"], bio: "Patient tutor", is_active: true, is_approved: true },
    ]);
    base44.entities.PeerHelper.filter.mockResolvedValue([]);
    base44.entities.Guide.filter.mockResolvedValue([]);
    base44.entities.HelpfulLink.filter.mockResolvedValue([]);
  });

  it("loads only the active tab collections, then lazy-loads another tab when selected", async () => {
    render(
      <MemoryRouter initialEntries={["/discover?tab=social"]}>
        <DiscoverPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("No matching event yet.")).toBeInTheDocument();
    expect(base44.entities.SocialEvent.filter).toHaveBeenCalledTimes(1);
    expect(base44.entities.SocialEventMember.filter).toHaveBeenCalledTimes(2);
    expect(base44.entities.CalendarItem.filter).toHaveBeenCalledTimes(1);
    expect(base44.entities.StudySession.filter).not.toHaveBeenCalled();
    expect(base44.entities.PrivateTeacher.filter).not.toHaveBeenCalled();
    expect(base44.entities.PeerHelper.filter).not.toHaveBeenCalled();
    expect(base44.entities.Guide.filter).not.toHaveBeenCalled();
    expect(base44.entities.HelpfulLink.filter).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("tab", { name: "Tutors" }));

    expect(await screen.findByText("Lina Tutor")).toBeInTheDocument();
    await waitFor(() => expect(base44.entities.PrivateTeacher.filter).toHaveBeenCalledTimes(1));
    expect(base44.entities.StudySession.filter).not.toHaveBeenCalled();
    expect(base44.entities.Guide.filter).not.toHaveBeenCalled();
  });
});
