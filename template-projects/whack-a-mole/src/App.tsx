import { useEffect, useMemo, useState } from "react";
import GamePage from "./components/GamePage";
import GameControls from "./components/GameControls";
import GuideModal from "./components/GuideModal";
import { data, soundFiles } from "./constants";
import HammerCursor from "./components/HammerCursor";
import GameCompleteModal from "./components/GameCompleteModal";
import type { Answer, AnswerPool, typeGame } from "./type";
import audioManagerInstance from "./utils/AudioManager-v2";

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
   audioManagerInstance.loadSounds({
    bgMusic: soundFiles.bgMusic,
    hit: soundFiles.hit,
    dizzy: soundFiles.dizzy,
    buzz: soundFiles.buzz
   })
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioManagerInstance.playBg('bgMusic', 0.3);
    } else {
      audioManagerInstance.pauseBg();
    }
  }, [isPlaying]);

  const realData = useMemo(() => {
    return window.APP_DATA ? window.APP_DATA : data;
  }, []);

  // 👉 tạo pool answers dùng chung
  const answerPool: AnswerPool = useMemo(() => {
    const onlyText: string[] = [];
    const onlyImage: string[] = [];
    const all: Answer[] = [];
    for (let item of realData) {
      if (item.answerText) {
        onlyText.push(item.answerText);
      }
      if (item.answerImage) {
        onlyImage.push(item.answerImage);
      }
      all.push({
        groupId: item.groupId,
        text: item.answerText,
        image: item.answerImage
      });
    }
    let type: typeGame;
    if (onlyImage.length > 0 && onlyText.length > 0) {
      type = 'all';
    } else if (onlyImage.length === 0) {
      type = 'onlyText';
    } else {
      type = 'onlyImage';
    }
    return { all, onlyText, onlyImage, type };
  }, []);

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev + 1 >= realData.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        return prev; // giữ nguyên
      }
      return prev + 1;
    });
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setIsPlaying(true);
    setCurrentIndex(0);
  };

  const currentQuestion = realData[currentIndex];

  return (
    <>
      {!isPlaying && <div className="modal-overlay" style={{ zIndex: 5 }} />}

      <HammerCursor />

      <GameControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(p => !p)}
        onRestart={handleRestart}
        onOpenGuide={() => {
          setIsPlaying(false)
          setShowGuide(true)
        }}
      />

      <GamePage
        currentIndex={currentIndex}
        key={currentQuestion.groupId} // 🔥 reset game mỗi câu
        question={currentQuestion}
        answerPool={answerPool}
        onCorrect={handleNext}
        isPlaying={isPlaying}
      />

      <GuideModal
        open={showGuide}
        onClose={() => {
          setShowGuide(false)
        }}
      />

      <GameCompleteModal
        open={isCompleted}
        onRestart={handleRestart}
      />
    </>
  );
}

export default App
