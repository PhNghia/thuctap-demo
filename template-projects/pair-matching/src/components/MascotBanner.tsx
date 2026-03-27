import { AnimatePresence, motion } from "framer-motion";

// ─── Mascot Banner ────────────────────────────────────────────────────────────
export default function MascotBanner({
  state,
  uiScale,
  isLandscape,
}: {
  state: "idle" | "happy" | "sad" | null;
  uiScale: number;
  isLandscape: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {state && state !== "idle" && (
        <div
          className="fixed inset-0 pointer-events-none z-[100] flex items-end justify-center"
          style={{
            paddingBottom: isLandscape ? 60 * uiScale : "min(75vh, 600px)",
            alignItems: isLandscape ? "flex-end" : "flex-start",
            paddingTop: isLandscape ? 0 : "20vh",
          }}
        >
          <motion.div
            key={state}
            initial={{ scale: 0, opacity: 0, y: isLandscape ? 50 : -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: isLandscape ? 50 : -50 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className={`
              pointer-events-auto
              flex items-center justify-center rounded-3xl text-center font-black shadow-2xl border-4
              ${
                state === "happy"
                  ? "bg-linear-to-r from-green-400 to-emerald-500 text-white border-green-300"
                  : "bg-linear-to-r from-red-400 to-pink-500 text-white border-red-300"
              }
            `}
            style={{
              paddingTop: 18 * uiScale,
              paddingBottom: 18 * uiScale,
              paddingLeft: 30 * uiScale,
              paddingRight: 30 * uiScale,
              fontSize: 20 * uiScale,
              borderRadius: 24 * uiScale,
              maxWidth: "90vw",
            }}
          >
            {state === "happy"
              ? "🎉 Tuyệt vời! Đúng rồi!"
              : "😢 Sai rồi! Thử lại nhé!"}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
