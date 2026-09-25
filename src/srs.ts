import type { Card, Deck, DeckStats } from "./types";

const MASTERED_INTERVAL_DAYS = 14;
const MASTERED_REPS = 3;

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

function yesterdayKey(): string {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

export function isMastered(card: Card): boolean {
  return card.interval >= MASTERED_INTERVAL_DAYS && card.repetitions >= MASTERED_REPS;
}

export function isDue(card: Card, now = Date.now()): boolean {
  return card.nextReview <= now;
}

export function deckStats(deck: Deck, cards: Card[], now = Date.now()): DeckStats {
  const total = cards.length;
  const mastered = cards.filter(isMastered).length;
  const due = cards.filter((c) => isDue(c, now)).length;
  return {
    total,
    mastered,
    due,
    streak: deck.streak,
    masteryPercent: total === 0 ? 0 : Math.round((mastered / total) * 100),
  };
}

export function applyGotIt(card: Card, now = Date.now()): Card {
  const repetitions = card.repetitions + 1;
  let interval: number;
  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 3;
  else interval = Math.max(1, Math.round(card.interval * card.ease));

  const ease = Math.min(3.2, card.ease + 0.08);
  const nextReview = addDays(new Date(now), interval).getTime();

  return { ...card, repetitions, interval, ease, nextReview };
}

export function applyReviewAgain(card: Card, now = Date.now()): Card {
  return {
    ...card,
    repetitions: 0,
    interval: 0,
    ease: Math.max(1.3, card.ease - 0.2),
    lapses: card.lapses + 1,
    nextReview: now,
  };
}

export function updateStreak(deck: Deck, now = Date.now()): Deck {
  const today = todayKey(new Date(now));
  if (deck.lastStreakDate === today) {
    return { ...deck, lastStudiedAt: now };
  }
  const streak = deck.lastStreakDate === yesterdayKey() ? deck.streak + 1 : 1;
  return {
    ...deck,
    streak,
    lastStreakDate: today,
    lastStudiedAt: now,
  };
}

export function studyQueue(cards: Card[], now = Date.now()): Card[] {
  const due = cards.filter((c) => isDue(c, now));
  due.sort((a, b) => {
    const lapseDiff = b.lapses - a.lapses;
    if (lapseDiff !== 0) return lapseDiff;
    const intervalDiff = a.interval - b.interval;
    if (intervalDiff !== 0) return intervalDiff;
    return a.nextReview - b.nextReview;
  });
  return due;
}

export function reinsertSoon(queue: Card[], card: Card): Card[] {
  const rest = queue.filter((c) => c.id !== card.id);
  const offset = Math.min(rest.length, 2 + Math.floor(Math.random() * 2));
  const next = [...rest];
  next.splice(offset, 0, card);
  return next;
}
