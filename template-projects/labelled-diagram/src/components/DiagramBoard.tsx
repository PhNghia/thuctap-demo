import { useState, useRef } from "react";
import DropZone from "./DropZone";
import type { DiagramData, Label, Zone } from "../types/diagram";

interface Props {
  data: DiagramData;
  placed: Record<string, string>;
}

const DiagramBoard: React.FC<Props> = ({ data, placed }) => {
  const [imageError, setImageError] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const getLabel = (id: string): Label | undefined => {
    return data.labels.find((l) => l.id === id);
  };

  return (
    <div className="relative flex-1">
      <div
        ref={boardRef}
        className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-elevated p-4 inline-block border border-white/10"
      >
        {/* Image */}
        {imageError || !data?.imagePath ? (
          <div className="w-[500px] h-[400px] flex items-center justify-center text-white">
            ❌ Image not found
          </div>
        ) : (
          <img
            src={data.imagePath}
            alt={data.name}
            className="w-full max-w-[500px] h-auto rounded-xl shadow-lg"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Drop zones */}
        {data?.zones?.map((zone: Zone) => {
          const labelId = placed?.[zone.id];
          const label = labelId ? getLabel(labelId) : undefined;

          return (
            <DropZone
              key={zone.id}
              zone={zone}
              label={label}
              isCorrect={
                labelId ? labelId === zone.correctLabelId : undefined
              }
              correctLabelId={zone.correctLabelId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiagramBoard;