import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Heart,
  Layers3,
  Loader2,
  Plus,
  Search,
  Shuffle,
  Trash2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import LoadFailedState from "@/components/ui/LoadFailedState";
import { base44ErrorMessage, loadBase44Collection } from "@/lib/base44LoadState";

const DECK_COLORS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#475569",
];

const DEFAULT_COLOR = DECK_COLORS[0];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, timeout = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Flashcard request timed out")), timeout)),
  ]);
}

async function safeQuery(source, fallback = [], { retry = true } = {}) {
  const run = () => (typeof source === "function" ? source() : source);
  try {
    return await withTimeout(run());
  } catch {
    if (!retry) return fallback;
    await wait(750);
    try {
      return await withTimeout(run());
    } catch {
      return fallback;
    }
  }
}

function makeCardRow(card = {}) {
  return {
    _rowId: card.id || `${Date.now()}-${Math.random()}`,
    id: card.id || null,
    front: card.front || "",
    back: card.back || "",
  };
}

function emptyDeckForm(locale = "en") {
  return {
    id: null,
    name: "",
    subject: "",
    description: "",
    color: DEFAULT_COLOR,
    is_public: false,
    language: locale,
    cards: [makeCardRow()],
    originalCardIds: [],
  };
}

function sortedCards(cards = []) {
  return [...cards].sort((a, b) => (a.card_order || 0) - (b.card_order || 0));
}

function sortedDecks(decks = []) {
  return [...decks].sort((a, b) => {
    const aDate = new Date(a.last_edited_at || a.updated_date || a.created_date || 0).getTime();
    const bDate = new Date(b.last_edited_at || b.updated_date || b.created_date || 0).getTime();
    return bDate - aDate;
  });
}

function deckColor(deck) {
  return deck?.color || DEFAULT_COLOR;
}

function withAlpha(color, alpha) {
  if (!color?.startsWith("#")) return color || DEFAULT_COLOR;
  return `${color}${alpha}`;
}

function deckMatchesSearch(deck, query) {
  const normalized = query.trim().toLocaleLowerCase("en");
  if (!normalized) return true;
  return [deck.name, deck.subject, deck.description, deck.owner_display_name]
    .filter(Boolean)
    .some((value) => value.toLocaleLowerCase("en").includes(normalized));
}

function shuffleIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

export default function FlashcardsPage() {
  const { user: profileUser, profile } = useProfile();
  const { locale, isRTL } = useLanguage();
  const [fallbackUser, setFallbackUser] = useState(null);
  const [createdDecks, setCreatedDecks] = useState([]);
  const [publishedDecks, setPublishedDecks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [deckCardCounts, setDeckCardCounts] = useState({});
  const [createdCardsByDeck, setCreatedCardsByDeck] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [activeTab, setActiveTab] = useState("created");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [deckForm, setDeckForm] = useState(() => emptyDeckForm(locale));
  const [saving, setSaving] = useState(false);
  const [studyDeck, setStudyDeck] = useState(null);
  const [studyCards, setStudyCards] = useState([]);
  const [studyOrder, setStudyOrder] = useState([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyLoading, setStudyLoading] = useState(false);
  const user = profileUser || fallbackUser;

  const favoriteDeckIds = useMemo(() => new Set(favorites.map((favorite) => favorite.deck_id)), [favorites]);
  const visibleDecksById = useMemo(() => {
    const deckMap = new Map();
    [...createdDecks, ...publishedDecks].forEach((deck) => {
      if (deck?.id) deckMap.set(deck.id, deck);
    });
    return deckMap;
  }, [createdDecks, publishedDecks]);
  const favoriteDecks = useMemo(() => (
    sortedDecks(favorites.map((favorite) => visibleDecksById.get(favorite.deck_id)).filter(Boolean))
  ), [favorites, visibleDecksById]);
  const searchablePublishedDecks = useMemo(() => publishedDecks.filter((deck) => deckMatchesSearch(deck, search)), [publishedDecks, search]);

  const loadDecks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const [mine, publicRows, favoriteRows] = await Promise.all([
        loadBase44Collection(() => base44.entities.FlashcardDeck.filter({ owner_user_id: user.id }), "Your flashcard packs timed out"),
        loadBase44Collection(() => base44.entities.FlashcardDeck.filter({ is_public: true }), "Published flashcard packs timed out"),
        loadBase44Collection(() => base44.entities.FlashcardDeckFavorite.filter({ owner_user_id: user.id }), "Favorite flashcard packs timed out"),
      ]);
      const mineRows = sortedDecks(mine || []);
      const cardPairs = await Promise.all(mineRows.map(async (deck) => {
        const cards = await loadBase44Collection(() => base44.entities.Flashcard.filter({ deck_id: deck.id }), "Flashcard cards timed out");
        return [deck.id, sortedCards(cards || [])];
      }));
      const cardCountPairs = cardPairs.map(([deckId, cards]) => [deckId, cards.length]);
      const publicForCampus = (publicRows || []).filter((deck) => (
        deck.owner_user_id !== user.id
        && (!profile?.university_id || deck.university_id === profile.university_id)
      ));
      setDeckCardCounts(Object.fromEntries(cardCountPairs));
      setCreatedCardsByDeck(Object.fromEntries(cardPairs));
      setCreatedDecks(mineRows);
      setPublishedDecks(sortedDecks(publicForCampus));
      setFavorites(favoriteRows || []);
    } catch (error) {
      setLoadError(base44ErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [profile?.university_id, user?.id, loadKey]);

  useEffect(() => {
    if (profileUser?.id || fallbackUser?.id) return;
    let active = true;
    safeQuery(() => base44.auth.me(), null).then((currentUser) => {
      if (active && currentUser?.id) setFallbackUser(currentUser);
    });
    return () => { active = false; };
  }, [fallbackUser?.id, profileUser?.id]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const fetchCards = async (deck) => {
    if (!deck?.id) return [];
    const rows = await safeQuery(() => base44.entities.Flashcard.filter({ deck_id: deck.id }));
    return sortedCards(rows || []);
  };

  const openCreateEditor = () => {
    setDeckForm(emptyDeckForm(locale));
    setEditorOpen(true);
  };

  const openEditEditor = async (deck) => {
    setEditorOpen(true);
    setEditorLoading(true);
    try {
      const cards = await fetchCards(deck);
      setDeckForm({
        id: deck.id,
        name: deck.name || "",
        subject: deck.subject || "",
        description: deck.description || "",
        color: deckColor(deck),
        is_public: !!deck.is_public,
        language: deck.language || locale,
        cards: cards.length ? cards.map(makeCardRow) : [makeCardRow()],
        originalCardIds: cards.map((card) => card.id).filter(Boolean),
      });
    } finally {
      setEditorLoading(false);
    }
  };

  const updateDeckForm = (patch) => {
    setDeckForm((current) => ({ ...current, ...patch }));
  };

  const updateCardRow = (rowId, patch) => {
    setDeckForm((current) => ({
      ...current,
      cards: current.cards.map((card) => (card._rowId === rowId ? { ...card, ...patch } : card)),
    }));
  };

  const addCardRow = () => {
    setDeckForm((current) => ({ ...current, cards: [...current.cards, makeCardRow()] }));
  };

  const removeCardRow = (rowId) => {
    setDeckForm((current) => ({
      ...current,
      cards: current.cards.length > 1 ? current.cards.filter((card) => card._rowId !== rowId) : [makeCardRow()],
    }));
  };

  const saveDeck = async () => {
    if (!user?.id || !deckForm.name.trim()) return;
    setSaving(true);

    try {
      const usableCards = deckForm.cards
        .map((card) => ({ ...card, front: card.front.trim(), back: card.back.trim() }))
        .filter((card) => card.front && card.back);
      const now = new Date().toISOString();
      const payload = {
        owner_user_id: user.id,
        university_id: profile?.university_id || "",
        owner_display_name: profile?.preferred_name || user.full_name || "Student",
        name: deckForm.name.trim(),
        subject: deckForm.subject.trim(),
        description: deckForm.description.trim(),
        color: deckForm.color || DEFAULT_COLOR,
        is_public: !!deckForm.is_public,
        language: deckForm.language || locale,
        card_count: usableCards.length,
        last_edited_at: now,
      };

      const deck = deckForm.id
        ? await base44.entities.FlashcardDeck.update(deckForm.id, payload)
        : await base44.entities.FlashcardDeck.create(payload);

      const activeCardIds = new Set(usableCards.map((card) => card.id).filter(Boolean));
      const removedCardIds = (deckForm.originalCardIds || []).filter((id) => !activeCardIds.has(id));
      await Promise.all(removedCardIds.map((id) => base44.entities.Flashcard.delete(id).catch(() => null)));
      await Promise.all(usableCards.map((card, index) => {
        const cardPayload = {
          owner_user_id: user.id,
          university_id: payload.university_id,
          deck_id: deck.id || deckForm.id,
          front: card.front,
          back: card.back,
          card_order: index,
          is_public: payload.is_public,
          review_status: "new",
        };
        return card.id
          ? base44.entities.Flashcard.update(card.id, cardPayload)
          : base44.entities.Flashcard.create(cardPayload);
      }));

      toast({ title: deckForm.id ? "Flashcard pack updated" : "Flashcard pack created" });
      setEditorOpen(false);
      await loadDecks();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Flashcard pack was not saved" });
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (deck) => {
    if (!user?.id || !deck?.id) return;
    const existing = favorites.find((favorite) => favorite.deck_id === deck.id);
    try {
      if (existing) {
        await base44.entities.FlashcardDeckFavorite.delete(existing.id);
        setFavorites((current) => current.filter((favorite) => favorite.id !== existing.id));
      } else {
        const favorite = await base44.entities.FlashcardDeckFavorite.create({
          owner_user_id: user.id,
          deck_id: deck.id,
          deck_owner_user_id: deck.owner_user_id || user.id,
          university_id: deck.university_id || profile?.university_id || "",
        });
        setFavorites((current) => [...current, favorite]);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Favorite was not updated" });
    }
  };

  const startStudy = async (deck) => {
    setStudyDeck(deck);
    setStudyCards([]);
    setStudyOrder([]);
    setStudyIndex(0);
    setFlipped(false);
    setStudyLoading(true);
    try {
      const cards = await fetchCards(deck);
      setStudyCards(cards);
      setStudyOrder(cards.map((_, index) => index));
    } finally {
      setStudyLoading(false);
    }
  };

  const closeStudy = () => {
    setStudyDeck(null);
    setStudyCards([]);
    setStudyOrder([]);
    setStudyIndex(0);
    setFlipped(false);
  };

  const moveStudy = (direction) => {
    if (!studyCards.length) return;
    setStudyIndex((current) => (current + direction + studyCards.length) % studyCards.length);
    setFlipped(false);
  };

  const randomizeStudy = () => {
    if (!studyCards.length) return;
    setStudyOrder(shuffleIndexes(studyCards.length));
    setStudyIndex(0);
    setFlipped(false);
  };

  const PreviousIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const currentStudyCard = studyCards[studyOrder[studyIndex]];

  return (
    <PageLayout wide>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Study tools</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Flashcards</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Build packs, keep favorites, and study cards shared by students at your university.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreateEditor}>
          <Plus className="h-4 w-4" />
          Create pack
        </Button>
      </header>

      {loadError ? (
        <LoadFailedState message={loadError} onRetry={() => setLoadKey((key) => key + 1)} />
      ) : <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3 bg-muted/70 p-1 sm:w-auto">
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          <DeckGrid
            decks={createdDecks}
            emptyTitle="No flashcard packs yet"
            emptyBody="Create your first pack, add questions, and decide if other students can use it."
            favoriteDeckIds={favoriteDeckIds}
            loading={loading}
            onCreate={openCreateEditor}
            deckCardCounts={deckCardCounts}
            createdCardsByDeck={createdCardsByDeck}
            onEdit={openEditEditor}
            onStudy={startStudy}
            onToggleFavorite={toggleFavorite}
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <DeckGrid
            decks={favoriteDecks}
            emptyTitle="No favorite packs yet"
            emptyBody="Use the heart button on a created or published pack to keep it here for faster studying."
            emptyIcon={Heart}
            deckCardCounts={deckCardCounts}
            createdCardsByDeck={createdCardsByDeck}
            favoriteDeckIds={favoriteDeckIds}
            loading={loading}
            onStudy={startStudy}
            onToggleFavorite={toggleFavorite}
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="published">
          <div className="mb-4 rounded-lg border border-border bg-card p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search published packs"
              />
            </div>
          </div>
          <DeckGrid
            decks={searchablePublishedDecks}
            emptyTitle={search.trim() ? "No published packs match your search" : "No published packs from your university yet"}
            emptyBody={search.trim() ? "Try another course, subject, or student name." : "Shared packs from other students at your university will show here once they are published."}
            emptyIcon={search.trim() ? Search : Layers3}
            deckCardCounts={deckCardCounts}
            createdCardsByDeck={createdCardsByDeck}
            favoriteDeckIds={favoriteDeckIds}
            loading={loading}
            onStudy={startStudy}
            onToggleFavorite={toggleFavorite}
            userId={user?.id}
          />
        </TabsContent>
      </Tabs>}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{deckForm.id ? "Edit flashcard pack" : "Create flashcard pack"}</DialogTitle>
            <DialogDescription>
              Set the pack name, choose a color, add question-answer cards, and publish it when it is useful for others.
            </DialogDescription>
          </DialogHeader>

          {editorLoading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Pack name">
                  <Input value={deckForm.name} onChange={(event) => updateDeckForm({ name: event.target.value })} placeholder="Calculus definitions" />
                </Field>
                <Field label="Course or subject">
                  <Input value={deckForm.subject} onChange={(event) => updateDeckForm({ subject: event.target.value })} placeholder="Calculus 2" />
                </Field>
                <Field label="Short description" className="sm:col-span-2">
                  <Textarea value={deckForm.description} onChange={(event) => updateDeckForm({ description: event.target.value })} placeholder="What this pack helps students review" />
                </Field>
              </div>

              <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">Pack color</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DECK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateDeckForm({ color })}
                        className={cn("h-9 w-9 rounded-full border-2 transition-transform hover:scale-105", deckForm.color === color ? "border-foreground" : "border-transparent")}
                        style={{ backgroundColor: color }}
                        aria-label={`Use color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-3">
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Make public</span>
                    <span className="block text-xs text-muted-foreground">Students at your university can use and favorite this pack.</span>
                  </span>
                  <Switch checked={deckForm.is_public} onCheckedChange={(checked) => updateDeckForm({ is_public: checked })} />
                </label>
              </div>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Questions</h3>
                    <p className="text-xs text-muted-foreground">Each card needs a question and an answer.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addCardRow}>
                    <Plus className="h-4 w-4" />
                    Add question
                  </Button>
                </div>

                <div className="space-y-3">
                  {deckForm.cards.map((card, index) => (
                    <div key={card._rowId} className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_1fr_44px]">
                      <Textarea
                        value={card.front}
                        onChange={(event) => updateCardRow(card._rowId, { front: event.target.value })}
                        placeholder={`Question ${index + 1}`}
                        aria-label={`Question ${index + 1}`}
                      />
                      <Textarea
                        value={card.back}
                        onChange={(event) => updateCardRow(card._rowId, { back: event.target.value })}
                        placeholder={`Answer ${index + 1}`}
                        aria-label={`Answer ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeCardRow(card._rowId)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button disabled={saving || editorLoading || !deckForm.name.trim()} onClick={saveDeck}>
              {saving ? "Saving..." : "Save pack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!studyDeck} onOpenChange={(open) => { if (!open) closeStudy(); }}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-border/80 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{studyDeck?.name || "Flashcards"}</DialogTitle>
            <DialogDescription>{studyDeck?.subject || "Click the card to flip it."}</DialogDescription>
          </DialogHeader>

          {studyLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : studyCards.length ? (
            <div className="rounded-[1.75rem] p-4 sm:p-8" style={{ backgroundColor: withAlpha(deckColor(studyDeck), "18") }}>
              <div className="relative mx-auto max-w-4xl">
                <div className="pointer-events-none absolute inset-x-8 top-5 h-full rotate-2 rounded-3xl bg-background/80 shadow-xl" />
                <div className="pointer-events-none absolute inset-x-4 top-2 h-full -rotate-1 rounded-3xl bg-background/70 shadow-lg" />
                <button
                  type="button"
                  onClick={() => setFlipped((current) => !current)}
                  className="relative z-10 flex min-h-[320px] w-full items-stretch rounded-2xl text-center outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Flip card"
                >
                  <div
                    className="relative h-full min-h-[320px] w-full transition-transform duration-500"
                    style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    <CardSide color={deckColor(studyDeck)}>{currentStudyCard.front}</CardSide>
                    <CardSide color={deckColor(studyDeck)} back>{currentStudyCard.back}</CardSide>
                  </div>
                </button>
              </div>

              <div className="relative z-20 mx-auto mt-6 grid max-w-4xl grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-3">
                <button
                  type="button"
                  onClick={() => moveStudy(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
                  style={{ backgroundColor: deckColor(studyDeck) }}
                  aria-label="Previous card"
                >
                  <PreviousIcon className="h-6 w-6" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Card {studyIndex + 1} of {studyCards.length}</p>
                  <Button type="button" variant="outline" className="mt-3 gap-2 rounded-full bg-background/90" onClick={randomizeStudy}>
                    <Shuffle className="h-4 w-4" />
                    Randomize
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => moveStudy(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
                  style={{ backgroundColor: deckColor(studyDeck) }}
                  aria-label="Next card"
                >
                  <NextIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="font-semibold text-foreground">This pack has no cards yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Add cards before using it.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function Field({ label, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function CardSide({ children, color, back = false }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-2xl border bg-background p-8 shadow-2xl"
      style={{
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : "rotateY(0deg)",
        borderColor: withAlpha(color, "55"),
      }}
      dir="auto"
    >
      <span className="max-w-2xl whitespace-pre-line text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
        {children}
      </span>
    </div>
  );
}

function DeckGrid({
  decks,
  deckCardCounts = {},
  createdCardsByDeck = {},
  emptyTitle,
  emptyBody,
  emptyIcon: EmptyIcon = Layers3,
  favoriteDeckIds,
  loading,
  onCreate,
  onEdit,
  onStudy,
  onToggleFavorite,
  userId,
}) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" />)}
      </div>
    );
  }

  if (!decks.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center">
        <EmptyIcon className="mx-auto h-9 w-9 text-muted-foreground" />
        <h2 className="mt-3 text-base font-bold text-foreground">{emptyTitle}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{emptyBody}</p>
        {onCreate && <Button className="mt-4 gap-2" onClick={onCreate}><Plus className="h-4 w-4" />Create pack</Button>}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          cardCount={deckCardCounts[deck.id] ?? deck.card_count ?? 0}
          cards={createdCardsByDeck[deck.id] || []}
          isFavorite={favoriteDeckIds.has(deck.id)}
          isOwner={deck.owner_user_id === userId}
          onEdit={onEdit}
          onStudy={onStudy}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function DeckCard({ deck, cardCount, cards = [], isFavorite, isOwner, onEdit, onStudy, onToggleFavorite }) {
  const color = deckColor(deck);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
      <div className="h-2.5" style={{ backgroundColor: color }} />
      <div className="flex min-h-48 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border" style={{ backgroundColor: withAlpha(color, "18"), borderColor: withAlpha(color, "33"), color }}>
            <Layers3 className="h-5 w-5" />
          </span>
          <div className="flex items-center gap-1">
            {deck.is_public && <span className="rounded-full border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground">Public</span>}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(deck)}
                className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-border", isFavorite ? "bg-rose-500/10 text-rose-500" : "text-muted-foreground hover:text-rose-500")}
                aria-label={isFavorite ? `Unfavorite ${deck.name}` : `Favorite ${deck.name}`}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 min-w-0 flex-1">
          <h2 className="line-clamp-2 text-base font-bold text-foreground" dir="auto">{deck.name}</h2>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{deck.subject || "Flashcard pack"}</p>
          {deck.description && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground" dir="auto">{deck.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
            <span className="rounded-full border border-border bg-background/60 px-2 py-1">{cardCount} cards</span>
            {!isOwner && <span>By {deck.owner_display_name || "Student"}</span>}
          </div>
          {isOwner && <OwnedCardsPreview cards={cards} cardCount={cardCount} />}
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => onStudy(deck)}>Use</Button>
          {isOwner && (
            <Button variant="outline" className="gap-2" onClick={() => onEdit(deck)}>
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function OwnedCardsPreview({ cards, cardCount }) {
  const visibleCards = cards.slice(0, 3);
  const remainingCount = Math.max(0, cardCount - visibleCards.length);

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Question preview</p>
      {visibleCards.length ? (
        <div className="mt-2 space-y-2">
          {visibleCards.map((card, index) => (
            <article key={card.id || card._rowId || `${card.front}-${index}`} className="rounded-md bg-background/70 p-2">
              <p className="line-clamp-1 text-xs font-semibold text-foreground" dir="auto">
                {index + 1}. {card.front}
              </p>
            </article>
          ))}
          {remainingCount > 0 && (
            <p className="text-xs font-medium text-muted-foreground">
              +{remainingCount} more {remainingCount === 1 ? "card" : "cards"} in this pack
            </p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No cards added yet.</p>
      )}
    </div>
  );
}
