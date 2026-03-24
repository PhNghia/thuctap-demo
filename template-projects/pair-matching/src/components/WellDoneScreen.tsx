import { motion } from "framer-motion";

// ─── Well Done Screen ─────────────────────────────────────────────────────────
export default function WellDoneScreen({ onRestart }: { onRestart: () => void }) {
  const emojis = ["🎊", "⭐", "🌟", "✨", "🎉", "🏆", "🎈", "💫"];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,30,0.85)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Floating emojis */}
      {emojis.map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none select-none"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 40,
            rotate: 0,
          }}
          animate={{
            y: -80,
            rotate: Math.random() * 360 - 180,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.18,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {e}
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-10 py-10 rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
          border: "3px solid rgba(167,139,250,0.5)",
        }}
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.1 }}
      >
        <motion.div
          className="text-7xl"
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
        >
          🏆
        </motion.div>
        <motion.h1
          className="text-5xl font-black text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(90deg, #fbbf24, #f59e0b, #fde68a, #fbbf24)" }}
          animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Well Done!
        </motion.h1>
        <p className="text-purple-200 text-lg font-semibold">Bạn đã tìm được tất cả các cặp! 🎉</p>
        <motion.button
          onClick={onRestart}
          className="mt-2 px-8 py-3 rounded-full font-black text-white text-lg shadow-lg"
          style={{ background: "linear-gradient(90deg, #7c3aed, #6d28d9)" }}
          whileHover={{ scale: 1.07, boxShadow: "0 0 30px rgba(139,92,246,0.6)" }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Chơi lại
        </motion.button>
      </motion.div>
    </motion.div>
  );
}