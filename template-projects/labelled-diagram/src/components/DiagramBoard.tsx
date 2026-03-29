import { useState, useRef } from "react";
import DropZone from "./DropZone";
import BodyPartConnectors from "./BodyPartConnectors";
import type { DiagramData, Label } from "../types/diagram";

interface Props {
  data: DiagramData;
  placed: Record<string, string>;
  onZoneSelect?: (coords: { x: number; y: number }) => void;
  selectedPoint?: { x: number; y: number } | null;
  showAnnotations?: boolean;
}

const DiagramBoard = ({ data, placed, onZoneSelect, selectedPoint, showAnnotations = true }: Props) => {
  const [imageError, setImageError] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 500, height: 600 });

  const getLabel = (id: string): Label | undefined =>
    data.labels.find((l: Label) => l.id === id);

  // Create labels map for connectors
  const labelsMap = new Map(data.labels.map((l) => [l.id, l]));

  const handleImageLoad = () => {
    if (boardRef.current) {
      setBoardDimensions({
        width: boardRef.current.offsetWidth,
        height: boardRef.current.offsetHeight,
      });
    }
  };

  return (
    <div className="relative flex-1">
      <div
        ref={boardRef}
        className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-xl p-4 inline-block"
      >
        {imageError || !data.imagePath ? (
          <div className="w-full max-w-[500px] h-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-blue-300">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🖼️</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Upload Your Image</h2>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm text-gray-500 mb-2">Supported formats: PNG, JPG, GIF, SVG</p>
                <p className="text-xs text-gray-400">Click the "Choose File" button in the sidebar to get started!</p>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={data.imagePath}
            alt={data.name}
            className="w-full max-w-[500px] h-auto rounded-xl shadow-lg cursor-crosshair"
            onError={() => setImageError(true)}
            onLoad={handleImageLoad}
            onClick={(event) => {
              if (!onZoneSelect) return;
              const rect = event.currentTarget.getBoundingClientRect();
              const x = ((event.clientX - rect.left) / rect.width) * 100;
              const y = ((event.clientY - rect.top) / rect.height) * 100;
              onZoneSelect({ x, y });
            }}
            loading="lazy"
          />
        )}

        {showAnnotations && selectedPoint && (
          <div
            className="absolute rounded-full bg-red-500 border-2 border-white pointer-events-none"
            style={{
              width: 12,
              height: 12,
              left: `${selectedPoint.x}%`,
              top: `${selectedPoint.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Drop zones */}
        {data.zones.map((zone) => {
          const labelId = placed[zone.id];
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
              showAnnotations={showAnnotations}
            />
          );
        })}

        {/* Visual connectors */}
        {showAnnotations && (
          <BodyPartConnectors
            zones={data.zones}
            placed={placed}
            labelsMap={labelsMap}
            containerWidth={boardDimensions.width}
            containerHeight={boardDimensions.height}
          />
        )}
      </div>
    </div>
  );
};

export default DiagramBoard;