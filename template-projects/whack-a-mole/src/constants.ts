import type { GameData } from './type'

export const data: GameData = {
  title: "Free Style",
  class:  (["1", "2", "3", "4", "5"] as const)[Math.floor(Math.random() * 5)],
  questions: [
    {
      groupId: 1,
      question: "Con chuột đang ở vị trí nào?",
      questionImage: "./assets/images/toupeira6.svg",
      answerText: "Dưới đất",
      answerImage: "./assets/images/toupeira6.svg"
    },
    {
      groupId: 2,
      question: "Con chuột đang ở vị trí nào?",
      questionImage: "./assets/images/toupeira3.svg",
      answerText: "Trên mặt đất",
      // answerImage: "./assets/images/toupeira3.svg"
    },
    {
      groupId: 3,
      question: "Con chuột đang ở vị trí nào? Trông như có thể lên cũng có thể xuống!",
      // questionImage: "./assets/images/toupeira2.svg",
      // answerText: "Nửa trên nửa dưới",
      answerImage: "./assets/images/toupeira2.svg"
    },
    {
      groupId: 4,
      question: "Hope",
      questionImage: "./assets/images/mascots/Hope.png",
      answerText: "Hope",
      answerImage: "./assets/images/mascots/Hope.png"
    },
    {
      groupId: 5,
      question: "icon",
      questionImage: "./assets/images/icons/32x32.png",
      answerText: "icon",
      answerImage: "./assets/images/icons/32x32.png"
    },
    {
      groupId: 6,
      question: "Chicky",
      // questionImage: "./assets/images/toupeira2.svg",
      // answerText: "Nửa trên nửa dưới",
      answerImage: "./assets/images/mascots/Chicky.png"
    }
  ]
};

export const guidelinePages = [
  {
    text: "Cặp đáp án chính xác",
    image: "./assets/images/guide-1.png"
  },
  {
    text: "Nổi giận",
    image: "./assets/images/guide-2.png"
  },
  {
    text: "Bắt được rồi",
    image: "./assets/images/guide-3.png"
  }
];

export const soundFiles = {
  hit: "./assets/sounds/hit.ogg",
  bgMusic: "./assets/sounds/happy.mp3",
  dizzy: "./assets/sounds/dizzy.wav",
  buzz: "./assets/sounds/buzz.wav"
}

export const guideMascots = {
  "1": {
    name: "Tớ là Chicky",
    intro: "Tớ sẽ dẫn các cậu tham gia trò chơi của hôm nay nhé!",
    outro: "Các câu chơi rất cừ đấy nhé",
    catch: "Bắt được rồi!",
    src: "./assets/images/mascots/Chicky.png",
    theme: {
      bg: "linear-gradient(180deg, #FFF3A3, #AEE2FF)",
      primary: "#FFB800",
      text: "#5A3E00",
      button: "#FF9F1C"
    }
  },
  "2": {
    name: "Tớ là Kitty",
    intro: "Tớ sẽ dẫn các cậu tham gia trò chơi của hôm nay nhé!",
    outro: "Các câu chơi rất cừ đấy nhé",
    catch: "Bắt được rồi!",
    src: "./assets/images/mascots/Kitty.png",
    theme: {
      bg: "linear-gradient(180deg, #FFE0B2, #FFF3E0)",
      primary: "#FF9800",
      text: "#4E342E",
      button: "#FB8C00"
    }
  },
  "3": {
    name: "Tớ là Greenie",
    intro: "Tớ sẽ dẫn các cậu tham gia trò chơi của hôm nay nhé!",
    outro: "Các câu chơi rất cừ đấy nhé",
    catch: "Bắt được rồi!",
    src: "./assets/images/mascots/Greenie.png",
    theme: {
      bg: "linear-gradient(180deg, #C8F7C5, #E8FFF3)",
      primary: "#4CAF50",
      text: "#1B5E20",
      button: "#66BB6A"
    }
  },
  "4": {
    name: "Tớ là Gabriel",
    intro: "Tớ sẽ dẫn các cậu tham gia trò chơi của hôm nay nhé!",
    outro: "Các câu chơi rất cừ đấy nhé",
    catch: "Bắt được rồi!",
    src: "./assets/images/mascots/Gabriel.png",
    theme: {
      bg: "linear-gradient(180deg, #DFFFD6, #FFF5CC)",
      primary: "#8BC34A",
      text: "#2E4A1F",
      button: "#FFC107"
    }
  },
  "5": {
    name: "Tớ là Hope",
    intro: "Tớ sẽ dẫn các cậu tham gia trò chơi của hôm nay nhé!",
    outro: "Các câu chơi rất cừ đấy nhé",
    catch: "Bắt được rồi!",
    src: "./assets/images/mascots/Hope.png",
    theme: {
      bg: "linear-gradient(180deg, #CDEBFF, #F0F8FF)",
      primary: "#2196F3",
      text: "#0D3B66",
      button: "#42A5F5"
    }
  }
}