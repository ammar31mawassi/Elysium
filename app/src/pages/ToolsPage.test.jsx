import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToolsPage from "@/pages/ToolsPage";
import { base44 } from "@/api/base44Client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      Guide: { filter: vi.fn() },
      HelpfulLink: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    profile: { id: "profile-1", university_id: "bgu", course_records: [] },
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({
    locale: "en",
    t: (key) => ({
      tools_calculators: "Calculators",
      tools_find_person: "Find a Person",
      tools_flashcards: "Flashcards",
      tools_gpa: "GPA Calculator",
      tools_grade: "Grade Needed",
      tools_guides: "Guides",
      tools_helper_short: "Connect with a student peer helper",
      tools_links: "Helpful Links",
      tools_tutor_short: "Find a private tutor for any subject",
      nav_helpers: "Peer helpers",
      nav_tutors: "Private tutors",
    })[key] || key,
  }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

describe("ToolsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.Guide.filter.mockResolvedValue([]);
    base44.entities.HelpfulLink.filter.mockResolvedValue([]);
  });

  it("calculates the average needed for blank course requirements", () => {
    render(
      <MemoryRouter initialEntries={["/tools?tool=grade"]}>
        <ToolsPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Target final grade"), { target: { value: "80" } });
    fireEvent.change(screen.getByLabelText("Requirement 1 percentage"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Requirement 1 grade"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Requirement 2 percentage"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Requirement 2 grade"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Requirement 3 percentage"), { target: { value: "40" } });

    expect(screen.getByText("Average needed on blank requirements")).toBeInTheDocument();
    expect(screen.getByText("62.5")).toBeInTheDocument();
  });

  it("links the GPA calculator to its dedicated page", () => {
    render(
      <MemoryRouter initialEntries={["/tools"]}>
        <ToolsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "GPA Calculator" })).toHaveAttribute("href", "/tools/gpa");
  });
});
