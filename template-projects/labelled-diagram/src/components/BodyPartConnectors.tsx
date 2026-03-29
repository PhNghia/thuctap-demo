import React, { useEffect, useRef } from "react";
import type { Zone, Label } from "../types/diagram";

interface ConnectorProps {
  zones: Zone[];
  placed: Record<string, string>;
  labelsMap: Map<string, Label>;
  containerWidth: number;
  containerHeight: number;
}

export const BodyPartConnectors: React.FC<ConnectorProps> = ({
  zones,
  placed,
  labelsMap,
  containerWidth,
  containerHeight,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const svg = canvasRef.current;
    svg.innerHTML = ""; // Clear previous connectors

    // Draw connectors for placed labels
    Object.entries(placed).forEach(([zoneId, labelId]) => {
      const zone = zones.find((z) => z.id === zoneId);
      const label = labelsMap.get(labelId);

      if (!zone || !label) return;

      const startX = (zone.x / 100) * containerWidth;
      const startY = (zone.y / 100) * containerHeight;

      const labelIndex = Array.from(labelsMap.values()).indexOf(label);
      const labelSpacing = 120;
      const sidebarX = 50;
      const sidebarY = 60 + labelIndex * labelSpacing;

      const isCorrect = zone.correctLabelId === labelId;
      const strokeColor = isCorrect ? "#22c55e" : "#ef4444";
      const strokeWidth = isCorrect ? 3 : 2;
      const strokeDasharray = isCorrect ? "0" : "5,5";

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(sidebarX));
      line.setAttribute("y1", String(sidebarY));
      line.setAttribute("x2", String(startX));
      line.setAttribute("y2", String(startY));
      line.setAttribute("stroke", strokeColor);
      line.setAttribute("stroke-width", String(strokeWidth));
      line.setAttribute("stroke-dasharray", strokeDasharray);
      line.setAttribute("opacity", "0.7");
      line.setAttribute("pointer-events", "none");

      if (isCorrect) {
        line.setAttribute("marker-end", "url(#arrowhead-green)");
      }

      svg.appendChild(line);

      const midX = (sidebarX + startX) / 2;
      const midY = (sidebarY + startY) / 2;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", String(midX));
      text.setAttribute("y", String(midY - 5));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "11px");
      text.setAttribute("fill", strokeColor);
      text.setAttribute("font-weight", isCorrect ? "bold" : "normal");
      text.setAttribute("pointer-events", "none");
      text.textContent = isCorrect ? "✓" : "✗";

      svg.appendChild(text);
    });

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const markerGreen = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    markerGreen.setAttribute("id", "arrowhead-green");
    markerGreen.setAttribute("markerWidth", "10");
    markerGreen.setAttribute("markerHeight", "10");
    markerGreen.setAttribute("refX", "9");
    markerGreen.setAttribute("refY", "3");
    markerGreen.setAttribute("orient", "auto");

    const polygonGreen = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygonGreen.setAttribute("points", "0 0, 10 3, 0 6");
    polygonGreen.setAttribute("fill", "#22c55e");

    markerGreen.appendChild(polygonGreen);
    defs.appendChild(markerGreen);

    if (svg.querySelector("defs")) {
      svg.querySelector("defs")?.remove();
    }
    svg.insertBefore(defs, svg.firstChild);
  }, [placed, zones, labelsMap, containerWidth, containerHeight]);

  return (
    <svg
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none hidden"
      style={{
        width: containerWidth,
        height: containerHeight,
        zIndex: 10,
      }}
    />
  );
};

export default BodyPartConnectors;
