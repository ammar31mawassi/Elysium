import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GpaPage from "@/pages/GpaPage";
import { base44 } from "@/api/base44Client";

const setProfile = vi.fn();

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      CourseCatalog: {
        create: vi.fn(),
        filter: vi.fn(),
        list: vi.fn(),
      },
      StudentProfile: {
        update: vi.fn(),
      },
      StudySession: {
        filter: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1" },
    profile: {
      id: "profile-1",
      university_id: "bgu",
      course_records: [
        { name: "Introduction to CS", status: "finished", semester: "semester_a", grade: 83, credits: 5 },
        { name: "Calculus 1", status: "finished", semester: "semester_a", grade: 71, credits: 4.5 },
        { name: "Computer Systems", status: "active", semester: "semester_b", credits: 5 },
      ],
    },
    setProfile,
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ locale: "en" }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe("GpaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.CourseCatalog.filter.mockResolvedValue([{ name: "Linear Algebra", university_id: "bgu" }]);
    base44.entities.CourseCatalog.list.mockResolvedValue([{ name: "Linear Algebra", university_id: "bgu" }]);
    base44.entities.CourseCatalog.create.mockResolvedValue({});
    base44.entities.StudySession.filter.mockResolvedValue([]);
    base44.entities.StudentProfile.update.mockResolvedValue({});
  });

  it("renders saved courses grouped by semester with a weighted average", async () => {
    render(
      <MemoryRouter>
        <GpaPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "GPA Calculator" })).toBeInTheDocument();
    expect(screen.getByText("Introduction to CS")).toBeInTheDocument();
    expect(screen.getByText("Calculus 1")).toBeInTheDocument();
    expect(screen.getByText("Computer Systems")).toBeInTheDocument();
    expect(screen.getAllByText("77.32")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Semester B")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add course" })).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Summer" })).not.toBeInTheDocument();
    await waitFor(() => expect(base44.entities.CourseCatalog.filter).toHaveBeenCalledWith({ university_id: "bgu" }));
  });

  it("adds and persists a new semester-aware course", async () => {
    render(
      <MemoryRouter>
        <GpaPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Add course" })[0]);
    fireEvent.change(screen.getByLabelText("Course name"), { target: { value: "Linear Algebra" } });
    fireEvent.change(screen.getByLabelText("Credits"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Final grade"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "Semester B" }));
    fireEvent.click(screen.getByRole("button", { name: "Save course" }));

    expect(screen.getByText("Linear Algebra")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(base44.entities.StudentProfile.update).toHaveBeenCalled());
    const [, update] = base44.entities.StudentProfile.update.mock.calls[0];
    expect(update.course_records).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Linear Algebra", semester: "semester_b", grade: 90, credits: 5 }),
    ]));
    expect(setProfile).toHaveBeenCalled();
  });
});
