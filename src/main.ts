import "./style.css";
import { parseCsv } from "./csv";
import {
  deleteCard,
  deleteDeck,
  getAllDecks,
  getCardsForDeck,
  getDeck,
  newCard,
  newId,
  saveCard,
  saveCards,
  saveDeck,
} from "./db";
import { seedIfNeeded } from "./seed";
import {
  applyGotIt,
  applyReviewAgain,
  deckStats,
  reinsertSoon,
  studyQueue,
  updateStreak,
} from "./srs";
import { DECK_COLORS, type Card, type Deck, type DeckColorId, type Route } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;

function parseRoute(): Route {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "new") return { name: "new-deck" };
  if (parts[0] === "deck" && parts[1] && parts[2] === "edit") return { name: "edit-deck", id: parts[1] };
  if (parts[0] === "deck" && parts[1]) return { name: "deck", id: parts[1] };
  if (parts[0] === "study" && parts[1]) return { name: "study", id: parts[1] };
  return { name: "home" };
}

function go(path: string): void {
  location.hash = path;
}

function colorValue(id: DeckColorId): string {
  return DECK_COLORS.find((c) => c.id === id)?.value ?? "#C4785A";
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statsHtml(stats: ReturnType<typeof deckStats>, color: string): string {
  return `
    <div class="stats">
      <div class="stat"><span class="n">${stats.total}</span><span class="l">Cards</span></div>
      <div class="stat"><span class="n">${stats.mastered}</span><span class="l">Mastered</span></div>
      <div class="stat"><span class="n">${stats.due}</span><span class="l">Due</span></div>
      <div class="stat"><span class="n">${stats.streak}</span><span class="l">Streak</span></div>
    </div>
    <div class="progress"><span style="width:${stats.masteryPercent}%;background:${color}"></span></div>
    <div class="progress-label"><span>Mastery</span><span>${stats.masteryPercent}%</span></div>
  `;
}

async function renderHome(): Promise<void> {
  const decks = await getAllDecks();
  const cardsByDeck = await Promise.all(decks.map((d) => getCardsForDeck(d.id)));

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <h1>ITE Cisco Flashcards</h1>
        <p>Spaced repetition for Infocomm students in Singapore — CCNA-aligned lab topics.</p>
      </div>
      <button class="btn btn-primary" data-go="#/new">New deck</button>
    </header>
    ${
      decks.length === 0
        ? `<div class="panel empty">No decks yet. Create one to start studying.</div>`
        : `<div class="deck-grid">${decks
            .map((deck, i) => {
              const stats = deckStats(deck, cardsByDeck[i]);
              const color = colorValue(deck.color);
              return `
                <button class="deck-card" data-go="#/deck/${deck.id}" style="animation-delay:${i * 40}ms">
                  <div class="accent" style="background:${color}"></div>
                  <div class="body">
                    <h2>${escapeHtml(deck.title)}</h2>
                    <p class="desc">${escapeHtml(deck.description)}</p>
                    ${statsHtml(stats, color)}
                  </div>
                </button>`;
            })
            .join("")}</div>`
    }
  `;
}

function deckForm(deck?: Deck): string {
  const color = deck?.color ?? "terracotta";
  return `
    <form class="form" id="deck-form">
      <label>Title
        <input name="title" required maxlength="80" value="${escapeHtml(deck?.title ?? "")}" placeholder="e.g. OSPF Lab Review" />
      </label>
      <label>Description
        <textarea name="description" maxlength="280" placeholder="What should this deck help you remember?">${escapeHtml(deck?.description ?? "")}</textarea>
      </label>
      <label>Color tag
        <div class="colors">
          ${DECK_COLORS.map(
            (c) => `
            <button type="button" class="color-dot${c.id === color ? " selected" : ""}" data-color="${c.id}"
              style="background:${c.value}" title="${c.label}" aria-label="${c.label}"></button>`,
          ).join("")}
        </div>
        <input type="hidden" name="color" value="${color}" />
      </label>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit">${deck ? "Save deck" : "Create deck"}</button>
        <button class="btn btn-ghost" type="button" data-go="#/">Cancel</button>
      </div>
    </form>
  `;
}

function bindDeckForm(existing?: Deck): void {
  const form = document.querySelector<HTMLFormElement>("#deck-form")!;
  const colorInput = form.querySelector<HTMLInputElement>('input[name="color"]')!;
  form.querySelectorAll<HTMLButtonElement>(".color-dot").forEach((btn) => {
    btn.addEventListener("click", () => {
      colorInput.value = btn.dataset.color ?? "terracotta";
      form.querySelectorAll(".color-dot").forEach((el) => el.classList.toggle("selected", el === btn));
    });
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const color = String(data.get("color") ?? "terracotta") as DeckColorId;
    if (!title) return;
    if (existing) {
      await saveDeck({ ...existing, title, description, color });
      go(`/deck/${existing.id}`);
    } else {
      const deck: Deck = {
        id: newId(),
        title,
        description,
        color,
        createdAt: Date.now(),
        lastStudiedAt: null,
        streak: 0,
        lastStreakDate: null,
      };
      await saveDeck(deck);
      go(`/deck/${deck.id}`);
    }
  });
}

async function renderNewDeck(): Promise<void> {
  app.innerHTML = `
    <a class="back-link" href="#/">← Home</a>
    <div class="panel">
      <h2>Create a deck</h2>
      <p class="muted">Give it a warm color tag so you can spot it on the home screen.</p>
      ${deckForm()}
    </div>
  `;
  bindDeckForm();
}

async function renderEditDeck(id: string): Promise<void> {
  const deck = await getDeck(id);
  if (!deck) {
    go("/");
    return;
  }
  app.innerHTML = `
    <a class="back-link" href="#/deck/${deck.id}">← ${escapeHtml(deck.title)}</a>
    <div class="panel">
      <h2>Edit deck</h2>
      ${deckForm(deck)}
    </div>
  `;
  bindDeckForm(deck);
}

async function renderDeck(id: string): Promise<void> {
  const deck = await getDeck(id);
  if (!deck) {
    go("/");
    return;
  }
  const cards = await getCardsForDeck(id);
  const stats = deckStats(deck, cards);
  const color = colorValue(deck.color);

  app.innerHTML = `
    <a class="back-link" href="#/">← All decks</a>
    <div class="panel">
      <div class="topbar" style="margin-bottom:12px">
        <div>
          <h2>${escapeHtml(deck.title)}</h2>
          <p class="muted">${escapeHtml(deck.description)}</p>
        </div>
        <div class="btn-row">
          <button class="btn btn-sage" data-go="#/study/${deck.id}" ${cards.length === 0 ? "disabled" : ""}>Study</button>
          <button class="btn btn-ghost" data-go="#/deck/${deck.id}/edit">Edit</button>
        </div>
      </div>
      ${statsHtml(stats, color)}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-primary" id="add-card">Add card</button>
        <button class="btn btn-ghost" id="import-cards">Import CSV</button>
        <button class="btn btn-warn" id="delete-deck">Delete deck</button>
      </div>
      <div class="card-list">
        ${
          cards.length === 0
            ? `<p class="muted">No cards yet. Add one or import a comma-separated list.</p>`
            : cards
                .map(
                  (c) => `
            <div class="card-item">
              <div>
                <div class="q">${escapeHtml(c.front)}</div>
                <div class="a">${escapeHtml(c.back)}</div>
              </div>
              <div class="btn-row">
                <button class="btn btn-ghost" data-edit-card="${c.id}">Edit</button>
                <button class="btn btn-ghost" data-del-card="${c.id}">Delete</button>
              </div>
            </div>`,
                )
                .join("")
        }
      </div>
    </div>
  `;

  document.getElementById("add-card")?.addEventListener("click", () => openCardModal(deck.id));
  document.getElementById("import-cards")?.addEventListener("click", () => openImportModal(deck.id));
  document.getElementById("delete-deck")?.addEventListener("click", async () => {
    if (!confirm(`Delete “${deck.title}” and all of its cards?`)) return;
    await deleteDeck(deck.id);
    go("/");
  });
  app.querySelectorAll<HTMLButtonElement>("[data-edit-card]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = cards.find((c) => c.id === btn.dataset.editCard);
      if (card) openCardModal(deck.id, card);
    });
  });
  app.querySelectorAll<HTMLButtonElement>("[data-del-card]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this card?")) return;
      await deleteCard(btn.dataset.delCard!);
      await render();
    });
  });
}

function mountModal(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "modal-bg";
  wrap.innerHTML = `<div class="modal">${html}</div>`;
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap) wrap.remove();
  });
  document.body.appendChild(wrap);
  return wrap;
}

function openCardModal(deckId: string, card?: Card): void {
  const wrap = mountModal(`
    <h2>${card ? "Edit card" : "Add card"}</h2>
    <form class="form" id="card-form">
      <label>Front (question)
        <textarea name="front" required>${escapeHtml(card?.front ?? "")}</textarea>
      </label>
      <label>Back (answer)
        <textarea name="back" required>${escapeHtml(card?.back ?? "")}</textarea>
      </label>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-ghost" type="button" id="cancel-modal">Cancel</button>
      </div>
    </form>
  `);
  wrap.querySelector("#cancel-modal")?.addEventListener("click", () => wrap.remove());
  wrap.querySelector("#card-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const front = String(data.get("front") ?? "").trim();
    const back = String(data.get("back") ?? "").trim();
    if (card) await saveCard({ ...card, front, back });
    else await saveCard(newCard(deckId, front, back));
    wrap.remove();
    await render();
  });
}

function openImportModal(deckId: string): void {
  const wrap = mountModal(`
    <h2>Import cards</h2>
    <p class="hint">One card per line: <code>question,answer</code>. Use quotes if a field contains a comma.</p>
    <form class="form" id="import-form">
      <label>Comma-separated text
        <textarea name="csv" required placeholder="What is a VLAN?,A broadcast domain on a switch&#10;SSH vs Telnet?,SSH encrypts the session"></textarea>
      </label>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit">Import</button>
        <button class="btn btn-ghost" type="button" id="cancel-modal">Cancel</button>
      </div>
    </form>
  `);
  wrap.querySelector("#cancel-modal")?.addEventListener("click", () => wrap.remove());
  wrap.querySelector("#import-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const csv = String(new FormData(form).get("csv") ?? "");
    const rows = parseCsv(csv);
    if (rows.length === 0) {
      alert("No valid rows found. Use question,answer on each line.");
      return;
    }
    await saveCards(rows.map((r) => newCard(deckId, r.front, r.back)));
    wrap.remove();
    await render();
  });
}

async function renderStudy(id: string): Promise<void> {
  const deck = await getDeck(id);
  if (!deck) {
    go("/");
    return;
  }
  const cards = await getCardsForDeck(id);
  let queue = studyQueue(cards);
  let index = 0;
  let reviewed = 0;

  const revealAnswer = () => {
    document.getElementById("flashcard")?.classList.add("flipped");
    const actions = document.querySelector(".study-actions");
    if (!actions) return;
    actions.innerHTML = `
      <button class="btn btn-sage" id="got-it">Got it</button>
      <button class="btn btn-warn" id="again">Review again</button>
    `;
    document.getElementById("got-it")?.addEventListener("click", () => void grade(true));
    document.getElementById("again")?.addEventListener("click", () => void grade(false));
  };

  const paint = () => {
    const current = queue[index];
    app.innerHTML = `
      <a class="back-link" href="#/deck/${deck.id}">← ${escapeHtml(deck.title)}</a>
      <div class="study-wrap">
        <div class="study-meta">${!current ? "Session complete" : `${index + 1} of ${queue.length} due`} · streak ${deck.streak} day${deck.streak === 1 ? "" : "s"}</div>
        ${
          !current
            ? `<div class="panel empty">
                <h2>Nice work</h2>
                <p>No cards are due right now. Spaced repetition will bring them back when they need review.</p>
                <button class="btn btn-primary" data-go="#/deck/${deck.id}">Back to deck</button>
              </div>`
            : `
          <div class="flashcard" id="flashcard">
            <div class="flashcard-inner">
              <div class="face front">
                <div class="tag">Question</div>
                <p>${escapeHtml(current.front)}</p>
              </div>
              <div class="face back">
                <div class="tag">Answer</div>
                <p>${escapeHtml(current.back)}</p>
              </div>
            </div>
          </div>
          <div class="study-actions">
            <button class="btn btn-primary" id="reveal">Show answer</button>
          </div>`
        }
      </div>
    `;

    document.getElementById("reveal")?.addEventListener("click", revealAnswer);
    document.getElementById("flashcard")?.addEventListener("click", (event) => {
      if ((event.currentTarget as HTMLElement).classList.contains("flipped")) return;
      revealAnswer();
    });
  };

  const grade = async (correct: boolean) => {
    const current = queue[index];
    if (!current) return;
    const updated = correct ? applyGotIt(current) : applyReviewAgain(current);
    await saveCard(updated);
    if (reviewed === 0) {
      const nextDeck = updateStreak(deck);
      Object.assign(deck, nextDeck);
      await saveDeck(deck);
    }
    reviewed += 1;
    if (correct) {
      index += 1;
    } else {
      const rest = queue.slice(index + 1);
      queue = reinsertSoon(rest, updated);
      index = 0;
    }
    paint();
  };

  paint();
}

async function render(): Promise<void> {
  const route = parseRoute();
  if (route.name === "home") await renderHome();
  else if (route.name === "new-deck") await renderNewDeck();
  else if (route.name === "edit-deck") await renderEditDeck(route.id);
  else if (route.name === "deck") await renderDeck(route.id);
  else if (route.name === "study") await renderStudy(route.id);
}

app.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
  if (!target) return;
  const href = target.getAttribute("data-go");
  if (href) {
    e.preventDefault();
    location.hash = href.replace(/^#/, "");
  }
});

window.addEventListener("hashchange", () => void render());

void (async () => {
  await seedIfNeeded();
  await render();
})();
