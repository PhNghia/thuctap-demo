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

  if (isLandscape) {
    return (
      <div
        className="flex flex-col items-stretch w-full"
        style={{ gap: baseGap, paddingTop: 20 * uiScale }}
      >
        <MascotBanner state={mascotState} uiScale={uiScale} isLandscape={true} />

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
        <div className="flex flex-col" style={{ gap: baseGap * 0.75 }}>
          <StatBox label="Lượt đi" value={moves} uiScale={uiScale} />
          <StatBox
            label="Đã ghép"
            value={`${matched}/${total}`}
            uiScale={uiScale}
            color="emerald"
          />
        </div>

        {/* Progress */}
        <div className="w-full">
          <ProgressBar progress={progress} uiScale={uiScale} />
        </div>

        {/* Instructions */}
        <Instructions uiScale={uiScale} />

        {/* Restart */}
        <div className="flex justify-center mt-4">
          <RestartButton onClick={onRestart} uiScale={uiScale} />
        </div>
      </div>
    );
  }

  // PORTRAIT: 2 Row Grid
  return (
    <div
      className="flex flex-col w-full"
      style={{ gap: baseGap * 0.75, padding: 10 * uiScale }}
    >
      <MascotBanner state={mascotState} uiScale={uiScale} isLandscape={false} />

      {/* Row 1: Title, Progress, Restart (icon) */}
      <div className="flex items-center" style={{ gap: baseGap }}>
        <motion.h2
          className="font-black text-transparent bg-clip-text shrink-0"
          style={{
            backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            fontSize: 22 * uiScale,
          }}
        >
          🃏
        </motion.h2>

        <div className="flex-1">
          <ProgressBar progress={progress} uiScale={uiScale} hideLabel />
        </div>

        <RestartButton onClick={onRestart} uiScale={uiScale} iconOnly />
      </div>

      {/* Row 2: Stats and Instructions */}
      <div className="flex items-stretch" style={{ gap: baseGap }}>
        <div className="flex flex-row flex-1" style={{ gap: baseGap * 0.5 }}>
          <StatBox
            label="Lượt"
            value={moves}
            uiScale={uiScale}
            compact
          />
          <StatBox
            label="Ghép"
            value={`${matched}/${total}`}
            uiScale={uiScale}
            color="emerald"
            compact
          />
        </div>
        <div className="flex-[1.5]">
          <Instructions uiScale={uiScale} />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components for cleaner code ──────────────────────────────────────────

function StatBox({
  label,
  value,
  uiScale,
  color = "purple",
  compact = false,
}: {
  label: string;
  value: string | number;
  uiScale: number;
  color?: "purple" | "emerald";
  compact?: boolean;
}) {
  const isPurple = color === "purple";
  return (
    <div
      className="rounded-2xl text-center shadow flex flex-col justify-center"
      style={{
        padding: compact ? 8 * uiScale : 16 * uiScale,
        background: isPurple
          ? "rgba(124,58,237,0.18)"
          : "rgba(16,185,129,0.18)",
        border: `${1 * uiScale}px solid ${
          isPurple ? "rgba(167,139,250,0.3)" : "rgba(52,211,153,0.3)"
        }`,
        flex: 1,
      }}
    >
      <div
        style={{ fontSize: (compact ? 12 : 14) * uiScale }}
        className={`${isPurple ? "text-purple-300" : "text-emerald-300"} font-semibold`}
      >
        {label}
      </div>
      <div
        style={{ fontSize: (compact ? 20 : 32) * uiScale }}
        className="font-black text-white leading-none mt-1"
      >
        {value}
      </div>
    </div>
  );
}

function ProgressBar({
  progress,
  uiScale,
  hideLabel,
}: {
  progress: number;
  uiScale: number;
  hideLabel?: boolean;
}) {
  return (
    <div className="w-full">
      {!hideLabel && (
        <div
          className="text-purple-300 mb-1 font-semibold text-center"
          style={{ fontSize: 12 * uiScale }}
        >
          Tiến độ
        </div>
      )}
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
  );
}

function Instructions({ uiScale }: { uiScale: number }) {
  return (
    <div
      className="rounded-xl leading-relaxed text-center flex items-center justify-center h-full"
      style={{
        padding: 10 * uiScale,
        fontSize: 12 * uiScale,
        background: "rgba(255,255,255,0.05)",
        border: `${1 * uiScale}px solid rgba(167,139,250,0.15)`,
        color: "#e9d5ff",
      }}
    >
      👆 Lật 2 thẻ bài để tìm cặp giống nhau!
    </div>
  );
}

function RestartButton({
  onClick,
  uiScale,
  iconOnly,
}: {
  onClick: () => void;
  uiScale: number;
  iconOnly?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="font-bold text-white shadow-lg flex items-center justify-center shrink-0"
      style={{
        background: "linear-gradient(135deg, #6d28d9, #4c1d95)",
        padding: iconOnly ? 10 * uiScale : `${10 * uiScale}px ${20 * uiScale}px`,
        borderRadius: 12 * uiScale,
        fontSize: 16 * uiScale,
        gap: 8 * uiScale,
        width: iconOnly ? 44 * uiScale : "auto",
        height: iconOnly ? 44 * uiScale : "auto",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span style={{ fontSize: (iconOnly ? 20 : 18) * uiScale }}>🔄</span>
      {!iconOnly && "Chơi lại"}
    </motion.button>
  );
}
