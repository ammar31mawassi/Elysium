import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1" },
    profile: { course_records: [{ name: "Algorithms", status: "active" }] },
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
});
