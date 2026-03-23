import { createGrid } from "./createGrid";
import { placeWord } from "./placeWord";
import { fillRandom } from "./fillRandom";
export function generateWordSearch(words, size = 12) {

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("Words must be a non-empty array");
  }

  const grid = createGrid(size);
  const placements = [];

  // đặt từ dài trước để giảm fail
  const sortedWords = [...words]
    .map(w => w.toUpperCase())
    .sort((a, b) => b.length - a.length);

  sortedWords.forEach(word => {

    const placement = placeWord(grid, word);

    if (placement) {
      placements.push(placement);
    } else {
      console.warn(`Cannot place word: ${word}`);
    }

  });

  fillRandom(grid);

  return {
    grid,
    placements
  };

}