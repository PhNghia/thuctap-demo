import { useRef, useState } from "react";
import BackgroundUpload from "../components/Builder/BackgroundUpload";
import ItemsForm from "../components/Builder/ItemsForm";
import GamePreview from "../components/Game/GamePreview";
import { generateWordSearch } from "../engine/generateWordSearch";
import { exportHTML } from "../utils/exportHTML";
import { importHTML } from "../utils/importHTML";
import { getBrightness } from "../utils/imageUtils";

export default function WordSearchPage() {
  const [items, setItems] = useState([]);
  const [grid, setGrid] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [background, setBackground] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [textColor, setTextColor] = useState("#000");
  const [helperTextColor, setHelperTextColor] = useState("rgba(0, 0, 0, 0.72)");
  const [selectedCells, setSelectedCells] = useState([]);
  const isDraggingRef = useRef(false);
  const selectedRef = useRef([]);
  const directionRef = useRef(null);
  const importInputRef = useRef(null);
  const activePointerTypeRef = useRef(null);

  const resetGameState = () => {
    selectedRef.current = [];
    directionRef.current = null;
    isDraggingRef.current = false;
    activePointerTypeRef.current = null;

    setSelectedCells([]);
    setFoundCells([]);
    setFoundWords([]);
  };

  const updateTextColorFromBackground = async (base64) => {
    if (!base64) {
      setTextColor("#000");
      setHelperTextColor("rgba(0, 0, 0, 0.72)");
      return;
    }

    const brightness = await getBrightness(base64);
    setTextColor(brightness < 128 ? "#fff" : "#000");
    setHelperTextColor(
      brightness < 128 ? "rgba(255, 255, 255, 0.82)" : "rgba(0, 0, 0, 0.72)"
    );
  };

  const handleAddCard = () => {
    setItems((prev) => [
      ...prev,
      {
        word: "",
        image: null
      }
    ]);
  };

  const handleGenerate = () => {
    const words = items
      .map((item) => item.word.trim().toUpperCase())
      .filter((word) => word !== "");

    if (words.length === 0) {
      alert("Please add at least one word.");
      return;
    }

    const result = generateWordSearch(words, 12);
    setGrid(result.grid);
    setPlacements(result.placements);
    resetGameState();
    setShowPreview(true);
  };

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
    activePointerTypeRef.current = pointerType;

    const cell = { row, col };
    selectedRef.current = [cell];
    setSelectedCells([cell]);
    directionRef.current = null;
  };

  const handlePointerEnter = (row, col) => {
    if (activePointerTypeRef.current !== "mouse") {
      return;
    }

    extendSelection(row, col);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || activePointerTypeRef.current === "mouse") {
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
    activePointerTypeRef.current = null;
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

  const handleBackgroundFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image allowed");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result;
      setBackground(base64);
      await updateTextColorFromBackground(base64);
    };

    reader.readAsDataURL(file);
  };

  const handleItemImage = (file, index) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image allowed");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;

      setItems((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index ? { ...item, image: base64 } : item
        )
      );
    };

    reader.readAsDataURL(file);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const data = await importHTML(file);
      setItems(data.items);
      setGrid(data.grid);
      setPlacements(data.placements);
      setBackground(data.background);
      await updateTextColorFromBackground(data.background);

      resetGameState();
      setShowPreview(data.grid.length > 0);
    } catch (error) {
      alert(error.message || "Import HTML failed.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="game-page">
      <div className="center-content">
        <h3>Word Search Puzzle</h3>

        <BackgroundUpload
          background={background}
          onUpload={handleBackgroundFile}
        />

        <ItemsForm
          items={items}
          setItems={setItems}
          handleItemImage={handleItemImage}
          handleAddCard={handleAddCard}
        />

        <div className="toolbar">
          <div className="toolbar button">
            <button onClick={handleGenerate}>Generate</button>
            <button onClick={() => importInputRef.current?.click()}>
              Import HTML
            </button>
            <button
              onClick={() =>
                exportHTML({
                  grid,
                  items,
                  placements,
                  background,
                  textColor,
                  helperTextColor
                })
              }
            >
              Export
            </button>

            <input
              ref={importInputRef}
              type="file"
              accept=".html,text/html"
              hidden
              onChange={handleImportFile}
            />
          </div>
        </div>
      </div>

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
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
