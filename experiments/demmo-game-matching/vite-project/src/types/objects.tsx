// types.ts
export interface CardData {
  imageUrl: string;
  keyword: string;
}

export interface GameCard extends CardData {
  id: string;
  matched: boolean;
  flipped: boolean;
}

export type MessageType = "success" | "error";
