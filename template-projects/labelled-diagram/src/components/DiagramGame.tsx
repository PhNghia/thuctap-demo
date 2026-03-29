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
import { advancedIdentifier } from "../services/advancedBodyPartIdentifier";

interface Props {
  data: DiagramData;
}

const DiagramGame: React.FC<Props> = ({ data }) => {
  const [gameData, setGameData] = useState<DiagramData>(data);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [activeLabel, setActiveLabel] = useState<Label | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [newLabelName, setNewLabelName] = useState<string>("");
  const [pendingLabels, setPendingLabels] = useState<Array<{ name: string; x: number; y: number }>>([]);
  const [labelsCompleted, setLabelsCompleted] = useState<boolean>(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLabel(event.active.data.current as Label);
  };

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

      // Generate AI verification with learning content
      const isCorrect = label.id === zone.correctLabelId;

      if (isCorrect) {
        // Generate learning content for correct placements
        advancedIdentifier.generateLearningContent(label.name);
        // Note: learning content could be displayed in GameFeedback or another component
      }
    }
  };

  // Calculate remaining labels for drag-and-drop game
  const usedLabels = Object.values(placed);
  const remainingLabels = gameData.labels.filter((l) => !usedLabels.includes(l.id));

  // Check if game is complete (all labels placed correctly)
  const isGameComplete = gameData.labels.length > 0 && remainingLabels.length === 0 && Object.keys(placed).length === gameData.zones.length;

  const handleCompleteLabels = () => {
    const newLabels = pendingLabels.map((pending, index) => ({
      id: `l${gameData.labels.length + index + 1}`,
      name: pending.name,
    }));
    const newZones = pendingLabels.map((pending, index) => ({
      id: `z${gameData.zones.length + index + 1}`,
      correctLabelId: `l${gameData.labels.length + index + 1}`,
      x: pending.x,
      y: pending.y,
    }));
    setGameData((prev) => ({
      ...prev,
      labels: [...prev.labels, ...newLabels],
      zones: [...prev.zones, ...newZones],
    }));
    setPendingLabels([]);
    setSelectedPoint(null); // clear selected marker when labels are finalized
    setLabelsCompleted(true);
  };

  const handlePlayAgain = () => {
    // reset game data to initial state (keep id/name from the original diagram data)
    setGameData({
      ...data,
      imagePath: "",
      labels: [],
      zones: [],
    });
    setPlaced({});
    setLabelsCompleted(false);
    setSelectedPoint(null);
    setNewLabelName("");
    setPendingLabels([]);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Sidebar */}
        <div className="w-72 max-h-[90vh] overflow-y-auto pr-2">
          <div className="p-2 sticky top-6 max-h-[90vh] overflow-y-auto space-y-4">
            {!labelsCompleted && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 shadow-md">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📤</span>
                  Step 1: Upload Image
                </h2>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const blob = URL.createObjectURL(file);
                    setGameData((prev) => ({ ...prev, imagePath: blob }));
                    setSelectedPoint(null);
                  }}
                  className="mb-3 w-full text-sm border-2 border-blue-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                />
                {selectedPoint && (
                  <div className="text-xs text-green-700 mb-2 bg-green-50 p-2 rounded">
                    ✅ Selected: [{selectedPoint.x.toFixed(1)}%, {selectedPoint.y.toFixed(1)}%]
                  </div>
                )}
              </div>
            )}

            {gameData.imagePath && !labelsCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Step 2: Create Labels
                </h2>
                <div className="flex gap-2">
                  <input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Enter label name"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-green-500 focus:outline-none"
                    disabled={!selectedPoint}
                  />
                  <button
                    onClick={() => {
                      if (!selectedPoint || !newLabelName.trim() || pendingLabels.length >= 10) return;
                      setPendingLabels((prev) => [
                        ...prev,
                        {
                          name: newLabelName.trim(),
                          x: Number(selectedPoint.x.toFixed(2)),
                          y: Number(selectedPoint.y.toFixed(2)),
                        },
                      ]);
                      setNewLabelName("");
                      setSelectedPoint(null);
                    }}
                    disabled={!selectedPoint || !newLabelName.trim() || pendingLabels.length >= 10}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    Add Label ({pendingLabels.length}/10)
                  </button>
                </div>

                {pendingLabels.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Labels:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {pendingLabels.map((label, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-xs border">
                          <span>{label.name}</span>
                          <span className="text-gray-500">[{label.x.toFixed(1)}%, {label.y.toFixed(1)}%]</span>
                          <button
                            onClick={() => {
                              setPendingLabels((prev) => prev.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleCompleteLabels}
                      className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition"
                    >
                      Complete ({pendingLabels.length} labels)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* {gameData.imagePath && labelsCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">✅ Labels Created</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    {gameData.labels.length} label{gameData.labels.length !== 1 ? 's' : ''} have been created. You can now play the labeling game!
                  </p>
                  <button
                    onClick={handlePlayAgain}
                    className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold hover:bg-orange-600 transition"
                  >
                    🔄 Play Again
                  </button>
                </div>
              </div>
            )} */}

          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex gap-6">
          {/* Diagram */}
          <div className="flex justify-center items-center">
            <div className="inline-block bg-white p-6 rounded-3xl shadow-xl">
              <DiagramBoard
                data={gameData}
                placed={placed}
                selectedPoint={selectedPoint}
                onZoneSelect={labelsCompleted ? undefined : setSelectedPoint}
              />
            </div>
          </div>

          {/* Labels Column - Right side of image */}
          {gameData.labels.length > 0 && (
            <div className="w-64">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏷️</span>Body Parts<span>🏷️</span>
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {remainingLabels.map((label) => (
                  <DraggableItem key={label.id} item={label} />
                ))}
              </div>

              {/* Game Complete - Again Button */}
              {isGameComplete && (
                <div className="mt-6 text-center">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Congratulations!</h3>
                    <p className="text-green-700">You have successfully completed the labeling game!</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

      {/* Game Feedback Panel */}
      <GameFeedback data={gameData} placed={placed} />

      <DragOverlay>
        {activeLabel ? <ItemCard item={activeLabel} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DiagramGame;