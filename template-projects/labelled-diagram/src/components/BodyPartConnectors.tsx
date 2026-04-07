import React from "react";
import type { DiagramData } from "../types/diagram";

interface Props {
  zones: DiagramData["zones"];
  placed: Record<string, string>;
  labelsMap: Map<string, any>;
  containerWidth: number;
  containerHeight: number;
}

/**
 * 🔥 Connector đã bị disable hoàn toàn
 * Lý do:
 * - Game chạy bằng builder (không cần annotation)
 * - Tránh render SVG thừa
 * - Tăng performance
 */
const BodyPartConnectors: React.FC<Props> = () => {
  return null;
};

export default BodyPartConnectors;