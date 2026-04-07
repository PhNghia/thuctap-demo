import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import type { DiagramData, Label } from "../types/diagram";
import DiagramBoard from "./DiagramBoard";
import { ItemCard } from "./DraggableItem";
import DraggableItem from "./DraggableItem";
import GameFeedback from "./GameFeedback";

interface Props {
  data: DiagramData;
}

const DiagramGame: React.FC<Props> = ({ data }) => {
  // 👉 dùng trực tiếp data từ builder
  const gameData = data;

  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [activeLabel, setActiveLabel] = useState<Label | null>(null);

  // Drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveLabel(event.active.data.current as Label);
  };

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLabel(null);

    if (!over) return;

    const zoneId = over.id as string;
    const label = active.data.current as Label;

    const zone = gameData.zones.find((z) => z.id === zoneId);

    if (zone) {
      setPlaced((prev) => ({
        ...prev,
        [zoneId]: label.id,
      }));
    }
  };

  // Labels còn lại
  const usedLabels = Object.values(placed);
  const remainingLabels = gameData.labels.filter(
    (l) => !usedLabels.includes(l.id)
  );

  // Check hoàn thành
  const isGameComplete =
    gameData.labels.length > 0 &&
    remainingLabels.length === 0 &&
    Object.keys(placed).length === gameData.zones.length;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center p-10">
        <div className="w-[1200px] h-[800px] translate-x-20 bg-white/5 rounded-2xl shadow-2xl p-6 flex flex-row gap-6">

          {/* Diagram */}
          <div className="flex gap-6 items-start">
            <div className="inline-block bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-elevated border border-white/20">
              <DiagramBoard
                data={gameData}
                placed={placed}
                
              />
            </div>

            {/* Labels */}
            {gameData.labels.length > 0 && (
              <div className="w-72 bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-elevated border border-white/20 flex flex-col max-h-[70vh]">
                <h2 className="text-lg font-bold text-white mb-4">
                  🏷️ Labels
                </h2>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {remainingLabels.map((label) => (
                    <DraggableItem key={label.id} item={label} />
                  ))}
                </div>

                {/* Hoàn thành */}
                {isGameComplete && (
                  <div className="mt-4">
                    <div className="bg-green-500 text-white p-3 rounded-lg mb-3 text-center">
                      🎉 Hoàn thành!
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
                    >
                      Chơi lại
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <GameFeedback data={gameData} placed={placed} />

      {/* Drag overlay */}
      <DragOverlay>
        {activeLabel ? <ItemCard item={activeLabel} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DiagramGame;