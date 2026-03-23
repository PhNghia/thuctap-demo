export function createGrid(size) {
  return Array.from({ length: size }, () =>
    Array(size).fill("")
  );
}