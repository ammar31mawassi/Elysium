import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FlashcardsPage from "@/pages/FlashcardsPage";
import { base44 } from "@/api/base44Client";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      FlashcardDeck: { filter: vi.fn(), create: vi.fn(), update: vi.fn() },
      Flashcard: { filter: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      FlashcardDeckFavorite: { filter: vi.fn(), create: vi.fn(), delete: vi.fn() },
    },
  },
}));

vi.mock("@/lib/useProfile", () => ({
  useProfile: () => ({
    user: { id: "user-1", full_name: "Ammar Student" },
    profile: { id: "profile-1", university_id: "uni-1", preferred_name: "Ammar" },
  }),
}));

vi.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ locale: "en", isRTL: false }),
}));

vi.mock("@/components/layout/PageLayout", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

const ownDeck = {
  id: "deck-own",
  owner_user_id: "user-1",
  university_id: "uni-1",
  owner_display_name: "Ammar",
  name: "My Biology Pack",
  subject: "Biology",
  color: "#059669",
  is_public: false,
  card_count: 2,
  last_edited_at: "2026-06-17T10:00:00.000Z",
};

const publicDeck = {
  id: "deck-public",
  owner_user_id: "user-2",
  university_id: "uni-1",
  owner_display_name: "Lina",
  name: "Chemistry Basics",
  subject: "Chemistry",
  description: "First exam review",
  color: "#2563eb",
  is_public: true,
  card_count: 1,
  last_edited_at: "2026-06-17T09:00:00.000Z",
};

const otherCampusDeck = {
  id: "deck-other-campus",
  owner_user_id: "user-3",
  university_id: "uni-2",
  owner_display_name: "Sara",
  name: "Other Campus Pack",
  subject: "Physics",
  color: "#7c3aed",
  is_public: true,
  card_count: 1,
};

const ownCards = [
  { id: "card-1", deck_id: "deck-own", front: "Question A", back: "Answer A", card_order: 0 },
  { id: "card-2", deck_id: "deck-own", front: "Question B", back: "Answer B", card_order: 1 },
];

function openTab(name) {
  const tab = screen.getByRole("tab", { name });
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.click(tab);
}

describe("FlashcardsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.entities.FlashcardDeck.filter.mockImplementation((query) => {
      if (query.owner_user_id === "user-1") return Promise.resolve([ownDeck]);
      if (query.is_public === true) return Promise.resolve([publicDeck, otherCampusDeck]);
      return Promise.resolve([]);
    });
    base44.entities.FlashcardDeckFavorite.filter.mockResolvedValue([]);
    base44.entities.FlashcardDeckFavorite.create.mockImplementation((payload) => Promise.resolve({
      id: `favorite-${payload.deck_id}`,
      ...payload,
    }));
    base44.entities.FlashcardDeckFavorite.delete.mockResolvedValue({});
    base44.entities.Flashcard.filter.mockResolvedValue(ownCards);
    base44.entities.FlashcardDeck.create.mockResolvedValue({ id: "created-deck" });
    base44.entities.Flashcard.create.mockResolvedValue({});
  });

  it("shows created packs and filters published packs to the user's university", async () => {
    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    expect(await screen.findByText("My Biology Pack")).toBeInTheDocument();
    expect(screen.getByText("Question preview")).toBeInTheDocument();
    expect(screen.getByText("1. Question A")).toBeInTheDocument();
    expect(screen.queryByText("Answer A")).not.toBeInTheDocument();
    expect(screen.getByText("2 cards")).toBeInTheDocument();
    expect(base44.entities.Flashcard.filter).toHaveBeenCalledTimes(1);
    expect(base44.entities.Flashcard.filter).toHaveBeenCalledWith({ owner_user_id: "user-1" });

    openTab("Published");
    expect(await screen.findByText("Chemistry Basics")).toBeInTheDocument();
    expect(screen.queryByText("Other Campus Pack")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search published packs"), { target: { value: "biology" } });
    expect(screen.queryByText("Chemistry Basics")).not.toBeInTheDocument();
  });

  it("lets a student favorite a published pack", async () => {
    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    openTab("Published");
    await screen.findByText("Chemistry Basics");
    fireEvent.click(screen.getByLabelText("Favorite Chemistry Basics"));

    await waitFor(() => expect(base44.entities.FlashcardDeckFavorite.create).toHaveBeenCalledWith({
      owner_user_id: "user-1",
      deck_id: "deck-public",
      deck_owner_user_id: "user-2",
      university_id: "uni-1",
    }));
  });

  it("lets a student favorite one of their own packs", async () => {
    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    expect(await screen.findByText("My Biology Pack")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Favorite My Biology Pack"));

    await waitFor(() => expect(base44.entities.FlashcardDeckFavorite.create).toHaveBeenCalledWith({
      owner_user_id: "user-1",
      deck_id: "deck-own",
      deck_owner_user_id: "user-1",
      university_id: "uni-1",
    }));

    openTab("Favorites");
    expect(await screen.findByText("My Biology Pack")).toBeInTheDocument();
  });

  it("opens a study overlay with flip animation and next navigation", async () => {
    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    await screen.findByText("My Biology Pack");
    fireEvent.click(screen.getByRole("button", { name: "Use" }));

    expect(await screen.findByText("Question A")).toBeInTheDocument();
    const flipButton = screen.getByLabelText("Flip card");
    fireEvent.click(flipButton);
    expect(flipButton.firstElementChild).toHaveStyle({ transform: "rotateY(180deg)" });

    fireEvent.click(screen.getByLabelText("Next card"));
    expect(await screen.findByText("Card 2 of 2")).toBeInTheDocument();
    expect(flipButton.firstElementChild).toHaveStyle({ transform: "rotateY(0deg)" });
  });

  it("creates a public pack with color and card rows from the editor window", async () => {
    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Create pack" }));
    fireEvent.change(screen.getByLabelText("Pack name"), { target: { value: "Calculus Pack" } });
    fireEvent.change(screen.getByLabelText("Question 1"), { target: { value: "Derivative of x^2" } });
    fireEvent.change(screen.getByLabelText("Answer 1"), { target: { value: "2x" } });
    fireEvent.click(screen.getByRole("switch", { name: /make public/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save pack" }));

    await waitFor(() => expect(base44.entities.FlashcardDeck.create).toHaveBeenCalledWith(expect.objectContaining({
      name: "Calculus Pack",
      is_public: true,
      color: "#2563eb",
      card_count: 1,
      university_id: "uni-1",
    })));
    expect(base44.entities.Flashcard.create).toHaveBeenCalledWith(expect.objectContaining({
      deck_id: "created-deck",
      front: "Derivative of x^2",
      back: "2x",
      is_public: true,
    }));
  });

  it("shows a retryable load failure when Base44 rate limits deck loading", async () => {
    base44.entities.FlashcardDeck.filter.mockRejectedValue({ status: 429, message: "Rate limit exceeded" });

    render(<MemoryRouter><FlashcardsPage /></MemoryRouter>);

    expect(await screen.findByText("Loading failed")).toBeInTheDocument();
    expect(screen.getByText("Base44 rate limit exceeded. Wait a moment, then retry.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("No flashcard packs yet")).not.toBeInTheDocument();
  });
});
