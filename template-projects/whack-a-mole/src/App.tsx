import { useMemo, useState } from "react";
import GamePage from "./components/GamePage";
import type { Question } from "./type";

const data : Question[] = [
  {
    groupId: 1,
    question: "Con chuột đang ở vị trí nào?",
    questionImage: "./images/toupeira6.svg",
    answerText: "Dưới đất",
    answerImage: "./images/toupeira6.svg"
  },
  {
    groupId: 2,
    question: "Con chuột đang ở vị trí nào?",
    questionImage: "./images/toupeira3.svg",
    answerText: "Trên mặt đất",
    answerImage: "./images/toupeira3.svg"
  },
  {
    groupId: 3,
    question: "Con chuột đang ở vị trí nào?",
    questionImage: "./images/toupeira2.svg",
    answerText: "Nửa trên nửa dưới",
    answerImage: "./images/toupeira2.svg"
  }
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [realData] = useState(() => window.APP_DATA ? window.APP_DATA : data)

  // 👉 tạo pool answers dùng chung
  const answerPool = useMemo(() => {
    return realData.map(item => ({
      groupId: item.groupId,
      text: item.answerText,
      image: item.answerImage
    }));
  }, []);

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev + 1 >= realData.length) return 0; // loop lại nếu muốn
      return prev + 1;
    });
  };

  const currentQuestion = realData[currentIndex];

  return (
    <GamePage
      currentIndex={currentIndex}
      key={currentQuestion.groupId} // 🔥 reset game mỗi câu
      question={currentQuestion}
      answerPool={answerPool}
      onCorrect={handleNext}
    />
  );
}

export default App
