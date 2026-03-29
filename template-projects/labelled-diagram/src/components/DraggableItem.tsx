import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import type { Label } from "../types/diagram";
import { layoutTransition } from "../config";

interface Props {
  item: Label;
  isDragging?: boolean;
}

// Component hiển thị UI thuần túy
export const ItemCard: React.FC<Props & { style?: React.CSSProperties }> = ({
  item,
  isDragging,
  style,
}) => (
  <motion.div
    layoutId={item.id}
    className={`w-32 h-20 shrink-0 flex items-center justify-center border-4 border-yellow-400 rounded-2xl bg-white shadow-lg select-none cursor-grab active:cursor-grabbing transition-all ${
      isDragging ? "opacity-30 scale-95" : "opacity-100 scale-100"
    }`}
    style={style}
    transition={layoutTransition}
  >
    <input
      type="text"
      value={item.name}
      readOnly
      className="w-full text-center px-2 py-1 bg-transparent outline-none font-semibold text-gray-700 cursor-grab"
    />
  </motion.div>
);

const DraggableItem: React.FC<{ item: Label }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <ItemCard item={item} isDragging={isDragging} />
    </div>
  );
};

export default DraggableItem;