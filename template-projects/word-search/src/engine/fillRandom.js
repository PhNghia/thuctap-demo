export function fillRandom(grid, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {

  for (let r = 0; r < grid.length; r++) {

    for (let c = 0; c < grid[r].length; c++) {

      if (grid[r][c] === "") {
        grid[r][c] = randomLetter(alphabet);
      }

    }

  }

}

function randomLetter(alphabet) {

  const index = Math.floor(Math.random() * alphabet.length);
  return alphabet[index];

}