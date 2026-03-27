import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { GameConfig, CardState } from "../types/objects";
import { buildDeck, getOptimalGrid } from "../utils";
import Card from "./Card";
import { HUD } from "./HUD";
import WellDoneScreen from "./WellDoneScreen";
import { MY_APP_DATA } from "../data";

// ─── Main Game ────────────────────────────────────────────────────────────────
export default function MatchingGame() {
  // Load config
  const config: GameConfig = useMemo(() => {
    const w = window as unknown as { MY_APP_DATA?: GameConfig };
    return w.MY_APP_DATA ?? MY_APP_DATA;
  }, []);

  const [cards, setCards] = useState<CardState[]>(() => buildDeck(config));
  const [flipped, setFlipped] = useState<string[]>([]); // up to 2 uids
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [mascotState, setMascotState] = useState<
    "idle" | "happy" | "sad" | null
  >(null);
  const [gameWon, setGameWon] = useState(false);
  const mascotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grid dimensions (fixed from deck build)
  const grid = useMemo(() => getOptimalGrid(cards.length), [cards.length]);

  // Responsive: track container size and orientation
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight,
  );

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) {
        setContainerSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);

    const onResize = () =>
      setIsLandscape(window.innerWidth / window.innerHeight >= 1.3);
    window.addEventListener("resize", onResize);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Compute card size to fill available space
  // Proportional UI Scale
  const uiScale = useMemo(() => {
    if (isLandscape) {
      // Landscape: base on 768px height
      return Math.max(window.innerHeight / 768, 0.8);
    } else {
      // Portrait: base on 380px width (typical mobile)
      return Math.max(window.innerWidth / 380, 0.85);
    }
  }, [isLandscape]);

  // Compute card size to fill available space
  const GAP = 12 * uiScale;
  const cardSize = useMemo(() => {
    if (!containerSize.w || !containerSize.h) return 80;
    const maxByCols = Math.floor(
      (containerSize.w - GAP * (grid.cols - 1)) / grid.cols,
    );
    const maxByRows = Math.floor(
      (containerSize.h - GAP * (grid.rows - 1)) / grid.rows,
    );
    const size = Math.min(maxByCols, maxByRows);
    return Math.max(size, 40); // minimum 40px
  }, [containerSize, grid, GAP]);

  const gridW = cardSize * grid.cols + GAP * (grid.cols - 1);
  const gridH = cardSize * grid.rows + GAP * (grid.rows - 1);

  // Matched pairs count
  const totalPairs = cards.length / 2;
  const matchedPairs = cards.filter((c) => c.isMatched).length / 2;

  // Handle card click
  const handleCardClick = useCallback(
    (uid: string) => {
      if (locked) return;
      const card = cards.find((c) => c.uid === uid);
      if (!card || card.isFlipped || card.isMatched) return;
      if (flipped.includes(uid)) return;

      const newFlipped = [...flipped, uid];

      setCards((prev) =>
        prev.map((c) => (c.uid === uid ? { ...c, isFlipped: true } : c)),
      );

      if (newFlipped.length === 1) {
        setFlipped(newFlipped);
      } else {
        // Two cards flipped
        setFlipped([]);
        setMoves((m) => m + 1);
        setLocked(true);

        const [uid1, uid2] = newFlipped;
        const c1 = cards.find((c) => c.uid === uid1)!;
        const c2 = card; // current card (just clicked)

        const isMatch = c1.itemId === c2.itemId;

        if (mascotTimer.current) clearTimeout(mascotTimer.current);

        setTimeout(() => {
          if (isMatch) {
            setMascotState("happy");
            setCards((prev) => {
              const updated = prev.map((c) =>
                c.uid === uid1 || c.uid === uid2
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c,
              );
              if (updated.every((c) => c.isMatched)) {
                setTimeout(() => setGameWon(true), 600);
              }
              return updated;
            });
          } else {
            setMascotState("sad");
            setCards((prev) =>
              prev.map((c) =>
                c.uid === uid1 || c.uid === uid2
                  ? { ...c, isFlipped: false }
                  : c,
              ),
            );
          }
          setLocked(false);
          mascotTimer.current = setTimeout(() => setMascotState("idle"), 1800);
        }, 900);
      }
    },
    [cards, flipped, locked],
  );

  const restart = useCallback(() => {
    setCards(buildDeck(config));
    setFlipped([]);
    setLocked(false);
    setMoves(0);
    setMascotState(null);
    setGameWon(false);
  }, [config]);

  return (
    <div
      className="w-screen h-screen overflow-hidden flex"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Nunito', 'Comic Sans MS', cursive, sans-serif",
        flexDirection: isLandscape ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30 * uiScale,
      }}
    >
      {/* HUD Panel */}
      <div
        className="shrink-0 flex items-center relative"
        style={
          isLandscape
            ? {
                width: 300 * uiScale,
                height: "90%",
                flexDirection: "column",
                justifyContent: "flex-start",
              }
            : {
                width: "95%",
                height: "auto",
                flexDirection: "row",
              }
        }
      >
        <HUD
          moves={moves}
          matched={matchedPairs}
          total={totalPairs}
          mascotState={mascotState}
          onRestart={restart}
          isLandscape={isLandscape}
          uiScale={uiScale}
        />
      </div>

      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: isLandscape ? "70vw" : "95vw",
          height: isLandscape ? "90vh" : "60vh",
          padding: 10 * uiScale,
        }}
      >
        <motion.div
          style={{
            width: gridW,
            height: gridH,
            display: "grid",
            gridTemplateColumns: `repeat(${grid.cols}, ${cardSize}px)`,
            gridTemplateRows: `repeat(${grid.rows}, ${cardSize}px)`,
            gap: GAP,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {cards.map((card) => (
            <Card
              key={card.uid}
              card={card}
              onClick={() => handleCardClick(card.uid)}
              disabled={locked || card.isMatched}
              size={cardSize}
            />
          ))}
        </motion.div>
      </div>

      {/* Win screen */}
      <AnimatePresence>
        {gameWon && <WellDoneScreen onRestart={restart} />}
      </AnimatePresence>
    </div>
  );
}
