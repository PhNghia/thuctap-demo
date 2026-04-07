import { useDraggable } from "@dnd-kit/core";
import type { Label } from "../types/diagram";

interface Props {
  item: Label;
}

export const ItemCard: React.FC<Props> = ({ item }) => {
  return (
    <div className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-md text-sm font-semibold border border-purple-400/50 whitespace-nowrap">
      {item.name}
    </div>
  );
};

const DraggableItem: React.FC<Props> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ItemCard item={item} />
    </div>
  );
};

export default DraggableItem;