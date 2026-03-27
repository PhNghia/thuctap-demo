import { motion } from "framer-motion";
import type { HUDProps } from "../types/components";
import MascotBanner from "./MascotBanner";

export function HUD({
  moves,
  matched,
  total,
  mascotState,
  onRestart,
  isLandscape,
  uiScale,
}: HUDProps) {
  const progress = total > 0 ? matched / total : 0;

  const baseGap = 16 * uiScale;

  return (
    <div
      className={`flex items-stretch justify-evenly ${
        isLandscape ? "flex-col h-full" : "flex-row items-center w-full"
      }`}
      style={{
        gap: baseGap,
        width: "100%",
      }}
    >
      {/* Mascot banner - Moved inside flow and scaled */}
      <div
        className={isLandscape ? "w-full" : "fixed bottom-4 left-4 right-4 z-50"}
        style={{
          minHeight: 60 * uiScale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MascotBanner state={mascotState} uiScale={uiScale} />
      </div>

      {/* Title */}
      <motion.h2
        className="font-black text-transparent bg-clip-text text-center"
        style={{
          backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)",
          fontSize: 28 * uiScale,
        }}
      >
        🃏 Matching
      </motion.h2>

      {/* Stats */}
      <div
        className={`flex ${isLandscape ? "flex-col" : "flex-row"}`}
        style={{ gap: baseGap * 0.75 }}
      >
        <div
          className="rounded-2xl text-center shadow"
          style={{
            padding: 16 * uiScale,
            background: "rgba(124,58,237,0.18)",
            border: `${1 * uiScale}px solid rgba(167,139,250,0.3)`,
            flex: 1,
          }}
        >
          <div
            style={{ fontSize: 14 * uiScale }}
            className="text-purple-300 font-semibold"
          >
            Lượt đi
          </div>
          <div
            style={{ fontSize: 32 * uiScale }}
            className="font-black text-white"
          >
            {moves}
          </div>
        </div>
        <div
          className="rounded-2xl text-center shadow"
          style={{
            padding: 16 * uiScale,
            background: "rgba(16,185,129,0.18)",
            border: `${1 * uiScale}px solid rgba(52,211,153,0.3)`,
            flex: 1,
          }}
        >
          <div
            style={{ fontSize: 14 * uiScale }}
            className="text-purple-300 font-semibold"
          >
            Đã ghép
          </div>
          <div
            style={{ fontSize: 32 * uiScale }}
            className="font-black text-white"
          >
            {matched}/{total}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={isLandscape ? "w-full" : "flex-1 mx-4"}>
        <div
          className="text-purple-300 mb-1 font-semibold text-center"
          style={{ fontSize: 12 * uiScale }}
        >
          Tiến độ
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.1)",
            height: 12 * uiScale,
            width: "100%",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div
        className="rounded-xl leading-relaxed text-center"
        style={{
          padding: 12 * uiScale,
          fontSize: 13 * uiScale,
          background: "rgba(255,255,255,0.05)",
          border: `${1 * uiScale}px solid rgba(167,139,250,0.15)`,
          color: "#e9d5ff",
        }}
      >
        👆 Lật 2 thẻ bài để tìm cặp giống nhau!
      </div>

      {/* Restart */}
      <div className="flex justify-center">
        <motion.button
          onClick={onRestart}
          className="font-bold text-white shadow-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #4c1d95)",
            paddingLeft: 20 * uiScale,
            paddingRight: 20 * uiScale,
            paddingTop: 10 * uiScale,
            paddingBottom: 10 * uiScale,
            borderRadius: 12 * uiScale,
            fontSize: 16 * uiScale,
            gap: 8 * uiScale,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: 18 * uiScale }}>🔄</span>
          Chơi lại
        </motion.button>
      </div>
    </div>
  );
}
