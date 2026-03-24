import React from "react";
import "../../styles/grid.css";

export default function Cell({
  letter,
  row,
  col,
  isSelected,
  isFound,
  onPointerDown,
  onPointerEnter,
  onPointerUp
}) {
  return (
    <div
      className={`cell ${isSelected ? "selected" : ""} ${isFound ? "found" : ""}`}
      data-word-cell="true"
      data-row={row}
      data-col={col}
      onPointerDown={(event) => onPointerDown?.(row, col, event.pointerType)}
      onPointerEnter={() => onPointerEnter?.(row, col)}
      onPointerUp={() => onPointerUp?.()}
    >
      {letter}
    </div>
  );
}
