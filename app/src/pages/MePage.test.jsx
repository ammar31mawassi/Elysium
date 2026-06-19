import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MePage from "@/pages/MePage";
import { base44 } from "@/api/base44Client";

const mockUser = { id: "user-1", full_name: "Ammar Student" };
const mockProfile = {
  id: "profile-1",
  university_id: "bgu",
  course_records: [{ name: "Algorithms", status: "active" }],
  interests: ["Football"],
};
const setProfile = vi.fn();

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      CourseCatalog: { filter: vi.fn(), list: vi.fn(), create: vi.fn() },
      Interest: { filter: vi.fn(), create: vi.fn() },
      StudentProfile: { update: vi.fn() },
      StudySession: { filter: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: mockUser,
    profile: mockProfile,
    setProfile,
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ locale: "en" }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

describe("MePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.CourseCatalog.filter.mockResolvedValue([]);
    base44.entities.CourseCatalog.list.mockResolvedValue([]);
    base44.entities.CourseCatalog.create.mockResolvedValue({});
    base44.entities.StudySession.filter.mockResolvedValue([]);
    base44.entities.Interest.filter.mockResolvedValue([]);
    base44.entities.Interest.create.mockResolvedValue({});
    base44.entities.StudentProfile.update.mockResolvedValue({});
  });

  it("shows one communities entry instead of separate social and study cards", async () => {
    render(<MemoryRouter><MePage /></MemoryRouter>);

    expect(screen.getByRole("link", { name: /My calendar/i })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: /My communities/i })).toHaveAttribute("href", "/me/communities");
    expect(screen.getByRole("link", { name: /My tools/i })).toHaveAttribute("href", "/tools");
    expect(screen.queryByRole("link", { name: /My social events/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /My study groups/i })).not.toBeInTheDocument();
  });
});
