import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Dashboard from "@/pages/Dashboard";
import { base44 } from "@/api/base44Client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      CalendarItem: { filter: vi.fn() },
      SocialEvent: { filter: vi.fn() },
      SocialEventMember: { filter: vi.fn() },
      StudySession: { filter: vi.fn() },
      StudySessionMember: { filter: vi.fn() },
      PrivateTeacher: { filter: vi.fn() },
      PeerHelper: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1", full_name: "Ammar Student" },
    profile: {
      university_id: "uni-1",
      preferred_name: "Ammar",
      course_records: [{ name: "Algorithms", status: "active" }],
      interests: [],
    },
    university: { name: "Campus University" },
    loading: false,
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({
    locale: "en",
    t: (key) => ({ tools_flashcards: "Flashcards" })[key] || key,
  }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const future = new Date();
    future.setDate(future.getDate() + 7);
    base44.entities.CalendarItem.filter.mockResolvedValue([
      {
        id: "personal-normal",
        source_type: "personal",
        personal_kind: "homework",
        title: "Normal homework",
        starts_at: future.toISOString(),
        notes: "Yellow deadline",
        priority: "normal",
        status: "active",
        completed: false,
      },
      {
        id: "personal-important",
        source_type: "personal",
        personal_kind: "homework",
        title: "Important homework",
        starts_at: future.toISOString(),
        notes: "Red deadline",
        priority: "important",
        status: "active",
        completed: false,
      },
    ]);
    base44.entities.SocialEvent.filter.mockResolvedValue([]);
    base44.entities.SocialEventMember.filter.mockResolvedValue([]);
    base44.entities.StudySession.filter.mockResolvedValue([]);
    base44.entities.StudySessionMember.filter.mockResolvedValue([]);
    base44.entities.PrivateTeacher.filter.mockResolvedValue([]);
    base44.entities.PeerHelper.filter.mockResolvedValue([]);
  });

  it("renders the requested homepage quick actions with matching colors", async () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const study = await screen.findByRole("button", { name: "Create study group" });
    const social = screen.getByRole("button", { name: "Create social event" });
    const deadline = screen.getAllByRole("button", { name: "Add deadline" })[0];

    expect(screen.queryByText("Add something")).not.toBeInTheDocument();
    expect(study.compareDocumentPosition(social) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(social.compareDocumentPosition(deadline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(study).not.toHaveAttribute("href");
    expect(social).not.toHaveAttribute("href");
    expect(deadline).not.toHaveAttribute("href");
    expect(study.className).toContain("bg-primary/10");
    expect(social.className).toContain("bg-emerald-500/10");
    expect(deadline.className).toContain("bg-amber-500/10");
    expect(container.textContent).toContain("Coming up");
  });

  it("colors important personal deadlines red in Coming up", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const importantRows = await screen.findAllByText("Important homework");
    const importantRow = importantRows[importantRows.length - 1];
    const importantIcon = importantRow.closest("a").querySelector("span");
    expect(importantIcon.className).toContain("text-destructive");

    await waitFor(() => expect(screen.getByText("Normal homework")).toBeInTheDocument());
    const normalIcon = screen.getByText("Normal homework").closest("a").querySelector("span");
    expect(normalIcon.className).toContain("text-amber-700");
  });

  it("shows a retryable load failure when Base44 rate limits dashboard data", async () => {
    base44.entities.CalendarItem.filter.mockRejectedValue({ status: 429, message: "Rate limit exceeded" });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("Loading failed")).toBeInTheDocument();
    expect(screen.getByText("Base44 rate limit exceeded. Wait a moment, then retry.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Coming up")).not.toBeInTheDocument();
  });
});
