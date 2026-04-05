export type Question = {
  groupId: number;
  question: string;
  questionImage?: string,
  answerText?: string;
  answerImage?: string;
};

type ClassId = "1" | "2" | "3" | "4" | "5";

export type GameData = {
  title: string;
  class: ClassId,
  questions: Question[];
}

export type Answer = {
  groupId: number;
  text?: string;
  image?: string;
};

export type typeGame = 'all' | 'onlyText' | 'onlyImage';

export type AnswerPool = {
  all: Answer[];
  onlyText: string[];
  onlyImage: string[];
  type: typeGame;
}

export type RoundAnswer = Answer & {
  correct: boolean;
};

declare global {
  interface Window {
    APP_DATA: GameData; // 👈 tạm thời dùng any
  }
}