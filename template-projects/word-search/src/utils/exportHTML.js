function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value ?? "");
}

function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item";
}

function getExtensionFromMime(mimeType) {
  const fallback = "png";

  if (!mimeType) {
    return fallback;
  }

  const extension = mimeType.split("/")[1]?.split("+")[0];
  return extension || fallback;
}

function getMimeTypeFromDataUrl(dataUrl) {
  const match = /^data:([^;,]+)[;,]/i.exec(dataUrl || "");
  return match?.[1] || "image/png";
}

async function dataUrlToBytes(dataUrl) {
  const response = await fetch(dataUrl);
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    mimeType: response.headers.get("content-type")
  };
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed."));
    image.src = src;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Blob read failed."));
    reader.readAsDataURL(blob);
  });
}

async function optimizeDataUrlImage(
  dataUrl,
  { maxWidth, maxHeight, quality = 0.82, targetMimeType = "image/webp" }
) {
  const sourceMimeType = getMimeTypeFromDataUrl(dataUrl);

  if (sourceMimeType === "image/svg+xml" || sourceMimeType === "image/gif") {
    const original = await dataUrlToBytes(dataUrl);
    return {
      bytes: original.bytes,
      mimeType: original.mimeType || sourceMimeType,
      dataUrl
    };
  }

  const image = await loadImageElement(dataUrl);
  const sourceWidth = image.naturalWidth || image.width || maxWidth;
  const sourceHeight = image.naturalHeight || image.height || maxHeight;
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, targetMimeType, quality)
  );

  if (!blob) {
    const original = await dataUrlToBytes(dataUrl);
    return {
      bytes: original.bytes,
      mimeType: original.mimeType || sourceMimeType,
      dataUrl
    };
  }

  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    mimeType: blob.type || targetMimeType,
    dataUrl: await blobToDataUrl(blob)
  };
}

async function prepareAssetFile(imageSource, fileStem, optimizeOptions) {
  if (typeof imageSource !== "string" || !imageSource) {
    return {
      publicPath: null,
      assetFile: null,
      fallbackSource: null
    };
  }

  if (!imageSource.startsWith("data:")) {
    return {
      publicPath: imageSource,
      assetFile: null,
      fallbackSource: null
    };
  }

  const optimized = await optimizeDataUrlImage(imageSource, optimizeOptions);
  const { bytes, mimeType } = optimized;
  const extension = getExtensionFromMime(mimeType);
  const fileName = `${fileStem}.${extension}`;

  return {
    publicPath: `./assets/${fileName}`,
    assetFile: {
      path: `assets/${fileName}`,
      bytes
    },
    fallbackSource: optimized.dataUrl
  };
}

async function createExportData(data) {
  const assetFiles = [];
  const preparedItems = [];

  for (let index = 0; index < data.items.length; index += 1) {
    const item = data.items[index];
    const preparedImage = await prepareAssetFile(
      item.image,
      `${String(index + 1).padStart(2, "0")}-${slugify(item.word)}`,
      { maxWidth: 160, maxHeight: 160, quality: 0.76 }
    );

    if (preparedImage.assetFile) {
      assetFiles.push(preparedImage.assetFile);
    }

    preparedItems.push({
      ...item,
      image: preparedImage.publicPath,
      imageFallback: preparedImage.fallbackSource
    });
  }

  const preparedBackground = await prepareAssetFile(data.background, "background", {
    maxWidth: 1440,
    maxHeight: 1440,
    quality: 0.84
  });

  if (preparedBackground.assetFile) {
    assetFiles.push(preparedBackground.assetFile);
  }

  return {
    exportData: {
      ...data,
      items: preparedItems,
      background: preparedBackground.publicPath,
      backgroundFallback: preparedBackground.fallbackSource
    },
    assetFiles
  };
}

function renderGrid(grid) {
  return grid
    .map((row, rowIndex) =>
      row
        .map(
          (letter, colIndex) => `
      <div class="cell" data-word-cell="true" data-row="${rowIndex}" data-col="${colIndex}">
        ${escapeHtml(letter)}
      </div>`
        )
        .join("")
    )
    .join("");
}

function renderImages(items) {
  return items
    .map(
      (item) => `
      <div class="hint" data-word-hint="${escapeAttr(item.word)}">
        ${
          item.image
            ? `<img src="${escapeAttr(item.image)}" alt="${escapeAttr(
                item.word
              )}" data-fallback-src="${escapeAttr(item.imageFallback || "")}" />`
            : `<div class="hint-placeholder">No image</div>`
        }
        <p class="hidden-word" data-word-label="${escapeAttr(item.word)}">${escapeHtml(
          item.word
        )}</p>
      </div>`
    )
    .join("");
}

function buildExportHtml(data) {
  const columnCount = data.grid[0]?.length || 12;
  const backgroundStyle = data.background || data.backgroundFallback;
  const overlayStyle = backgroundStyle
    ? `background: url('${escapeAttr(
        backgroundStyle
      )}') center / cover no-repeat; color: ${data.textColor};`
    : `background: #fff; color: ${data.textColor};`;
  const helperStyle = `color: ${escapeAttr(
    data.helperTextColor || "rgba(0, 0, 0, 0.72)"
  )};`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Word Search Game</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
    }

    body {
      font-family: Arial, sans-serif;
      background: #fff;
    }

    .game-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 40px;
      flex-wrap: nowrap;
      margin-top: 20px;
      width: 100%;
    }

    .grid-shell {
      width: auto;
      max-width: 100%;
      flex: 0 0 auto;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 8px;
      touch-action: none;
    }

    .grid {
      --cell-size: 40px;
      --cell-gap: 5px;
      --grid-padding: 10px;
      display: grid;
      grid-template-columns: repeat(${columnCount}, var(--cell-size));
      gap: var(--cell-gap);
      padding: var(--grid-padding);
      width: fit-content;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.82);
      border-radius: 12px;
    }

    .cell {
      width: var(--cell-size);
      height: var(--cell-size);
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
      background: white;
      color: black;
      border: 1px solid #ddd;
      user-select: none;
      cursor: pointer;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s ease, outline-color 0.12s ease;
    }

    .cell:hover {
      background: #e3f2fd;
    }

    .cell.selected {
      background: #ffd54f;
    }

    .cell.found {
      background: #81c784;
      outline: 2px solid green;
    }

    .image-hints {
      width: fit-content;
      max-width: 360px;
      display: grid;
      grid-template-columns: repeat(3, minmax(78px, 78px));
      column-gap: 14px;
      row-gap: 14px;
      align-items: start;
      justify-items: center;
    }

    .hint {
      width: fit-content;
      max-width: 78px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
      padding: 8px;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.82);
      border-radius: 12px;
      color: #172033;
    }

    .hint img,
    .hint-placeholder {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 10px;
      margin: 0 auto;
      display: block;
      flex-shrink: 0;
    }

    .hint-placeholder {
      background: rgba(0, 0, 0, 0.08);
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .hint p {
      margin: 0;
      font-weight: 600;
      color: inherit;
      word-break: break-word;
      max-width: 72px;
    }

    .hidden-word {
      visibility: hidden;
    }

    .found-hint {
      border: 2px solid #4caf50;
      background: rgba(129, 199, 132, 0.2);
      color: #1f5f2a;
    }

    .overlay {
      min-height: 100dvh;
      display: flex;
    }

    .overlay-content {
      position: relative;
      width: 100%;
      min-height: 100dvh;
      box-sizing: border-box;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-size: cover;
      background-position: center;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .game-title {
      margin: 0 0 8px;
      text-align: center;
    }

    .game-helper {
      margin: 0 0 16px;
      text-align: center;
      font-size: 14px;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .overlay-content {
        padding: 20px 12px;
      }

      .game-title {
        margin-bottom: 8px;
        font-size: 24px;
      }

      .game-helper {
        margin-bottom: 12px;
        white-space: normal;
      }

      .game-wrapper {
        gap: 20px;
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;
      }

      .grid {
        --cell-gap: 3px;
        --grid-padding: 6px;
        --cell-size: clamp(
          20px,
          calc((100vw - 24px - 12px - ${(columnCount - 1) * 3}px) / ${columnCount}),
          32px
        );
        font-size: 15px;
      }

      .image-hints {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
        column-gap: 12px;
        row-gap: 12px;
        align-items: stretch;
      }

      .grid-shell {
        width: 100%;
      }

      .hint {
        width: 100%;
        max-width: none;
        padding: 8px;
        gap: 5px;
        font-size: 12px;
        background: transparent;
      }

      .hint img,
      .hint-placeholder {
        width: 70px;
        height: 70px;
      }

      .hint p {
        max-width: none;
      }

      .found-hint {
        border-width: 1px;
      }
    }
  </style>
</head>
<body>
  <div class="overlay">
    <div
      class="overlay-content"
      style="${overlayStyle}"
      data-background-src="${escapeAttr(data.background || "")}"
      data-background-fallback="${escapeAttr(data.backgroundFallback || "")}"
    >
      <h2 class="game-title">Word Search Game</h2>
      <p class="game-helper" style="${helperStyle}">
        Drag across the grid to find words. On phones, swipe directly on the letters.
      </p>
      <div class="game-wrapper">
        <div class="grid-shell" id="grid-shell">
          <div id="grid" class="grid">
            ${renderGrid(data.grid)}
          </div>
        </div>
        <div id="images" class="image-hints">
          ${renderImages(data.items)}
        </div>
      </div>
    </div>
  </div>
  <script id="game-data" type="application/json">
${JSON.stringify(data).replace(/<\/script>/g, "<\\/script>")}
  </script>
  <script>
    const raw = document.getElementById("game-data").textContent;
    const data = JSON.parse(raw);
    const gridShell = document.getElementById("grid-shell");
    const helperText = document.querySelector(".game-helper");
    const overlayContent = document.querySelector(".overlay-content");
    let isDragging = false;
    let selected = [];
    let direction = null;
    let activeInputMode = null;

    function getBrightness(imageSrc, callback) {
      const img = new Image();
      img.src = imageSrc;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const w = 50;
        const h = 50;

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h).data;
        let r = 0;
        let g = 0;
        let b = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        const pixels = imageData.length / 4;
        r /= pixels;
        g /= pixels;
        b /= pixels;

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        callback(brightness);
      };
    }

    document.querySelectorAll("img[data-fallback-src]").forEach((image) => {
      const fallbackSrc = image.getAttribute("data-fallback-src");

      if (!fallbackSrc) return;

      image.addEventListener(
        "error",
        () => {
          if (image.src !== fallbackSrc) {
            image.src = fallbackSrc;
          }
        },
        { once: true }
      );
    });

    function ensureBackground() {
      if (!overlayContent) return;

      const assetSrc = overlayContent.getAttribute("data-background-src");
      const fallbackSrc = overlayContent.getAttribute("data-background-fallback");

      if (!assetSrc || !fallbackSrc || assetSrc === fallbackSrc) {
        return;
      }

      const probe = new Image();

      probe.onload = function () {};
      probe.onerror = function () {
        overlayContent.style.background =
          "url('" + fallbackSrc.replace(/'/g, "\\'") + "') center / cover no-repeat";
      };
      probe.src = assetSrc;
    }

    ensureBackground();

    const brightnessSource = data.backgroundFallback || data.background;

    if (brightnessSource && helperText) {
      getBrightness(brightnessSource, (brightness) => {
        helperText.style.color =
          brightness < 128 ? "rgba(255, 255, 255, 0.82)" : "rgba(0, 0, 0, 0.72)";
      });
    }

    function getCellFromPoint(clientX, clientY) {
      const target = document.elementFromPoint(clientX, clientY);
      return target && target.closest("[data-word-cell='true']");
    }

    function beginSelection(cell, inputMode) {
      if (!cell) return;

      isDragging = true;
      activeInputMode = inputMode;
      direction = null;
      selected = [cell];

      document.querySelectorAll(".cell.selected").forEach((item) => {
        item.classList.remove("selected");
      });

      cell.classList.add("selected");
    }

    function extendSelection(cell) {
      if (!isDragging || !cell) return;

      const row = +cell.dataset.row;
      const col = +cell.dataset.col;
      const index = selected.findIndex(
        (item) => +item.dataset.row === row && +item.dataset.col === col
      );

      if (index !== -1) {
        selected.slice(index + 1).forEach((item) => item.classList.remove("selected"));
        selected = selected.slice(0, index + 1);
        return;
      }

      const last = selected[selected.length - 1];
      if (!last) return;

      const lastRow = +last.dataset.row;
      const lastCol = +last.dataset.col;
      const dx = col - lastCol;
      const dy = row - lastRow;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

      const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
      const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

      if (selected.length === 1) {
        direction = { dx: stepX, dy: stepY };
        selected.push(cell);
        cell.classList.add("selected");
        return;
      }

      if (!direction) return;
      if (stepX !== direction.dx || stepY !== direction.dy) return;

      selected.push(cell);
      cell.classList.add("selected");
    }

    function finishSelection() {
      if (!isDragging) return;

      isDragging = false;
      activeInputMode = null;
      direction = null;

      const coords = selected.map((cell) => ({
        row: +cell.dataset.row,
        col: +cell.dataset.col
      }));

      const found = data.placements.find((placement) => {
        if (placement.positions.length !== coords.length) return false;

        const forwardMatch = placement.positions.every((pos, index) =>
          pos.row === coords[index].row && pos.col === coords[index].col
        );

        if (forwardMatch) return true;

        return placement.positions.every((pos, index) => {
          const reverseIndex = coords.length - 1 - index;
          return (
            pos.row === coords[reverseIndex].row &&
            pos.col === coords[reverseIndex].col
          );
        });
      });

      if (found) {
        selected.forEach((cell) => {
          cell.classList.remove("selected");
          cell.classList.add("found");
        });

        const label = document.querySelector(
          '[data-word-label="' + CSS.escape(found.word) + '"]'
        );
        const hint = document.querySelector(
          '[data-word-hint="' + CSS.escape(found.word) + '"]'
        );

        if (label) {
          label.classList.remove("hidden-word");
        }

        if (hint) {
          hint.classList.add("found-hint");
        }
      } else {
        selected.forEach((cell) => cell.classList.remove("selected"));
      }

      selected = [];
    }

    document.querySelectorAll(".cell").forEach((cell) => {
      cell.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") return;
        beginSelection(cell, "pointer");
      });

      cell.addEventListener("pointerenter", () => {
        if (activeInputMode !== "pointer") return;
        extendSelection(cell);
      });
    });

    gridShell.addEventListener("pointermove", (event) => {
      if (activeInputMode !== "pointer") return;
      const cell = getCellFromPoint(event.clientX, event.clientY);
      extendSelection(cell);
    });

    gridShell.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        const cell = getCellFromPoint(touch.clientX, touch.clientY);
        if (!cell) return;

        event.preventDefault();
        beginSelection(cell, "touch");
      },
      { passive: false }
    );

    gridShell.addEventListener(
      "touchmove",
      (event) => {
        if (activeInputMode !== "touch") return;

        const touch = event.touches[0];
        if (!touch) return;

        event.preventDefault();
        const cell = getCellFromPoint(touch.clientX, touch.clientY);
        extendSelection(cell);
      },
      { passive: false }
    );

    gridShell.addEventListener("touchend", finishSelection);
    gridShell.addEventListener("touchcancel", finishSelection);
    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", finishSelection);
  </script>
</body>
</html>`;
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function exportHTML(data) {
  const safeData = {
    grid: Array.isArray(data?.grid) ? data.grid : [],
    items: Array.isArray(data?.items) ? data.items : [],
    placements: Array.isArray(data?.placements) ? data.placements : [],
    background: typeof data?.background === "string" ? data.background : null,
    textColor: typeof data?.textColor === "string" ? data.textColor : "#000",
    helperTextColor:
      typeof data?.helperTextColor === "string"
        ? data.helperTextColor
        : "rgba(0, 0, 0, 0.72)"
  };

  try {
    const { default: JSZip } = await import("jszip");
    const { exportData, assetFiles } = await createExportData(safeData);
    const htmlContent = buildExportHtml(exportData);
    const zip = new JSZip();

    zip.file("index.html", htmlContent);
    assetFiles.forEach((asset) => {
      zip.file(asset.path, asset.bytes);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "word-search-export.zip");
  } catch (error) {
    console.error(error);
    alert("Export ZIP failed.");
  }
}
