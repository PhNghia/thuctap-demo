import Grid from "../Grid/Grid";
import ImageHints from "../ImageHints/ImageHints";

export default function GamePreview({
  grid,
  items,
  background,
  textColor,
  helperTextColor,
  selectedCells,
  foundCells,
  foundWords,
  onPointerDown,
  onPointerEnter,
  onPointerMove,
  onPointerUp
}) {
  const uniqueFoundCount = new Set(foundWords).size;
  const totalWords = items.length;
  const progressPercent = totalWords ? Math.round((uniqueFoundCount / totalWords) * 100) : 0;

  return (
    <div className="overlay">
      <div
        className="overlay-content"
        style={{
          background: background
            ? `url(${background}) center / cover no-repeat`
            : "#fff",
          color: textColor
        }}
      >
        <h2>Word Search Game</h2>

        <div
          className="progress-container"
          style={{
            position: "relative",
            margin: "8px 0 16px",
            height: "28px",
            width: "260px",
            minWidth: "200px"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              height: "14px",
              background: "rgba(230, 230, 230, 0.9)",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: "8px"
            }}
          />
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              background: "rgba(33, 150, 243, 0.95)",
              height: "14px",
              borderRadius: "8px",
              transition: "width 0.2s ease",
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
              textShadow: "0 0 4px rgba(0,0,0,0.5)"
            }}
          >
            {uniqueFoundCount}/{totalWords} ({progressPercent}%)
          </div>
        </div>

        <p className="game-helper" style={{ color: helperTextColor }}>
          Drag across the grid to find words. On phones, swipe directly on the
          letters.
        </p>

        <div className="game-wrapper">
          <Grid
            grid={grid}
            selectedCells={selectedCells || []}
            foundCells={foundCells || []}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />

          <ImageHints items={items} foundWords={foundWords} />
        </div>
      </div>
    </div>
  );
}
