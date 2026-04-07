import { useEffect, useState } from "react";
import DiagramGame from "./components/DiagramGame";
import type { DiagramData } from "./types/diagram";

function App() {
  const [data, setData] = useState<DiagramData | null>(null);

  useEffect(() => {
    try {
      // 🔥 Lấy data từ Builder (khi export)
      let raw = (window as any).APP_DATA;

      // 🛠 DEV fallback (khi chạy yarn dev)
      if (!raw) {
        console.warn("⚠️ No APP_DATA found → using mock data");

        raw = {
          id: "dev-human",
          name: "Cơ thể người",
          image: "/assets/images/human/Akari.png",
          labels: [
            { id: 1, name: "Đầu" },
            { id: 2, name: "Ngực" },
            { id: 3, name: "Chân" }
          ],
          zones: [
            { id: 1, x: 30, y: 15, correctLabelId: 1 },
            { id: 2, x: 50, y: 40, correctLabelId: 2 },
            { id: 3, x: 45, y: 80, correctLabelId: 3 }
          ]
        };
      }

      console.log("🔥 RAW DATA:", raw);

      const mapped = mapAppData(raw);
      console.log("🎯 MAPPED:", mapped);

      setData(mapped);
    } catch (err) {
      console.error("❌ Load error:", err);
    }
  }, []);

  if (!data) return <div>Loading game...</div>;

  return <DiagramGame data={data} />;
}

export default App;



// =======================
// 🔥 Mapper
// =======================
const mapAppData = (appData: any): DiagramData => {
  return {
    id: appData?.id || "diagram-game",
    name: appData?.name || "Diagram Game",

    imagePath:
      appData?.image ||
      appData?.settings?.image ||
      appData?.background ||
      "/assets/images/human/Akari.png",

    labels: (appData?.labels || appData?.items || []).map(
      (item: any, index: number) => ({
        id: String(item.id ?? index),
        name: item.name || item.text || item.label || ""
      })
    ),

    zones: (appData?.zones || appData?.answers || []).map(
      (z: any, index: number) => ({
        id: String(z.id ?? index),
        x: Number(z.x ?? z.left ?? 0),
        y: Number(z.y ?? z.top ?? 0),
        correctLabelId: String(
          z.correctLabelId ?? z.answerId ?? z.labelId ?? ""
        )
      })
    )
  };
};