import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { base44 } from "@/api/base44Client";
import { PRODUCT_TOUR_VERSION, TutorialProvider, useTutorial } from "@/components/tutorial/ProductTour";

const setProfile = vi.fn();
let profile;

vi.mock("@/api/base44Client", () => ({
  base44: { entities: { StudentProfile: { update: vi.fn() } } },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1" },
    profile,
    setProfile,
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ isRTL: false }),
}));

function ReplayHarness() {
  const { startTutorial } = useTutorial();
  return <button onClick={startTutorial}>Replay</button>;
}

function AppHarness() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <TutorialProvider>
        <ReplayHarness />
        <Routes>
          <Route path="*" element={<div data-tour="dashboard-overview">Dashboard</div>} />
        </Routes>
      </TutorialProvider>
    </MemoryRouter>
  );
}

describe("ProductTour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    profile = { id: "profile-1", onboarding_complete: true, tutorial_version: 0 };
    base44.entities.StudentProfile.update.mockResolvedValue({});
  });

  it("starts automatically for a student who has not completed this tutorial version", async () => {
    render(<AppHarness />);

    expect(await screen.findByRole("dialog", { name: "Welcome to Elysium" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start tour" }));
    expect(await screen.findByText("Your command center")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("persists a skipped tour and still allows replay from settings", async () => {
    render(<AppHarness />);

    await screen.findByText("Welcome to Elysium");
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    await waitFor(() => expect(base44.entities.StudentProfile.update).toHaveBeenCalledWith("profile-1", { tutorial_version: PRODUCT_TOUR_VERSION }));
    expect(window.localStorage.getItem("elysium:product-tour:profile-1")).toBe(String(PRODUCT_TOUR_VERSION));

    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    expect(await screen.findByText("Welcome to Elysium")).toBeInTheDocument();
  });
});
