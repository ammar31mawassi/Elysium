import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Onboarding from "@/pages/Onboarding";
import { base44 } from "@/api/base44Client";

const setLocale = vi.fn();

vi.mock("@/api/base44Client", () => ({
  base44: {
    auth: { me: vi.fn() },
    entities: {
      Interest: { filter: vi.fn(), create: vi.fn() },
      StudentProfile: { create: vi.fn(), filter: vi.fn(), update: vi.fn() },
      University: { list: vi.fn() },
    },
  },
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({
    locale: "en",
    setLocale,
    isRTL: false,
  }),
}));

vi.mock("@/components/elysium/ElysiumLogo", () => ({
  default: () => <div aria-label="Elysium logo" />,
}));

describe("Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.University.list.mockResolvedValue([]);
    base44.entities.Interest.filter.mockResolvedValue([]);
  });

  it("keeps typed comma separators visible while adding courses", async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ammar" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(await screen.findByRole("button", { name: /Ben-Gurion University/i }));
    fireEvent.click(screen.getByRole("button", { name: "1st Year" }));
    fireEvent.change(screen.getByPlaceholderText("Start typing, select a field, or add yours"), { target: { value: "Computer Science" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const coursesInput = await screen.findByPlaceholderText("Calculus 2, Data Structures");
    fireEvent.change(coursesInput, { target: { value: "Calculus," } });
    expect(coursesInput).toHaveValue("Calculus,");

    fireEvent.change(coursesInput, { target: { value: "Calculus, Data Structures" } });
    expect(coursesInput).toHaveValue("Calculus, Data Structures");
  });
});
