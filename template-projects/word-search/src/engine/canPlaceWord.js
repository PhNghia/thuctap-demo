export function canPlaceWord(grid, word, row, col, dx, dy) {

  const size = grid.length;

  // kiểm tra điểm cuối trước để tránh loop vô ích
  const endRow = row + dy * (word.length - 1);
  const endCol = col + dx * (word.length - 1);

  if (
    endRow < 0 || endRow >= size ||
    endCol < 0 || endCol >= size
  ) {
    return false;
  }

  for (let i = 0; i < word.length; i++) {

    const r = row + dy * i;
    const c = col + dx * i;

    const cell = grid[r][c];

    if (cell !== "" && cell !== word[i]) {
      return false;
    }

  }

  return true;
}