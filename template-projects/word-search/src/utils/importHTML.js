import { getBrightness } from "./imageUtils";

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    word: typeof item?.word === "string" ? item.word.toUpperCase() : "",
    image:
      typeof item?.imageFallback === "string" && item.imageFallback
        ? item.imageFallback
        : typeof item?.image === "string"
          ? item.image
          : null
  }));
}

function normalizeImportedData(rawData) {
  return {
    grid: Array.isArray(rawData?.grid) ? rawData.grid : [],
    placements: Array.isArray(rawData?.placements) ? rawData.placements : [],
    items: normalizeItems(rawData?.items),
    background:
      typeof rawData?.backgroundFallback === "string" && rawData.backgroundFallback
        ? rawData.backgroundFallback
        : typeof rawData?.background === "string"
          ? rawData.background
          : null,
    textColor: typeof rawData?.textColor === "string" ? rawData.textColor : "#000"
  };
}

export async function importHTML(file) {
  const html = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const dataNode = doc.getElementById("game-data");

  if (!dataNode?.textContent) {
    throw new Error("Khong tim thay du lieu game trong file HTML.");
  }

  let rawData;

  try {
    rawData = JSON.parse(dataNode.textContent);
  } catch {
    throw new Error("Noi dung game-data khong hop le.");
  }

  const data = normalizeImportedData(rawData);

  if (data.background) {
    const brightness = await getBrightness(data.background);
    data.textColor = brightness < 128 ? "#fff" : "#000";
  }

  return data;
}
