import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { layoutTransition } from "../config";
import type { Zone, Label } from "../types/diagram";

interface Props {
  zone: Zone;
  label?: Label;
  isCorrect?: boolean;
  correctLabelId?: string;
}

const DropZone: React.FC<Props> = ({
  zone,
  label,
  isCorrect,
  correctLabelId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={`px-2 py-1 flex items-center justify-center rounded-lg border-2 transition-all relative ${
        isOver
          ? "border-cyan-400 bg-cyan-400/20 scale-110"
          : isCorrect === true
          ? "border-emerald-400 bg-emerald-400/20"
          : isCorrect === false
          ? "border-red-400 bg-red-400/20"
          : "border-purple-300/40 bg-purple-400/10 hover:border-purple-400"
      }`}
    >
      {/* Empty zone (nhỏ gọn) */}
      {!label && (
        <div className="w-5 h-5 rounded-full border border-purple-300/60 bg-white/10" />
      )}

      {/* Label khi drop */}
      <AnimatePresence mode="popLayout">
        {label && (
          <motion.div
            key={label.id}
            layoutId={label.id}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={layoutTransition}
            className="relative"
          >
            <div className="text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md px-2 py-1 border border-purple-400/50 shadow-soft whitespace-nowrap">
              {label.name}
            </div>

            {/* Check đúng */}
            {isCorrect === true && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
            )}

            {/* Sai */}
            {isCorrect === false && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                ✕
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropZone;