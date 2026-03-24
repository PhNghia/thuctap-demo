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
  onPointerUp,
  onClose
}) {
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
        <button className="close-btn" onClick={onClose}>
          x
        </button>

        <h2>Word Search Game</h2>
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
