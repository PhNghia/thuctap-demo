import { AnimatePresence, motion } from "framer-motion";

// ─── Mascot Banner ────────────────────────────────────────────────────────────
export default function MascotBanner({
  state,
}: {
  state: "idle" | "happy" | "sad" | null;
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
          rounded-2xl px-4 py-3 text-center font-black text-sm tracking-wide shadow-xl
          ${
            state === "happy"
              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
              : "bg-gradient-to-r from-red-400 to-pink-500 text-white"
          }
        `}
      >
        {state === "happy"
          ? "🎉 Tuyệt vời! Đúng rồi!"
          : "😢 Sai rồi! Thử lại nhé!"}
      </motion.div>
    </AnimatePresence>
  );
}
