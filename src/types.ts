export const DECK_COLORS = [
  { id: "terracotta", value: "#C4785A", label: "Terracotta" },
  { id: "sage", value: "#7D8B6A", label: "Sage" },
  { id: "clay", value: "#D4A574", label: "Clay" },
  { id: "dusk", value: "#A67C6D", label: "Dusk" },
  { id: "olive", value: "#6B7F5A", label: "Olive" },
  { id: "sand", value: "#C4A484", label: "Sand" },
  { id: "amber", value: "#B8895C", label: "Amber" },
] as const;

export type DeckColorId = (typeof DECK_COLORS)[number]["id"];

export interface Deck {
  id: string;
  title: string;
  description: string;
  color: DeckColorId;
  createdAt: number;
  lastStudiedAt: number | null;
  streak: number;
  lastStreakDate: string | null;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  interval: number;
  ease: number;
  repetitions: number;
  nextReview: number;
  lapses: number;
  createdAt: number;
}

export interface DeckStats {
  total: number;
  mastered: number;
  due: number;
  streak: number;
  masteryPercent: number;
}

export type Route =
  | { name: "home" }
  | { name: "deck"; id: string }
  | { name: "study"; id: string }
  | { name: "new-deck" }
  | { name: "edit-deck"; id: string };
