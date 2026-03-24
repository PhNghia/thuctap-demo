import { canPlaceWord } from "./canPlaceWord";

export function placeWord(grid, word, maxAttempts = 100) {

  const directions = [
    [1,0],[-1,0],[0,1],[0,-1],
    [1,1],[-1,1],[1,-1],[-1,-1]
  ];

  const size = grid.length;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {

    const [dx, dy] =
      directions[Math.floor(Math.random()*directions.length)];

    const row = Math.floor(Math.random()*size);
    const col = Math.floor(Math.random()*size);

    if (canPlaceWord(grid, word, row, col, dx, dy)) {

      const positions = [];

      for (let i = 0; i < word.length; i++) {

        const r = row + dy*i;
        const c = col + dx*i;

        grid[r][c] = word[i];

        positions.push({ row: r, col: c });
      }

      return { word, row, col, dx, dy, positions };
    }

  }

  return null;
}