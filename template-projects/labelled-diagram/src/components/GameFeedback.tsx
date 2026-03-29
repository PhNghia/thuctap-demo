import { aiIdentifier } from "../services/bodyPartIdentifier";
import type { DiagramData } from "../types/diagram";

interface FeedbackProps {
  data: DiagramData;
  placed: Record<string, string>;
}

export const GameFeedback: React.FC<FeedbackProps> = ({ data, placed }) => {
  // Calculate accuracy
  const totalZones = data.zones.length;
  const correctPlacements = data.zones.filter(
    (zone) => placed[zone.id] === zone.correctLabelId
  ).length;

  const accuracy = totalZones > 0 ? correctPlacements / totalZones : 0;
  const percentage = Math.round(accuracy * 100);

  // Get completion message (do not show when there are no zones)
  const completionMessage =
    totalZones > 0
      ? correctPlacements === totalZones
        ? aiIdentifier.getCompletionMessage(1.0)
        : correctPlacements > 0
        ? aiIdentifier.getCompletionMessage(accuracy)
        : null
      : null;

  // Count placed and remaining
  const placedCount = Object.keys(placed).length;
  const remaining = data.labels.length - placedCount;

  const showProgressBar = placedCount > 0;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-xs z-40">
      {/* Header */}
      <h3 className="font-bold text-lg text-gray-800 mb-3">
        Progress
      </h3>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Placed:</span>
          <span className="font-semibold text-blue-600">
            {placedCount} / {data.labels.length}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Correct:</span>
          <span className="font-semibold text-green-600">
            {correctPlacements} / {totalZones}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-700">
              Accuracy
            </span>
            <span className="text-xs font-bold text-blue-600">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                accuracy === 1
                  ? "bg-green-500"
                  : accuracy >= 0.8
                  ? "bg-blue-500"
                  : accuracy >= 0.5
                  ? "bg-yellow-500"
                  : "bg-orange-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {completionMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-900">{completionMessage}</p>
        </div>
      )}

      {/* Status Message */}
      <div className="text-xs text-gray-600 text-center">
        {data.labels.length === 0 ? (
          <p className="text-gray-500">No labels defined yet</p>
        ) : remaining > 0 ? (
          <p>
            <span className="font-semibold">{remaining}</span> more to
            label
          </p>
        ) : (
          <p className="text-green-600 font-semibold">All labeled! ✓</p>
        )}
      </div>

      {/* Hint System
      {correctPlacements > 0 && remaining > 0 && remaining <= 3 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">💡 Tips:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Look at the shape and think about location</li>
            <li>• Read the zone name carefully</li>
            <li>• Hover for feedback on incorrect placements</li>
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default GameFeedback;
