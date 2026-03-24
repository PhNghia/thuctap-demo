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
}: HUDProps) {
  const progress = total > 0 ? matched / total : 0;

  return (
    <div
      className={`flex gap-4 ${
        isLandscape
          ? "flex-col justify-start"
          : "flex-row items-center flex-wrap justify-between"
      }`}
      style={isLandscape ? { minWidth: 180, maxWidth: 220 } : {}}
    >
      {/* Title */}
      <motion.h2
        className="font-black text-transparent bg-clip-text text-xl"
        style={{ backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)" }}
      >
        🃏 Matching
      </motion.h2>

      {/* Stats */}
      <div className={`flex gap-3 ${isLandscape ? "flex-col" : "flex-row"}`}>
        <div
          className="rounded-2xl px-4 py-2 text-center shadow"
          style={{
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(167,139,250,0.3)",
          }}
        >
          <div className="text-xs text-purple-300 font-semibold">Lượt đi</div>
          <div className="text-2xl font-black text-white">{moves}</div>
        </div>
        <div
          className="rounded-2xl px-4 py-2 text-center shadow"
          style={{
            background: "rgba(16,185,129,0.18)",
            border: "1px solid rgba(52,211,153,0.3)",
          }}
        >
          <div className="text-xs text-emerald-300 font-semibold">Đã ghép</div>
          <div className="text-2xl font-black text-white">
            {matched}/{total}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={isLandscape ? "w-full" : "flex-1 min-w-32"}>
        <div className="text-xs text-purple-300 mb-1 font-semibold">
          Tiến độ
        </div>
        <div
          className="rounded-full h-3 w-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Mascot banner */}
      <div className={isLandscape ? "w-full" : ""}>
        <MascotBanner state={mascotState} />
      </div>

      {/* Restart */}
      <motion.button
        onClick={onRestart}
        className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow"
        style={{ background: "linear-gradient(135deg, #6d28d9, #4c1d95)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔄 Chơi lại
      </motion.button>

      {/* Instructions */}
      <div
        className="rounded-xl p-3 text-xs text-purple-200 leading-relaxed"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <p>👆 Lật 2 thẻ bài để tìm cặp giống nhau!</p>
      </div>
    </div>
  );
}
