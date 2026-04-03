import { useEffect, useRef, useState } from "react";
import Hole from "./Hole";
import type { Question, RoundAnswer, AnswerPool } from "../type";
import audioManagerInstance from "../utils/AudioManager-v2";

const TOTAL = 10;

type Props = {
  currentIndex: number,
  question: Question;
  answerPool: AnswerPool;
  onCorrect: () => void;
  isPlaying: boolean
};

export default function GamePage({
  currentIndex,
  question,
  answerPool,
  onCorrect,
  isPlaying
}: Props) {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const [goingDown, setGoingDown] = useState<number[]>([]);
  const [holeData, setHoleData] = useState<Record<number, RoundAnswer>>({});
  const [hitState, setHitState] = useState<Record<number, "correct" | "wrong">>({});
  const hasCorrectInCycle = useRef(false);

  const prevIndexes = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const roundTimeRef = useRef<number>(0);

  // 👉 thêm cho 3 lượt
  const roundRef = useRef(0);
  const mustHaveCorrectRound = useRef(
    Math.floor(Math.random() * 3) + 1
  );

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  const createTimeoutRef = (indexes: number[], delay?: number) => {
    clearTimeoutRef();

    timeoutRef.current = setTimeout(() => {
      autoHideMoles(indexes);
    }, delay ?? roundTimeRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return

    autoHideMoles(activeIndexes);

    return () => {
      clearTimeoutRef();
    }
  }, [isPlaying]);

  const generateAnswers = (count: number, forceCorrect = false): RoundAnswer[] => {
    const correct: RoundAnswer = {
      groupId: question.groupId,
      text: question.answerText,
      image: question.answerImage,
      correct: true
    };

    const otherPool = answerPool.all.filter(
      a => a.groupId !== question.groupId
    );

    const result: RoundAnswer[] = [];
    const used = new Set<string>();

    const getKey = (a: RoundAnswer) => `${a.text}||${a.image}`;

    if (forceCorrect) {
      result.push(correct);
      used.add(getKey(correct));
    }

    while (result.length < count) {
      let candidate: RoundAnswer | null = null;
      const pick = otherPool[Math.floor(Math.random() * otherPool.length)];
      candidate = { ...pick, correct: false };
      const key = getKey(candidate);
      if (used.has(key)) continue;

      used.add(key);
      result.push(candidate);
    }

    return result.sort(() => Math.random() - 0.5);
  };

  const spawnMoles = () => {
    clearTimeoutRef()

    roundRef.current += 1;
    const maxNumberOfMoles = 5;
    const minNumberOfMoles = 1;
    const count = Math.min(
      Math.max(
        Math.floor(Math.random() * answerPool.all.length),
        minNumberOfMoles),
      maxNumberOfMoles);

    const all = Array.from({ length: TOTAL }, (_, i) => i + 1);

    let shuffled = [...all].sort(() => Math.random() - 0.5);
    let next = shuffled.slice(0, count);

    next = next.filter(i => !prevIndexes.current.includes(i));

    if (next.length === 0) {
      shuffled = [...all].sort(() => Math.random() - 0.5);
      next = shuffled.slice(0, count);
    }

    prevIndexes.current = [...next];

    // 👉 xác định có correct hay không
    const forceCorrect =
      roundRef.current === mustHaveCorrectRound.current;

    const answers = generateAnswers(next.length, forceCorrect);

    if (answers.some(a => a.correct)) {
      hasCorrectInCycle.current = true;
    }

    const mapping: Record<number, RoundAnswer> = {};
    next.forEach((index, i) => {
      mapping[index] = answers[i];
    });

    setHoleData(mapping);
    setActiveIndexes(next);
    setHitState({});

    const ROUND_TIME = Math.random() * 1000 + 2500;

    startTimeRef.current = Date.now();
    roundTimeRef.current = ROUND_TIME;

    createTimeoutRef(next);
  };

  const autoHideMoles = (indexes: number[]) => {
    setGoingDown([...indexes]);
    setActiveIndexes([]);

    // 👉 chỉ reset khi:
    // - đã có correct
    // - và đã đủ 3 lượt
    if (hasCorrectInCycle.current && roundRef.current >= 3) {
      roundRef.current = 0;
      hasCorrectInCycle.current = false;

      mustHaveCorrectRound.current = Math.floor(Math.random() * 3) + 1;
    }

    spawnMoles();
  };

  const handleWhack = (index: number) => {
    if (!isPlaying) return;
    const answer = holeData[index];
    if (!answer) return;

    const result = answer.correct ? "correct" : "wrong";

    // 👉 lưu trạng thái hit
    setHitState(prev => ({
      ...prev,
      [index]: result
    }));

    clearTimeoutRef()
    if (answer.correct) {
      audioManagerInstance.play('dizzy', 1);
      const interval = setInterval(() => {
        audioManagerInstance.play('dizzy', 1);
      }, 1000)
      setGoingDown(prev => [...prev, ...activeIndexes])
      setActiveIndexes([])
      setTimeout(() => {
        onCorrect();
      }, 5000);
      setTimeout(() => {
        clearInterval(interval);
      }, 4000);
    } else {
      audioManagerInstance.play('buzz', 0.3);
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(roundTimeRef.current - elapsed, 0);
      setGoingDown(prev => [...prev, index]);
      setActiveIndexes(prev => prev.filter(i => i !== index));
      createTimeoutRef(activeIndexes.filter(i => i !== index), remaining);
    }
  };

  return (
    <div className="page">
      <div className="sign-box">
        {/* <img src="/assets/wood.svg" alt="" />
         */}
        <div className="sign-box-wood"></div>
        <div className="container">
          <div className="sign-text">{currentIndex + 1 + ". " + question.question}</div>
          {question.questionImage && <img className="question-img" src={question.questionImage} alt="" />}
        </div>
      </div>

      <main>
        <div className="row row-3">
          {[1, 2, 3].map(i => (
            <Hole
              key={i}
              index={i}
              active={activeIndexes.includes(i)}
              goingDown={goingDown.includes(i)}
              data={holeData[i]}
              hitState={hitState[i]}

              onClick={handleWhack}
            />
          ))}
        </div>

        <div className="row row-4">
          {[4, 5, 6, 7].map(i => (
            <Hole
              key={i}
              index={i}
              active={activeIndexes.includes(i)}
              goingDown={goingDown.includes(i)}
              data={holeData[i]}
              hitState={hitState[i]}
              onClick={handleWhack}
            />
          ))}
        </div>

        <div className="row row-3">
          {[8, 9, 10].map(i => (
            <Hole
              key={i}
              index={i}
              active={activeIndexes.includes(i)}
              goingDown={goingDown.includes(i)}
              data={holeData[i]}
              hitState={hitState[i]}
              onClick={handleWhack}
            />
          ))}
        </div>
      </main>
    </div>
  );
}