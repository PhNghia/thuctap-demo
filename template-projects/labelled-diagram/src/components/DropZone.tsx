import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { layoutTransition } from "../config";
import { advancedIdentifier } from "../services/advancedBodyPartIdentifier";
import type { Zone, Label } from "../types/diagram";

interface Props {
  zone: Zone;
  label?: Label;
  isCorrect?: boolean;
  correctLabelId?: string;
  showAnnotations?: boolean;
}

const DropZone: React.FC<Props> = ({ zone, label, isCorrect, correctLabelId, showAnnotations = true }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
  });

  // Get advanced AI feedback if label is placed
  let advancedFeedback = "";
  if (label && correctLabelId) {
    const result = advancedIdentifier.enhancedVerification(
      label.name,
      label.name,
      label.id === correctLabelId
    );
    advancedFeedback = result.aiInsight;
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={`px-3 py-2 flex flex-col items-center justify-center rounded-lg border-2 transition-all relative group shadow-md ${
        showAnnotations
          ? isOver
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 scale-110"
            : isCorrect === true
            ? "border-green-400 bg-green-50 shadow-green-200"
            : isCorrect === false
            ? "border-red-400 bg-red-50 shadow-red-200"
            : "border-gray-400 bg-yellow-50"
          : "border-transparent bg-transparent shadow-none"
      } ${!showAnnotations ? "pointer-events-auto" : ""}`}
    >
      {/* Zone placeholder indicator */}
      {showAnnotations && !label && (
        <div className="flex flex-col items-center justify-center bg-white bg-opacity-80 rounded px-2 py border border-gray-300 shadow-sm">
          <div className="text-sm text-gray-500 text-center">⭕</div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {showAnnotations && label && (
          <motion.div
            key={label.id}
            layoutId={label.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={layoutTransition}
            className="flex flex-col items-center justify-center"
          >
            <div className="text-sm font-semibold text-center line-clamp-2 text-gray-800 bg-white bg-opacity-90 rounded px-2 py-1 border border-gray-400 shadow-sm">
              {label.name}
            </div>

            {/* Correct indicator */}
            {isCorrect === true && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight tooltip - note style */}
      {showAnnotations && advancedFeedback && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-yellow-100 text-gray-800 text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-normal shadow-lg border border-yellow-300">
          <p className="font-semibold mb-1 text-yellow-800">🧠 Vị trí:</p>
          <p>{advancedFeedback}</p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-yellow-300"></div>
        </div>
      )}
    </div>
  );
};

export default DropZone;