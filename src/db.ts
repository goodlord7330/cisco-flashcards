import type { Card, Deck } from "./types";

const DB_NAME = "ite-cisco-flashcards";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("decks")) {
        db.createObjectStore("decks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cards")) {
        const cards = db.createObjectStore("cards", { keyPath: "id" });
        cards.createIndex("deckId", "deckId", { unique: false });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function req<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getMeta(key: string): Promise<string | undefined> {
  const db = await openDb();
  const value = await req<{ key: string; value: string } | undefined>(
    db.transaction("meta").objectStore("meta").get(key),
  );
  db.close();
  return value?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("meta", "readwrite");
  tx.objectStore("meta").put({ key, value });
  await txDone(tx);
  db.close();
}

export async function getAllDecks(): Promise<Deck[]> {
  const db = await openDb();
  const decks = await req<Deck[]>(db.transaction("decks").objectStore("decks").getAll());
  db.close();
  return decks.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const db = await openDb();
  const deck = await req<Deck | undefined>(db.transaction("decks").objectStore("decks").get(id));
  db.close();
  return deck;
}

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("decks", "readwrite");
  tx.objectStore("decks").put(deck);
  await txDone(tx);
  db.close();
}

export async function deleteDeck(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(["decks", "cards"], "readwrite");
  tx.objectStore("decks").delete(id);
  const index = tx.objectStore("cards").index("deckId");
  const cards = await req<Card[]>(index.getAll(id));
  for (const card of cards) {
    tx.objectStore("cards").delete(card.id);
  }
  await txDone(tx);
  db.close();
}

export async function getCardsForDeck(deckId: string): Promise<Card[]> {
  const db = await openDb();
  const cards = await req<Card[]>(
    db.transaction("cards").objectStore("cards").index("deckId").getAll(deckId),
  );
  db.close();
  return cards.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getCard(id: string): Promise<Card | undefined> {
  const db = await openDb();
  const card = await req<Card | undefined>(db.transaction("cards").objectStore("cards").get(id));
  db.close();
  return card;
}

export async function saveCard(card: Card): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("cards", "readwrite");
  tx.objectStore("cards").put(card);
  await txDone(tx);
  db.close();
}

export async function saveCards(cards: Card[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("cards", "readwrite");
  for (const card of cards) {
    tx.objectStore("cards").put(card);
  }
  await txDone(tx);
  db.close();
}

export async function deleteCard(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("cards", "readwrite");
  tx.objectStore("cards").delete(id);
  await txDone(tx);
  db.close();
}

export function newId(): string {
  return crypto.randomUUID();
}

export function newCard(deckId: string, front: string, back: string): Card {
  const now = Date.now();
  return {
    id: newId(),
    deckId,
    front,
    back,
    interval: 0,
    ease: 2.5,
    repetitions: 0,
    nextReview: now,
    lapses: 0,
    createdAt: now,
  };
}
