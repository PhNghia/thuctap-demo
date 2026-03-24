import type { CardState, GameConfig } from "../types/objects";

// ─── Grid Algorithm ───────────────────────────────────────────────────────────
export function getOptimalGrid(totalCards: number): {
  rows: number;
  cols: number;
} {
  // Must be even number
  const n = totalCards % 2 === 0 ? totalCards : totalCards + 1;
  // Try to get a rectangle as square as possible, max ratio 2:1
  let bestRows = 2,
    bestCols = n / 2;
  let bestScore = Infinity;
  for (let rows = 2; rows <= n; rows++) {
    if (n % rows !== 0) continue;
    const cols = n / rows;
    if (cols < rows) break;
    const ratio = cols / rows;
    const score = Math.abs(ratio - 1.5); // target ~3:2 ratio
    if (score < bestScore) {
      bestScore = score;
      bestRows = rows;
      bestCols = cols;
    }
  }
  return { rows: bestRows, cols: bestCols };
}

export function buildDeck(config: GameConfig): CardState[] {
  const { items, minTotalPairs = 4 } = config;

  // Step 1: For each item, determine how many pairs it contributes
  const pairCounts: Map<string, number> = new Map();
  for (const item of items) {
    pairCounts.set(item.id, item.minPairs ?? 1);
  }

  // Step 2: Sum pairs
  let totalPairs = Array.from(pairCounts.values()).reduce((a, b) => a + b, 0);

  // Step 3: Ensure at least minTotalPairs (2 pairs = 4 cards minimum)
  const effectiveMin = Math.max(minTotalPairs, 2);
  while (totalPairs < effectiveMin) {
    // Add pairs from items round-robin
    for (const item of items) {
      if (totalPairs >= effectiveMin) break;
      pairCounts.set(item.id, (pairCounts.get(item.id) ?? 1) + 1);
      totalPairs++;
    }
  }

  // Step 4: totalCards = totalPairs * 2; find grid
  let totalCards = totalPairs * 2;
  let grid = getOptimalGrid(totalCards);

  // Step 5: Make sure totalCards fills the grid
  const needed = grid.rows * grid.cols;
  if (needed > totalCards) {
    const extraPairs = (needed - totalCards) / 2;
    for (let i = 0; i < extraPairs; i++) {
      const item = items[i % items.length];
      pairCounts.set(item.id, (pairCounts.get(item.id) ?? 1) + 1);
    }
    totalCards = needed;
    // recalculate grid since total changed
    grid = getOptimalGrid(totalCards);
  }

  // Step 6: Build card array
  const cards: CardState[] = [];
  for (const item of items) {
    const count = pairCounts.get(item.id) ?? 1;
    for (let p = 0; p < count; p++) {
      for (let side = 0; side < 2; side++) {
        cards.push({
          uid: `${item.id}-p${p}-s${side}-${Math.random().toString(36).slice(2)}`,
          itemId: item.id,
          image: item.image,
          keyword: item.keyword,
          isFlipped: false,
          isMatched: false,
          pairIndex: p,
        });
      }
    }
  }

  // Step 7: Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function isEmoji(str: string) {
  if (!str) return false;

  const s = str.trim();

  // 1. If it looks like an image source → NOT emoji
  if (
    s.startsWith("http") ||
    s.startsWith("data:") ||
    s.startsWith("file:") ||
    s.startsWith("/") ||
    s.startsWith("./") ||
    s.startsWith("../") ||
    /^[a-zA-Z]:\\/.test(s) || // Windows path (C:\...)
    /\.(png|jpe?g|gif|webp|svg)$/i.test(s)
  ) {
    return false;
  }

  // 2. If it's short and contains emoji-like unicode → treat as emoji
  // This uses Unicode property for emojis
  const emojiRegex = /\p{Extended_Pictographic}/u;

  return s.length <= 4 && emojiRegex.test(s);
}
