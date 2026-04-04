import type { GameConfig } from "../types/objects";

const DEFAULT_DATA: GameConfig = {
  minTotalPairs: 2,
  items: [
    { id: "cat", image: "🐱", keyword: "CAT", minPairs: 1 },
    { id: "dog", image: "🐶", keyword: "DOGGOGOGOGOGOG BFKBKJDBSK FSNJFKJSB", minPairs: 1 },
  ],
};

// --- Dữ liệu mẫu ---
export const MY_APP_DATA: GameConfig =
  import.meta.env.PROD &&
  typeof window !== "undefined" &&
  (window as Window & typeof globalThis & { MY_APP_DATA: GameConfig })[
    "MY_APP_DATA"
  ]
    ? (
        window as Window &
          typeof globalThis & {
            MY_APP_DATA: GameConfig;
          }
      )["MY_APP_DATA"]
    : DEFAULT_DATA;
