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

function DashboardRoute() {
  return (
    <div>
      <div data-tour="dashboard-overview">Dashboard page</div>
      <button data-tour="create-action" data-tour-surface="desktop">Desktop create</button>
      <button data-tour="create-action" data-tour-surface="mobile">Mobile create</button>
      <button data-tour="ely-assistant">Open Ely</button>
    </div>
  );
}

function AppHarness({ initialEntries = ["/"] } = {}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <TutorialProvider>
        <ReplayHarness />
        <Routes>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/calendar" element={<div data-tour="calendar-overview">Calendar page</div>} />
          <Route path="/discover" element={<div data-tour="discover-overview">Discover page</div>} />
          <Route path="*" element={<DashboardRoute />} />
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

    const dialog = await screen.findByRole("dialog", { name: "Welcome to Elysium" });
    expect(dialog).toHaveAccessibleDescription("Take a one-minute tour of the tools that keep your university day clear and connected.");
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

  it("moves across routed tutorial steps and persists completion", async () => {
    render(<AppHarness />);

    await screen.findByText("Welcome to Elysium");
    fireEvent.click(screen.getByRole("button", { name: "Start tour" }));

    expect(await screen.findByText("Your command center")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Create in one place")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Keep deadlines visible")).toBeInTheDocument();
    expect(await screen.findByText("Calendar page")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Find people and opportunities")).toBeInTheDocument();
    expect(await screen.findByText("Discover page")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Ask Ely what comes next")).toBeInTheDocument();
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("You are ready")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    await waitFor(() => expect(base44.entities.StudentProfile.update).toHaveBeenCalledWith("profile-1", { tutorial_version: PRODUCT_TOUR_VERSION }));
  });

  it("restores focus to the replay control after closing a replayed tutorial", async () => {
    profile = { id: "profile-1", onboarding_complete: true, tutorial_version: PRODUCT_TOUR_VERSION };
    render(<AppHarness />);

    const replay = screen.getByRole("button", { name: "Replay" });
    replay.focus();
    fireEvent.click(replay);

    await screen.findByText("Welcome to Elysium");
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    await waitFor(() => expect(document.activeElement).toBe(replay));
  });
});
