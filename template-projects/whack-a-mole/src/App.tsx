import { useEffect, useMemo, useState, useRef } from "react";
import GamePage from "./components/GamePage";
import GameControls from "./components/GameControls";
import GuideModal from "./components/GuideModal";
import { data, soundFiles } from "./constants";
import HammerCursor from "./components/HammerCursor";
import GameCompleteModal from "./components/GameCompleteModal";
import type { Answer, AnswerPool, typeGame } from "./type";
import audioManagerInstance from "./utils/AudioManager-v2";
import StartScreen from "./components/StartScreen";

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isStarted, setIsStarted] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);

  const appRef = useRef<HTMLDivElement | null>(null);
  const hasIntroPlayed = useRef(false);

  useEffect(() => {
    audioManagerInstance.loadSounds({
      bgMusic: soundFiles.bgMusic,
      hit: soundFiles.hit,
      dizzy: soundFiles.dizzy,
      buzz: soundFiles.buzz
    })

    const el = appRef.current;
    if (!el) return;

    const handleEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      if (hasIntroPlayed.current) return; // 👈 chặn

      hasIntroPlayed.current = true;
      setIsIntroDone(true);
      setIsPlaying(true);
      audioManagerInstance.playBg('bgMusic', 0.3);
    };

    el.addEventListener("transitionend", handleEnd);

    return () => {
      el.removeEventListener("transitionend", handleEnd);
    };
  }, []);

  const APP_DATA = useMemo(() => {
    if (window.APP_DATA) {
      const { title, class: classId } = window.APP_DATA;
      if (!title) {
        window.APP_DATA.title = data.title;
      }
      if (!classId) {
        window.APP_DATA.class = data.class;
      }
    }
    return window.APP_DATA ? window.APP_DATA : data;
  }, []);

  // 👉 tạo pool answers dùng chung
  const answerPool: AnswerPool = useMemo(() => {
    const onlyText: string[] = [];
    const onlyImage: string[] = [];
    const all: Answer[] = [];
    for (let item of APP_DATA.questions) {
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
      if (prev + 1 >= APP_DATA.questions.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        return prev; // giữ nguyên
      }
      return prev + 1;
    });
  };

  const handleStart = () => {
    setIsStarted(true);

    // delay 1 frame để trigger animation
    requestAnimationFrame(() => {
      setIsEntering(true);
    });
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setIsPlaying(true);
    setCurrentIndex(0);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioManagerInstance.unmuteBg()
    } else {
      audioManagerInstance.muteBg()
    }
    setIsMuted(prev => !prev);
  }

  const currentQuestion = APP_DATA.questions[currentIndex];

  return (
    <>
      {!isStarted && (
        <>
          <StartScreen
            classId={APP_DATA.class}
            title={APP_DATA.title}
            onStart={handleStart}
            onOpenGuide={() => setShowGuide(true)}
          />
          <GuideModal
            isStarted={isStarted}
            open={showGuide}
            onClose={() => {
              setShowGuide(false)
            }}
          />
        </>
      )}

      <div className={`scene ${isEntering ? "enter" : ""}`}>
        <div className="left layer" />
        <div className="right layer" />
        <div className="bottom layer" />
        <div className={`app ${isEntering ? "enter" : ""}`} ref={appRef}>
          {isStarted && (
            <>
              {!isPlaying && isIntroDone && (<div className="modal-overlay" style={{ zIndex: 5 }} />)}
              <div className="top layer" />

              <HammerCursor />

              <GameControls
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={() => setIsPlaying(prev => !prev)}
                onRestart={handleRestart}
                onOpenGuide={() => {
                  setIsPlaying(false)
                  setShowGuide(true)
                }}
                onToggleMute={handleToggleMute}
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
          )}
        </div>
      </div>
    </>
  );
}

export default App
