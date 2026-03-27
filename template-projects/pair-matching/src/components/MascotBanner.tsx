import { AnimatePresence, motion } from "framer-motion";

// ─── Mascot Banner ────────────────────────────────────────────────────────────
export default function MascotBanner({
  state,
  uiScale,
}: {
  state: "idle" | "happy" | "sad" | null;
  uiScale: number;
}) {
  if (!state || state === "idle") return null;
  return (
    <AnimatePresence>
      <motion.div
        key={state}
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`
          flex items-center justify-center rounded-2xl text-center font-black shadow-2xl border-2
          ${
            state === "happy"
              ? "bg-linear-to-r from-green-400 to-emerald-500 text-white border-green-300"
              : "bg-linear-to-r from-red-400 to-pink-500 text-white border-red-300"
          }
        `}
        style={{
          paddingTop: 16 * uiScale,
          paddingBottom: 16 * uiScale,
          paddingLeft: 24 * uiScale,
          paddingRight: 24 * uiScale,
          fontSize: 16 * uiScale,
          borderWidth: 2 * uiScale,
          borderRadius: 16 * uiScale,
        }}
      >
        {state === "happy"
          ? "🎉 Tuyệt vời! Đúng rồi!"
          : "😢 Sai rồi! Thử lại nhé!"}
      </motion.div>
    </AnimatePresence>
  );
}
