import { useEffect, useRef, useState } from "react";
import GamePreview from "../components/Game/GamePreview";
import { generateWordSearch } from "../engine/generateWordSearch";
import { getBrightness } from "../utils/imageUtils";

const customBackground = "";

export default function WordSearchPage() {
  const [items, setItems] = useState(window.APP_DATA?.items || [
    { word: "CAT", image: "🐱" },
    { word: "FLOWER", image: "🌸" },
    { word: "JUMP", image: "🦘" },
    { word: "BIRD", image: "🐦" },
    { word: "STAR", image: "⭐" },
  ]);
  const [background, setBackground] = useState(window.APP_DATA?.background || customBackground);
  const [grid, setGrid] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [textColor, setTextColor] = useState("#000");
  const [helperTextColor, setHelperTextColor] = useState("rgba(0, 0, 0, 0.72)");
  const [selectedCells, setSelectedCells] = useState([]);

  const isDraggingRef = useRef(false);
  const selectedRef = useRef([]);
  const directionRef = useRef(null);

  const generateGame = () => {
    const words = items.map((item) => item.word.trim().toUpperCase()).filter((word) => word);

    if (words.length === 0) {
      return;
    }

    const result = generateWordSearch(words, 12);
    setGrid(result.grid);
    setPlacements(result.placements);
    setFoundCells([]);
    setFoundWords([]);
    setSelectedCells([]);
    setShowPreview(true);
  };

  useEffect(() => {
    generateGame();
    // keep explicit background value rather than auto-switching based on items
  }, []);

  useEffect(() => {
    if (!background) {
      setTextColor("#000");
      setHelperTextColor("rgba(0, 0, 0, 0.72)");
      return;
    }

    getBrightness(background).then((brightness) => {
      if (brightness < 128) {
        setTextColor("#fff");
        setHelperTextColor("rgba(255, 255, 255, 0.82)");
      } else {
        setTextColor("#000");
        setHelperTextColor("rgba(0, 0, 0, 0.72)");
      }
    }).catch(() => {
      setTextColor("#000");
      setHelperTextColor("rgba(0, 0, 0, 0.72)");
    });
  }, [background]);

  const extendSelection = (row, col) => {
    if (!isDraggingRef.current) {
      return;
    }

    const index = selectedRef.current.findIndex(
      (cell) => cell.row === row && cell.col === col
    );

    if (index !== -1) {
      selectedRef.current = selectedRef.current.slice(0, index + 1);
      setSelectedCells([...selectedRef.current]);
      return;
    }

    const last = selectedRef.current[selectedRef.current.length - 1];
    if (!last) {
      return;
    }

    const dx = col - last.col;
    const dy = row - last.row;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      return;
    }

    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    if (selectedRef.current.length === 1) {
      directionRef.current = { dx: stepX, dy: stepY };
      selectedRef.current.push({ row, col });
      setSelectedCells([...selectedRef.current]);
      return;
    }

    if (!directionRef.current) {
      return;
    }

    if (stepX !== directionRef.current.dx || stepY !== directionRef.current.dy) {
      return;
    }

    selectedRef.current.push({ row, col });
    setSelectedCells([...selectedRef.current]);
  };

  const handlePointerDown = (row, col, pointerType = "mouse") => {
    isDraggingRef.current = true;
    const cell = { row, col };
    selectedRef.current = [cell];
    setSelectedCells([cell]);
    directionRef.current = null;
  };

  const handlePointerEnter = (row, col) => {
    extendSelection(row, col);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const cell = target?.closest?.("[data-word-cell='true']");
    if (!cell) {
      return;
    }

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) {
      return;
    }

    extendSelection(row, col);
  };

  const checkWord = (cells) => {
    const coords = cells.map((cell) => ({
      row: cell.row ?? +cell.dataset.row,
      col: cell.col ?? +cell.dataset.col
    }));

    for (const placement of placements) {
      if (coords.length !== placement.positions.length) {
        continue;
      }

      const forwardMatch = placement.positions.every(
        (pos, index) => pos.row === coords[index].row && pos.col === coords[index].col
      );
      if (forwardMatch) {
        return placement.word;
      }

      const backwardMatch = placement.positions.every((pos, index) => {
        const reverseIndex = coords.length - 1 - index;
        return (
          pos.row === coords[reverseIndex].row &&
          pos.col === coords[reverseIndex].col
        );
      });
      if (backwardMatch) {
        return placement.word;
      }
    }

    return null;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    const foundWord = checkWord(selectedRef.current);

    if (foundWord) {
      const placement = placements.find((item) => item.word === foundWord);
      if (placement) {
        setFoundCells((prev) => [...prev, ...placement.positions]);
        setFoundWords((prev) => [...prev, foundWord]);
      }
    }

    selectedRef.current = [];
    setSelectedCells([]);
    directionRef.current = null;
  };

  return (
    <div className="game-page">
      {showPreview && (
        <GamePreview
          grid={grid}
          items={items}
          background={background}
          textColor={textColor}
          helperTextColor={helperTextColor}
          selectedCells={selectedCells}
          foundCells={foundCells}
          foundWords={foundWords}
          onPointerDown={handlePointerDown}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}
    </div>
  );
}
