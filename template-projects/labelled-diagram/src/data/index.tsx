import type { DiagramData } from "../types/diagram";

// export const DIAGRAM_DATA: DiagramData = {
//   id: "body",
//   name: "Cơ thể người",
//   imagePath: "",

//   labels: [],
//   zones: [],
// };

export const DIAGRAM_DATA = {
  id: "body",
  name: "Test",
  imagePath: "/assets/images/human/Akari.png",

  labels: [
    { id: "1", name: "Head" },
    { id: "2", name: "Arm" },
  ],

  zones: [
    { id: "z1", x: 50, y: 20, correctLabelId: "1" },
    { id: "z2", x: 30, y: 60, correctLabelId: "2" },
  ],
};